// Hook central du moteur de jeu
// Gère : hints, guesses, timer, résultat, localStorage, appels API

import { useState, useEffect, useCallback, useRef } from 'react'
import { getTodayKey } from '../lib/daily'

const MAX_HINTS   = 6
const BASE_URL    = import.meta.env.DEV ? '' : ''

function storageKey(mode) {
  return `roguess_${mode}_${getTodayKey()}`
}

function initialState(mode) {
  return {
    mode,
    date:          getTodayKey(),
    hintsRevealed: [1],        // hint 1 toujours visible
    hintsData:     {},         // { 1: {label, icon, value}, 2: ... }
    guesses:       [],         // ['Brookhaven', 'Bloxburg', ...]
    won:           false,
    finished:      false,
    score:         0,
    timeTaken:     null,
  }
}

export function useGameState(mode) {
  const [state, setState]       = useState(null)   // null = loading
  const [shaking, setShaking]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const [submitting, setSubmit] = useState(false)
  const startTimeRef            = useRef(null)

  // ----- Chargement initial -----
  useEffect(() => {
    if (!mode) return
    loadState()
  }, [mode])

  async function loadState() {
    setLoading(true)
    const saved = loadFromStorage(mode)

    if (saved && saved.date === getTodayKey()) {
      setState(saved)
      setLoading(false)
      return
    }

    // Pas de sauvegarde → nouvelle partie
    const fresh = initialState(mode)
    // Récupère le hint 1
    try {
      const hint1 = await fetchHint(mode, 1)
      fresh.hintsData[1] = hint1
    } catch {
      // Continue sans le hint (affichera un fallback)
    }
    setState(fresh)
    saveToStorage(mode, fresh)
    startTimeRef.current = Date.now()
    setLoading(false)
  }

  // ----- Révéler le hint suivant -----
  const revealNextHint = useCallback(async () => {
    if (!state) return
    const nextN = Math.max(...state.hintsRevealed) + 1
    if (nextN > MAX_HINTS) return

    try {
      const hint = await fetchHint(mode, nextN)
      setState(prev => {
        const next = {
          ...prev,
          hintsRevealed: [...prev.hintsRevealed, nextN],
          hintsData:     { ...prev.hintsData, [nextN]: hint },
        }
        saveToStorage(mode, next)
        return next
      })
    } catch {
      console.error('Impossible de charger l\'indice', nextN)
    }
  }, [state, mode])

  // ----- Soumettre une guess -----
  const submitGuess = useCallback(async (guess) => {
    if (!state || state.finished || submitting) return { correct: false }
    setSubmit(true)

    try {
      const res = await fetch(`${BASE_URL}/api/game/guess`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mode, guess }),
      })
      const data = await res.json()

      if (data.correct) {
        // Victoire
        const timeTaken = startTimeRef.current
          ? Math.floor((Date.now() - startTimeRef.current) / 1000)
          : null
        const hintsUsed = state.hintsRevealed.length
        const score     = calcScore(hintsUsed, timeTaken)

        setState(prev => {
          const next = {
            ...prev,
            guesses:   [...prev.guesses, guess],
            won:       true,
            finished:  true,
            score,
            timeTaken,
          }
          saveToStorage(mode, next)
          return next
        })
        return { correct: true, score }

      } else {
        // Mauvaise réponse
        setShaking(true)
        setTimeout(() => setShaking(false), 450)

        const newGuesses   = [...state.guesses, guess]
        const hintsShown   = state.hintsRevealed.length
        const nextHintNum  = hintsShown + 1
        const gameOver     = newGuesses.length >= MAX_HINTS

        if (gameOver) {
          setState(prev => {
            const next = { ...prev, guesses: newGuesses, finished: true, won: false, score: 0 }
            saveToStorage(mode, next)
            return next
          })
          return { correct: false, gameOver: true }
        }

        // Révèle le prochain hint automatiquement
        if (nextHintNum <= MAX_HINTS && !state.hintsRevealed.includes(nextHintNum)) {
          const hint = await fetchHint(mode, nextHintNum)
          setState(prev => {
            const next = {
              ...prev,
              guesses:       newGuesses,
              hintsRevealed: [...prev.hintsRevealed, nextHintNum],
              hintsData:     { ...prev.hintsData, [nextHintNum]: hint },
            }
            saveToStorage(mode, next)
            return next
          })
        } else {
          setState(prev => {
            const next = { ...prev, guesses: newGuesses }
            saveToStorage(mode, next)
            return next
          })
        }

        return { correct: false, gameOver: false }
      }
    } finally {
      setSubmit(false)
    }
  }, [state, mode, submitting])

  return {
    state,
    loading,
    shaking,
    submitting,
    revealNextHint,
    submitGuess,
    isFinished:     state?.finished ?? false,
    hasWon:         state?.won ?? false,
    hintsCount:     state?.hintsRevealed.length ?? 1,
    attemptsLeft:   MAX_HINTS - (state?.guesses.length ?? 0),
  }
}

// ---- Helpers ----

async function fetchHint(mode, n) {
  const res = await fetch(`${BASE_URL}/api/game/hint?mode=${mode}&n=${n}`)
  if (!res.ok) throw new Error(`Hint ${n} introuvable`)
  return res.json()
}

function calcScore(hintsUsed, timeTaken) {
  const base = (7 - Math.max(1, Math.min(6, hintsUsed))) * 100
  const time = timeTaken ? Math.max(0, 60 - timeTaken) * 2 : 0
  return base + time
}

function loadFromStorage(mode) {
  try {
    const raw = localStorage.getItem(storageKey(mode))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveToStorage(mode, data) {
  try {
    localStorage.setItem(storageKey(mode), JSON.stringify(data))
  } catch { /* storage full */ }
}
