// Hook central du moteur de jeu — style Loldle
// Chaque guess retourne une comparaison par attribut (pas de hints)

import { useState, useEffect, useCallback, useRef } from 'react'
import { getTodayKey } from '../lib/daily'

const BASE_URL = ''

function storageKey(mode) {
  return `roguess_v2_${mode}_${getTodayKey()}`
}

function initialState(mode) {
  return {
    mode,
    date:     getTodayKey(),
    rows:     [],      // [{ name, thumbnail, comparison }]
    won:      false,
    finished: false,
    score:    0,
    timeTaken: null,
  }
}

export function useGameState(mode) {
  const [state,     setState]   = useState(null)
  const [shaking,   setShaking] = useState(false)
  const [loading,   setLoading] = useState(true)
  const [submitting,setSubmit]  = useState(false)
  const startTimeRef = useRef(null)

  useEffect(() => {
    if (!mode) return
    loadState()
  }, [mode])

  function loadState() {
    setLoading(true)
    const saved = loadFromStorage(mode)
    if (saved && saved.date === getTodayKey()) {
      setState(saved)
    } else {
      const fresh = initialState(mode)
      setState(fresh)
      saveToStorage(mode, fresh)
      startTimeRef.current = Date.now()
    }
    setLoading(false)
  }

  const submitGuess = useCallback(async (guess) => {
    if (!state || state.finished || submitting) return { correct: false }
    setSubmit(true)

    try {
      const res = await fetch(`${BASE_URL}/api/game/guess`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ mode, guess }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        if (res.status === 404) {
          setShaking(true)
          setTimeout(() => setShaking(false), 450)
        }
        return { correct: false, error: err.error }
      }

      const data = await res.json()
      const newRow = { name: data.guessedItem.name, thumbnail: data.guessedItem.thumbnail, comparison: data.comparison }

      if (data.correct) {
        const timeTaken = startTimeRef.current
          ? Math.floor((Date.now() - startTimeRef.current) / 1000)
          : null
        const score = calcScore(state.rows.length + 1, timeTaken)

        setState(prev => {
          const next = { ...prev, rows: [...prev.rows, newRow], won: true, finished: true, score, timeTaken }
          saveToStorage(mode, next)
          return next
        })
        return { correct: true, score }
      } else {
        setShaking(true)
        setTimeout(() => setShaking(false), 450)

        setState(prev => {
          const next = { ...prev, rows: [...prev.rows, newRow] }
          saveToStorage(mode, next)
          return next
        })
        return { correct: false }
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
    submitGuess,
    isFinished:    state?.finished ?? false,
    hasWon:        state?.won ?? false,
    guessCount:    state?.rows?.length ?? 0,
    alreadyGuessed: state?.rows?.map(r => r.name) ?? [],
  }
}

function calcScore(guessesUsed, timeTaken) {
  const base = Math.max(100, 700 - guessesUsed * 100)
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
