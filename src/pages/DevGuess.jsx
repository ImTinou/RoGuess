import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState'
import GuessInput from '../components/game/GuessInput.jsx'
import ComparisonTable from '../components/game/ComparisonTable.jsx'
import ResultOverlay from '../components/game/ResultOverlay.jsx'
import { getDayNumber } from '../lib/daily'
import devsData from '../data/devs.json'

export default function DevGuess() {
  const { state, loading, shaking, submitting, submitGuess, guessCount, alreadyGuessed } = useGameState('dev')
  const [showResult, setShowResult] = useState(false)
  const dayNumber = getDayNumber()

  useEffect(() => {
    if (state?.finished && !showResult) {
      const t = setTimeout(() => setShowResult(true), 500)
      return () => clearTimeout(t)
    }
  }, [state?.finished])

  if (loading) {
    return (
      <div className="game-loading page-center">
        <div className="spinner spinner-lg" />
        <p>Chargement du puzzle du jour...</p>
      </div>
    )
  }

  return (
    <div className="game-page">
      <div className="game-header">
        <div className="game-mode-icon">👤</div>
        <div className="game-title">DevGuess</div>
        <div className="game-number">Puzzle #{dayNumber} • {guessCount} tentative{guessCount !== 1 ? 's' : ''}</div>
      </div>

      {state?.finished && !showResult && (
        <div className="already-played-banner">
          <strong>{state.won ? '✅ Trouvé !' : '❌ Partie terminée'}</strong>{' '}
          <button className="btn btn-ghost btn-sm" onClick={() => setShowResult(true)}>Voir le résultat</button>
        </div>
      )}

      {!state?.finished ? (
        <GuessInput
          dataset={devsData}
          alreadyGuessed={alreadyGuessed}
          onGuess={submitGuess}
          disabled={submitting}
          shaking={shaking}
        />
      ) : (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
          <button className="btn btn-primary" onClick={() => setShowResult(true)}>Voir le résultat</button>
          <Link to="/endless/dev" className="btn btn-ghost">♾️ Mode Endless</Link>
        </div>
      )}

      <ComparisonTable mode="dev" rows={state?.rows ?? []} />

      {showResult && state?.finished && (
        <ResultOverlay
          mode="dev"
          won={state.won}
          hintsUsed={guessCount}
          score={state.score ?? 0}
          guesses={alreadyGuessed}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  )
}
