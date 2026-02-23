// Hook du mode Endless — style Loldle
// Sélection aléatoire, comparaison par attribut, combo, vies

import { useState, useCallback } from 'react'
import gamesData    from '../data/games.json'
import limitedsData from '../data/limiteds.json'
import devsData     from '../data/devs.json'

const DATA     = { game: gamesData, limited: limitedsData, dev: devsData }
const MAX_LIVES = 3

function randomItem(data, playedIds) {
  const pool = data.filter(item => !playedIds.includes(item.id))
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

function norm(s) { return String(s ?? '').trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ') }
function cStr(g, a) { return { value: g, display: String(g ?? ''), status: norm(g) === norm(a) ? 'correct' : 'wrong' } }
function cBool(g, a, d) { return { value: g, display: d, status: g === a ? 'correct' : 'wrong' } }
function cYear(g, a) {
  const diff = g - a
  const status = diff === 0 ? 'correct' : Math.abs(diff) <= 3 ? 'partial' : diff > 0 ? 'high' : 'low'
  return { value: g, display: String(g), status }
}
const VISIT_BUCKETS    = [0,100e6,300e6,500e6,700e6,1e9,1.5e9,2e9,3e9,4e9,5e9,6e9,7e9,8e9,10e9,20e9,30e9,Infinity]
const RAP_BUCKETS      = [0,100,500,1000,2000,5000,10000,20000,50000,100000,300000,600000,1000000,5000000,Infinity]
const FOLLOWER_BUCKETS = [0,50000,100000,200000,400000,600000,1000000,2000000,5000000,10000000,Infinity]
function bkt(n, b) { for (let i=0;i<b.length-1;i++) if (n>=b[i]&&n<b[i+1]) return i; return b.length-2 }
function cNum(g, a, d, b) {
  const diff = bkt(g,b)-bkt(a,b)
  const status = diff===0?'correct':Math.abs(diff)===1?'partial':diff>0?'high':'low'
  return { value: g, display: d ?? String(g), status }
}

function buildComparison(mode, guessed, answer) {
  if (mode === 'game') return {
    genre:   cStr(guessed.genre,      answer.genre),
    year:    cYear(guessed.year,       answer.year),
    visits:  cNum(guessed.visits_num, answer.visits_num, guessed.visits_label, VISIT_BUCKETS),
    creator: cStr(guessed.creator,    answer.creator),
    free:    cBool(guessed.free,       answer.free, guessed.free ? 'Gratuit' : 'Payant'),
  }
  if (mode === 'limited') return {
    type:   cStr(guessed.type,    answer.type),
    year:   cYear(guessed.year,   answer.year),
    rap:    cNum(guessed.rap_num, answer.rap_num, guessed.rap_label, RAP_BUCKETS),
    rarity: cStr(guessed.rarity,  answer.rarity),
  }
  if (mode === 'dev') return {
    genre:     cStr(guessed.genre,         answer.genre),
    year:      cYear(guessed.year_joined,   answer.year_joined),
    followers: cNum(guessed.followers_num, answer.followers_num, guessed.followers_label, FOLLOWER_BUCKETS),
    known_for: cStr(guessed.known_for,     answer.known_for),
  }
  return {}
}

function calcEndlessScore(guessesUsed, combo) {
  const base = Math.max(100, 700 - guessesUsed * 100)
  const mult = Math.min(1 + combo * 0.25, 3.0)
  return Math.floor(base * mult)
}

export function useEndless(mode) {
  const [score,     setScore]   = useState(0)
  const [combo,     setCombo]   = useState(0)
  const [maxCombo,  setMaxCombo]= useState(0)
  const [lives,     setLives]   = useState(MAX_LIVES)
  const [rounds,    setRounds]  = useState(0)
  const [playedIds, setPlayed]  = useState([])
  const [gameOver,  setGameOver]= useState(false)
  const [shaking,   setShaking] = useState(false)

  const [current, setCurrent] = useState(() => {
    const item = randomItem(DATA[mode] ?? [], [])
    return item ? { ...item, rows: [], finished: false, won: false } : null
  })

  const submitGuess = useCallback((guess) => {
    if (!current || current.finished || gameOver) return

    const data    = DATA[mode] ?? []
    const guessed = data.find(item => norm(item.name) === norm(guess))
    if (!guessed) {
      setShaking(true)
      setTimeout(() => setShaking(false), 450)
      return { error: 'Introuvable' }
    }

    const correct    = guessed.id === current.id
    const comparison = buildComparison(mode, guessed, current)
    const thumbnail  = guessed.thumbnail ?? guessed.image ?? null
    const newRow     = { name: guessed.name, thumbnail, comparison }
    const newRows    = [...current.rows, newRow]

    if (correct) {
      const newCombo = combo + 1
      const gained   = calcEndlessScore(newRows.length, newCombo)
      const newMax   = Math.max(maxCombo, newCombo)
      setScore(s => s + gained)
      setCombo(newCombo)
      setMaxCombo(newMax)
      setRounds(r => r + 1)
      setPlayed(p => [...p, current.id])
      setCurrent(prev => ({ ...prev, rows: newRows, finished: true, won: true }))
      setTimeout(() => {
        const next = randomItem(DATA[mode] ?? [], [...playedIds, current.id])
        if (!next) return setGameOver(true)
        setCurrent({ ...next, rows: [], finished: false, won: false })
      }, 1500)
      return { correct: true, gained }
    } else {
      setShaking(true)
      setTimeout(() => setShaking(false), 450)
      setCurrent(prev => ({ ...prev, rows: newRows }))
      return { correct: false }
    }
  }, [current, combo, maxCombo, lives, gameOver, playedIds, mode])

  function giveUp() {
    if (!current || current.finished) return
    const newLives = lives - 1
    setLives(newLives)
    setCombo(0)
    setRounds(r => r + 1)
    setPlayed(p => [...p, current.id])
    setCurrent(prev => ({ ...prev, finished: true, won: false }))
    if (newLives <= 0) {
      setTimeout(() => setGameOver(true), 1500)
    } else {
      setTimeout(() => {
        const next = randomItem(DATA[mode] ?? [], [...playedIds, current.id])
        if (!next) return setGameOver(true)
        setCurrent({ ...next, rows: [], finished: false, won: false })
      }, 1500)
    }
  }

  function restart() {
    const item = randomItem(DATA[mode] ?? [], [])
    setScore(0); setCombo(0); setMaxCombo(0); setLives(MAX_LIVES)
    setRounds(0); setPlayed([]); setGameOver(false)
    setCurrent(item ? { ...item, rows: [], finished: false, won: false } : null)
  }

  return {
    score, combo, maxCombo, lives, rounds, gameOver, shaking,
    current,
    submitGuess, giveUp, restart,
    comboMultiplier: Math.min(1 + combo * 0.25, 3.0),
    alreadyGuessed:  current?.rows?.map(r => r.name) ?? [],
  }
}
