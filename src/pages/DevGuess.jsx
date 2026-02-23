import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGameState } from '../hooks/useGameState'
import HintCard from '../components/game/HintCard.jsx'
import GuessInput from '../components/game/GuessInput.jsx'
import GuessHistory from '../components/game/GuessHistory.jsx'
import ResultOverlay from '../components/game/ResultOverlay.jsx'
import { getDayNumber } from '../lib/daily'
import devsData from '../data/devs.json'

export default function DevGuess() {
  const { state, loading, shaking, submitting, submitGuess, isFinished, hintsCount } = useGameState('dev')
  const [showResult, setShowResult] = useState(false)
  const dayNumber = getDayNumber()

  if (!showResult && state?.finished && !loading) {
    setTimeout(() => setShowResult(true), 600)
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
        <div className="game-mode-icon">👤</div>
        <div className="game-title">DevGuess</div>
        <div className="game-number">Puzzle #{dayNumber} • {hintsCount}/6 indices</div>
      </div>

      {state?.finished && !showResult && (
        <div className="already-played-banner">
          <strong>{state.won ? '✅ Puzzle complété !' : '❌ Puzzle terminé'}</strong>{' '}
          <button className="btn btn-ghost btn-sm" onClick={() => setShowResult(true)}>Voir le résultat</button>
        </div>
      )}

      <div className="game-body">
        <div className="hints-grid">
          {Array.from({ length: 6 }, (_, i) => i + 1).map(n => (
            <HintCard
              key={n}
              hintNum={n}
              hintData={state?.hintsData?.[n]}
              isRevealed={state?.hintsRevealed?.includes(n) ?? n === 1}
              isNew={state?.hintsRevealed?.[state.hintsRevealed.length - 1] === n && n > 1}
            />
          ))}
        </div>

        <div className="guess-zone">
          {!state?.finished ? (
            <>
              <GuessInput
                dataset={devsData}
                guesses={state?.guesses ?? []}
                onGuess={submitGuess}
                disabled={submitting || state?.finished}
                shaking={shaking}
              />
              <GuessHistory guesses={state?.guesses ?? []} />
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {6 - (state?.guesses?.length ?? 0)} tentative{6 - (state?.guesses?.length ?? 0) !== 1 ? 's' : ''} restante{6 - (state?.guesses?.length ?? 0) !== 1 ? 's' : ''}
              </div>
            </>
          ) : (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <button className="btn btn-primary" onClick={() => setShowResult(true)}>Voir le résultat</button>
              <Link to="/endless/dev" className="btn btn-ghost">♾️ Mode Endless</Link>
              <Link to="/leaderboard" className="btn btn-secondary btn-sm">🏆 Classement</Link>
            </div>
          )}
        </div>
      </div>

      {showResult && state?.finished && (
        <ResultOverlay
          mode="dev"
          won={state.won}
          hintsUsed={state.hintsRevealed?.length ?? 6}
          score={state.score ?? 0}
          guesses={state.guesses ?? []}
          onClose={() => setShowResult(false)}
        />
      )}
    </div>
  )
}
