import { useParams, Link } from 'react-router-dom'
import { useEndless } from '../hooks/useEndless'
import GuessInput from '../components/game/GuessInput.jsx'
import ComparisonTable from '../components/game/ComparisonTable.jsx'
import gamesData    from '../data/games.json'
import limitedsData from '../data/limiteds.json'
import devsData     from '../data/devs.json'

const MODE_LABELS = { game: '🎮 GameGuess', limited: '💎 LimitedGuess', dev: '👤 DevGuess' }
const DATASET     = { game: gamesData, limited: limitedsData, dev: devsData }

export default function Endless() {
  const { mode } = useParams()
  const {
    score, combo, maxCombo, lives, rounds, gameOver, shaking,
    current, submitGuess, giveUp, restart, comboMultiplier, alreadyGuessed,
  } = useEndless(mode ?? 'game')

  const dataset = DATASET[mode ?? 'game'] ?? []

  if (gameOver) {
    return (
      <div className="page-center" style={{ justifyContent: 'center' }}>
        <div className="card" style={{ maxWidth: 420, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-3)' }}>💥</div>
          <h2 style={{ marginBottom: 'var(--space-2)' }}>Game Over !</h2>
          <p style={{ marginBottom: 'var(--space-5)' }}>Tu n'as plus de vies</p>
          <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
            <div className="stat-card"><div className="stat-value" style={{ fontSize: '2.2rem' }}>{score}</div><div className="stat-label">Score final</div></div>
            <div className="stat-card"><div className="stat-value" style={{ fontSize: '2.2rem' }}>{rounds}</div><div className="stat-label">Rounds</div></div>
            <div className="stat-card"><div className="stat-value" style={{ fontSize: '2.2rem' }}>{maxCombo}</div><div className="stat-label">Meilleur combo</div></div>
            <div className="stat-card"><div className="stat-value" style={{ fontSize: '1.6rem' }}>x{comboMultiplier.toFixed(2)}</div><div className="stat-label">Multi max</div></div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <button className="btn btn-primary btn-lg" onClick={restart}>🔄 Rejouer</button>
            <Link to="/leaderboard" className="btn btn-ghost">🏆 Classement</Link>
            <Link to={`/${mode}`} className="btn btn-secondary btn-sm">← Retour Daily</Link>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return <div className="page-center" style={{ justifyContent: 'center' }}><div className="spinner spinner-lg" /></div>

  return (
    <div className="game-page">
      <div className="game-header">
        <div className="game-mode-icon">♾️</div>
        <div className="game-title">{MODE_LABELS[mode]} — Endless</div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-4)', flexWrap: 'wrap', marginTop: 'var(--space-3)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--purple-300)', fontFamily: 'var(--font-display)' }}>{score}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Score</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: combo > 0 ? 'var(--warning)' : 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>
              x{comboMultiplier.toFixed(2)}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Combo {combo > 0 && `(${combo})`}</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              {Array.from({ length: 3 }, (_, i) => (
                <span key={i} style={{ fontSize: '1.2rem', opacity: i < lives ? 1 : 0.2 }}>❤️</span>
              ))}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vies</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'var(--font-display)' }}>{rounds}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rounds</div>
          </div>
        </div>
      </div>

      {current.finished && (
        <div style={{
          textAlign: 'center', padding: 'var(--space-3)',
          background: current.won ? 'var(--success-bg)' : 'var(--error-bg)',
          borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)',
          border: `1px solid ${current.won ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: current.won ? 'var(--success)' : 'var(--error)', fontWeight: 700,
        }}>
          {current.won ? `✅ ${current.name} — Prochain round...` : `❌ C'était ${current.name} — Prochain round...`}
        </div>
      )}

      {!current.finished ? (
        <div style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'flex-start', marginBottom: 'var(--space-4)' }}>
          <div style={{ flex: 1 }}>
            <GuessInput
              dataset={dataset}
              alreadyGuessed={alreadyGuessed}
              onGuess={submitGuess}
              disabled={current.finished}
              shaking={shaking}
            />
          </div>
          {alreadyGuessed.length > 0 && (
            <button className="btn btn-secondary btn-sm" onClick={giveUp} style={{ marginTop: 'var(--space-1)', whiteSpace: 'nowrap' }}>
              Abandonner
            </button>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 'var(--space-4)' }}>
          Prochain round en cours...
          <div className="spinner" style={{ margin: 'var(--space-3) auto 0' }} />
        </div>
      )}

      <ComparisonTable mode={mode ?? 'game'} rows={current.rows ?? []} />
    </div>
  )
}
