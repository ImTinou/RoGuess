// Hook du mode Endless
// Gère : sélection aléatoire, combo, lives, score, session

import { useState, useCallback, useRef } from 'react'
import gamesData    from '../data/games.json'
import limitedsData from '../data/limiteds.json'
import devsData     from '../data/devs.json'

const DATA     = { game: gamesData, limited: limitedsData, dev: devsData }
const MAX_LIVES = 3

function randomItem(data, playedIds) {
  const pool = data.filter(item => !playedIds.includes(item.id))
  if (!pool.length) return null // toutes les entrées jouées
  return pool[Math.floor(Math.random() * pool.length)]
}

function calcEndlessScore(hintsUsed, combo) {
  const base = (7 - Math.max(1, Math.min(6, hintsUsed))) * 100
  const mult = Math.min(1 + combo * 0.25, 3.0)
  return Math.floor(base * mult)
}

export function useEndless(mode) {
  const [score,     setScore]    = useState(0)
  const [combo,     setCombo]    = useState(0)
  const [maxCombo,  setMaxCombo] = useState(0)
  const [lives,     setLives]    = useState(MAX_LIVES)
  const [rounds,    setRounds]   = useState(0)
  const [playedIds, setPlayed]   = useState([])
  const [current,   setCurrent]  = useState(() => {
    const item = randomItem(DATA[mode] ?? [], [])
    return item ? { ...item, hintsRevealed: [1], guesses: [], finished: false } : null
  })
  const [gameOver,  setGameOver] = useState(false)
  const [shaking,   setShaking]  = useState(false)

  function getHints(item, n) {
    // Construit les hints à partir des données de l'item
    const hintMap = {
      game: {
        1: { label: 'Genre',              value: item.hints?.genre,            icon: '🎲' },
        2: { label: 'Année',              value: item.hints?.year,             icon: '📅' },
        3: { label: 'Visites',            value: item.hints?.visits_range,     icon: '👁️' },
        4: { label: 'Thumbnail',          value: { url: item.thumbnail, blurLevel: 'high' }, icon: '🖼️', isImage: true },
        5: { label: 'Description',        value: item.hints?.description,      icon: '📝' },
        6: { label: 'Initiales créateur', value: item.hints?.creator_initials, icon: '🔤' },
      },
      limited: {
        1: { label: 'Type',               value: item.hints?.type,             icon: '🏷️' },
        2: { label: 'Année',              value: item.hints?.year,             icon: '📅' },
        3: { label: 'Valeur RAP',         value: item.hints?.rap_range,        icon: '💰' },
        4: { label: 'Description',        value: item.hints?.description,      icon: '📝' },
        5: { label: 'Silhouette',         value: { url: item.image, silhouette: true }, icon: '👤', isImage: true },
        6: { label: 'Première lettre',    value: item.hints?.first_letter,     icon: '🔤' },
      },
      dev: {
        1: { label: 'Genre',              value: item.hints?.genre,            icon: '🎮' },
        2: { label: 'Année',              value: item.hints?.year_joined,      icon: '📅' },
        3: { label: 'Followers',          value: item.hints?.followers_range,  icon: '👥' },
        4: { label: 'Description',        value: item.hints?.description,      icon: '📝' },
        5: { label: 'Avatar',             value: { url: item.avatar, blurLevel: 'high' }, icon: '👤', isImage: true },
        6: { label: 'Initiales',          value: item.hints?.initials,         icon: '🔤' },
      },
    }
    return hintMap[mode]?.[n] ?? null
  }

  // Calcule hintsData pour le rendu
  function buildHintsData(item, hintsRevealed) {
    const hintsData = {}
    for (const n of hintsRevealed) {
      hintsData[n] = getHints(item, n)
    }
    return hintsData
  }

  const submitGuess = useCallback((guess) => {
    if (!current || current.finished || gameOver) return

    const normalize = s => s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
    const correct   = normalize(current.name) === normalize(guess)

    if (correct) {
      const hintsUsed = current.hintsRevealed.length
      const newCombo  = combo + 1
      const gained    = calcEndlessScore(hintsUsed, newCombo)
      const newMax    = Math.max(maxCombo, newCombo)

      setScore(s => s + gained)
      setCombo(newCombo)
      setMaxCombo(newMax)
      setRounds(r => r + 1)
      setPlayed(p => [...p, current.id])

      // Prochain item
      setTimeout(() => {
        const next = randomItem(DATA[mode] ?? [], [...playedIds, current.id])
        if (!next) return setGameOver(true)
        setCurrent({ ...next, hintsRevealed: [1], guesses: [], finished: false })
      }, 1200)

      setCurrent(prev => ({ ...prev, finished: true, won: true }))
      return { correct: true, gained }

    } else {
      setShaking(true)
      setTimeout(() => setShaking(false), 450)

      const newGuesses  = [...current.guesses, guess]
      const nextHintNum = current.hintsRevealed.length + 1

      if (newGuesses.length >= 6) {
        // Round perdu
        const newLives = lives - 1
        setLives(newLives)
        setCombo(0)
        setRounds(r => r + 1)
        setPlayed(p => [...p, current.id])

        if (newLives <= 0) {
          setCurrent(prev => ({ ...prev, guesses: newGuesses, finished: true, won: false }))
          setTimeout(() => setGameOver(true), 1500)
        } else {
          setCurrent(prev => ({ ...prev, guesses: newGuesses, finished: true, won: false }))
          setTimeout(() => {
            const next = randomItem(DATA[mode] ?? [], [...playedIds, current.id])
            if (!next) return setGameOver(true)
            setCurrent({ ...next, hintsRevealed: [1], guesses: [], finished: false })
          }, 1500)
        }
        return { correct: false, lostLife: true }
      }

      // Révèle prochain hint
      if (nextHintNum <= 6) {
        setCurrent(prev => ({
          ...prev,
          guesses:       newGuesses,
          hintsRevealed: [...prev.hintsRevealed, nextHintNum],
        }))
      } else {
        setCurrent(prev => ({ ...prev, guesses: newGuesses }))
      }

      return { correct: false }
    }
  }, [current, combo, maxCombo, lives, gameOver, playedIds, mode])

  function restart() {
    const item = randomItem(DATA[mode] ?? [], [])
    setScore(0); setCombo(0); setMaxCombo(0); setLives(MAX_LIVES)
    setRounds(0); setPlayed([]); setGameOver(false)
    setCurrent(item ? { ...item, hintsRevealed: [1], guesses: [], finished: false } : null)
  }

  const hintsData = current ? buildHintsData(current, current.hintsRevealed) : {}

  return {
    score, combo, maxCombo, lives, rounds, gameOver, shaking,
    current, hintsData,
    submitGuess, restart,
    comboMultiplier: Math.min(1 + combo * 0.25, 3.0),
  }
}
