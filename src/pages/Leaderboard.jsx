import { useState } from 'react'
import { useLeaderboard } from '../hooks/useLeaderboard'
import { useAuth } from '../contexts/AuthContext'

const MODES   = ['game', 'limited', 'dev']
const PERIODS = ['daily', 'weekly', 'alltime']
const MODE_LABELS   = { game: '🎮 GameGuess', limited: '💎 LimitedGuess', dev: '👤 DevGuess' }
const PERIOD_LABELS = { daily: 'Aujourd\'hui', weekly: 'Cette semaine', alltime: 'Tout temps' }

const RANK_STYLE = {
  1: { color: '#ffd700', label: '🥇' },
  2: { color: '#c0c0c0', label: '🥈' },
  3: { color: '#cd7f32', label: '🥉' },
}

export default function Leaderboard() {
  const [mode,   setMode]   = useState('game')
  const [period, setPeriod] = useState('daily')
  const { data, myRank, loading } = useLeaderboard(mode, period)
  const { user } = useAuth()

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-8)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--space-2)' }}>🏆</div>
          <h1>Classement</h1>
          <p>Les meilleurs joueurs de RoGuess</p>
        </div>

        {/* Sélecteurs */}
        <div className="mode-tabs" style={{ marginBottom: 'var(--space-4)' }}>
          {MODES.map(m => (
            <button
              key={m}
              className={`mode-tab${mode === m ? ' active' : ''}`}
              onClick={() => setMode(m)}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>

        <div className="mode-tabs" style={{ marginBottom: 'var(--space-6)' }}>
          {PERIODS.map(p => (
            <button
              key={p}
              className={`mode-tab${period === p ? ' active' : ''}`}
              onClick={() => setPeriod(p)}
            >
              {PERIOD_LABELS[p]}
            </button>
          ))}
        </div>

        {/* Podium top 3 */}
        {!loading && data.length >= 3 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.2fr 1fr',
            gap: 'var(--space-3)',
            marginBottom: 'var(--space-6)',
            alignItems: 'end',
          }}>
            {[1, 0, 2].map(i => {  // ordre : 2ème, 1er, 3ème
              const entry = data[i]
              if (!entry) return <div key={i} />
              const rank  = i + 1
              const style = RANK_STYLE[rank]
              return (
                <div key={i} className="card" style={{
                  textAlign: 'center',
                  padding: 'var(--space-4)',
                  border: `1px solid ${style.color}44`,
                  boxShadow: `0 0 20px ${style.color}22`,
                  paddingTop: rank === 1 ? 'var(--space-6)' : 'var(--space-4)',
                }}>
                  <div style={{ fontSize: rank === 1 ? '2.5rem' : '2rem' }}>{style.label}</div>
                  <div style={{ fontWeight: 700, marginTop: 'var(--space-2)', color: style.color }}>
                    {entry.isPremium && '👑 '}{entry.username}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: 4 }}>
                    {entry.score} pts
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Table complète */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
            <div className="spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🏆</div>
            <h3>Aucun score pour l'instant</h3>
            <p>Sois le premier à jouer !</p>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr 100px 80px',
              padding: 'var(--space-3) var(--space-4)',
              background: 'var(--bg-elevated)',
              borderBottom: '1px solid var(--border-subtle)',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
            }}>
              <span>#</span><span>Joueur</span><span style={{ textAlign: 'right' }}>Score</span><span style={{ textAlign: 'right' }}>Badges</span>
            </div>

            {data.map((entry, i) => {
              const rank  = i + 1
              const isMe  = user && entry.userId === user.id
              const style = RANK_STYLE[rank]

              return (
                <div key={entry.userId} style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr 100px 80px',
                  padding: 'var(--space-3) var(--space-4)',
                  alignItems: 'center',
                  borderBottom: i < data.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  background: isMe ? 'rgba(136,0,230,0.08)' : 'transparent',
                  borderLeft: isMe ? '3px solid var(--purple-500)' : '3px solid transparent',
                  transition: 'background 200ms',
                }}>
                  <span style={{ fontWeight: 700, color: style?.color ?? 'var(--text-muted)', fontSize: style ? '1.1rem' : '0.9rem' }}>
                    {style?.label ?? rank}
                  </span>
                  <span style={{ fontWeight: isMe ? 700 : 400 }}>
                    {entry.isPremium && <span style={{ color: '#ffd700' }}>👑 </span>}
                    {entry.username}
                    {isMe && <span style={{ color: 'var(--purple-300)', fontSize: '0.75rem', marginLeft: 6 }}>(toi)</span>}
                  </span>
                  <span style={{ textAlign: 'right', color: 'var(--purple-300)', fontWeight: 700 }}>
                    {entry.score}
                  </span>
                  <span style={{ textAlign: 'right', fontSize: '0.85rem' }}>
                    {(entry.badges ?? []).slice(0, 2).map(b => {
                      const icons = { WEEK_STREAK: '🔥', MONTH_STREAK: '🌟', PERFECTIONIST: '⭐', GAME_MASTER: '🎮', PREMIUM: '👑' }
                      return icons[b] ?? ''
                    }).join(' ')}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Ma position si hors top 50 */}
        {myRank && myRank.rank > 50 && (
          <div style={{
            marginTop: 'var(--space-4)',
            padding: 'var(--space-3) var(--space-4)',
            background: 'rgba(136,0,230,0.1)',
            border: '1px solid var(--border-purple)',
            borderRadius: 'var(--radius-lg)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.875rem',
          }}>
            <span style={{ color: 'var(--text-muted)' }}>Ta position</span>
            <span style={{ fontWeight: 700 }}>#{myRank.rank}</span>
          </div>
        )}

      </div>
    </div>
  )
}
