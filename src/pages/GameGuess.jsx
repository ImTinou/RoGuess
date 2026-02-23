import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState'
import GuessInput from '../components/game/GuessInput.jsx'
import ComparisonTable from '../components/game/ComparisonTable.jsx'
import ResultOverlay from '../components/game/ResultOverlay.jsx'
import { getDayNumber } from '../lib/daily'
import gamesData from '../data/games.json'

export default function GameGuess() {
  const { state, loading, shaking, submitting, submitGuess, isFinished, hasWon, guessCount, alreadyGuessed } = useGameState('game')
  const [showResult, setShowResult] = useState(false)
  const dayNumber = getDayNumber()

  if (!showResult && state?.finished && !loading) {
    setTimeout(() => setShowResult(true), 500)
  }

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
        <div className="game-mode-icon">🎮</div>
        <div className="game-title">GameGuess</div>
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
          dataset={gamesData}
          alreadyGuessed={alreadyGuessed}
          onGuess={submitGuess}
          disabled={submitting}
          shaking={shaking}
        />
      ) : (
        <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 'var(--space-4)' }}>
          <button className="btn btn-primary" onClick={() => setShowResult(true)}>Voir le résultat</button>
          <Link to="/endless/game" className="btn btn-ghost">♾️ Mode Endless</Link>
        </div>
      )}

      <ComparisonTable mode="game" rows={state?.rows ?? []} />

      {showResult && state?.finished && (
        <ResultOverlay
          mode="game"
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
