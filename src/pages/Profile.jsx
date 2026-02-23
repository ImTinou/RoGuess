import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

const BADGES_INFO = {
  FIRST_WIN:      { label: 'Première victoire',  icon: '🏅' },
  PERFECTIONIST:  { label: 'Perfectionniste',    icon: '⭐' },
  SPEED_DEMON:    { label: 'Speed Demon',         icon: '⚡' },
  WEEK_STREAK:    { label: 'Streak 7 jours',      icon: '🔥' },
  MONTH_STREAK:   { label: 'Streak 30 jours',     icon: '🌟' },
  TRIPLE_CROWN:   { label: 'Triple Couronne',     icon: '👑' },
  GAME_MASTER:    { label: 'Game Master',         icon: '🎮' },
  LIMITED_EXPERT: { label: 'Limited Expert',      icon: '💎' },
  DEV_GURU:       { label: 'Dev Guru',            icon: '👤' },
  ENDLESS_LEGEND: { label: 'Endless Legend',      icon: '♾️' },
  PREMIUM:        { label: 'Premium',             icon: '👑' },
}

const MODES = ['game', 'limited', 'dev']
const MODE_LABELS = { game: '🎮 GameGuess', limited: '💎 LimitedGuess', dev: '👤 DevGuess' }

export default function Profile() {
  const { user, profile, loading: authLoading, isPremium } = useAuth()
  const [stats,   setStats]   = useState({})
  const [streaks, setStreaks]  = useState({})
  const [badges,  setBadges]  = useState([])
  const [history, setHistory] = useState([])
  const [loadingData, setLD]  = useState(true)

  if (!authLoading && !user) return <Navigate to="/login" replace />

  useEffect(() => {
    if (!user) return
    loadProfileData()
  }, [user])

  async function loadProfileData() {
    setLD(true)
    const [statsRes, streaksRes, badgesRes, historyRes] = await Promise.all([
      supabase.from('game_sessions').select('mode, won, score, hints_used, date').eq('user_id', user.id),
      supabase.from('streaks').select('*').eq('user_id', user.id),
      supabase.from('user_badges').select('badge_id, earned_at').eq('user_id', user.id),
      supabase.from('game_sessions').select('mode, won, score, hints_used, date').eq('user_id', user.id).order('date', { ascending: false }).limit(30),
    ])

    // Compile stats par mode
    const compiled = {}
    for (const row of statsRes.data ?? []) {
      if (!compiled[row.mode]) compiled[row.mode] = { played: 0, won: 0, bestScore: 0, totalHints: 0 }
      compiled[row.mode].played++
      if (row.won) compiled[row.mode].won++
      if (row.score > compiled[row.mode].bestScore) compiled[row.mode].bestScore = row.score
      compiled[row.mode].totalHints += row.hints_used ?? 6
    }
    setStats(compiled)

    // Streaks par mode
    const streakMap = {}
    for (const row of streaksRes.data ?? []) streakMap[row.mode] = row
    setStreaks(streakMap)

    setBadges(badgesRes.data ?? [])
    setHistory(historyRes.data ?? [])
    setLD(false)
  }

  const xp    = profile?.xp ?? 0
  const level = Math.floor(Math.sqrt(xp / 100)) + 1
  const xpForNext = Math.pow(level, 2) * 100
  const xpProgress = Math.min(100, ((xp - Math.pow(level - 1, 2) * 100) / (xpForNext - Math.pow(level - 1, 2) * 100)) * 100)

  if (authLoading || loadingData) {
    return (
      <div className="page-center" style={{ justifyContent: 'center' }}>
        <div className="spinner spinner-lg" />
      </div>
    )
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>

        {/* Header profil */}
        <div className="card" style={{ marginBottom: 'var(--space-6)', display: 'flex', alignItems: 'center', gap: 'var(--space-5)', flexWrap: 'wrap' }}>
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--purple-600), var(--purple-400))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', flexShrink: 0,
          }}>
            {isPremium ? '👑' : '🎮'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>
              {isPremium && <span style={{ color: '#ffd700' }}>👑 </span>}
              {profile?.username ?? 'Anonyme'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
              <span style={{ color: 'var(--purple-300)', fontWeight: 700 }}>Niveau {level}</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{xp} XP</span>
              {isPremium && (
                <span className="badge badge-premium">Premium</span>
              )}
            </div>
            {/* Barre XP */}
            <div style={{
              height: 6, background: 'var(--bg-elevated)', borderRadius: 3,
              marginTop: 'var(--space-2)', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: `${xpProgress}%`,
                background: 'linear-gradient(90deg, var(--purple-600), var(--purple-400))',
                borderRadius: 3, transition: 'width 0.5s ease',
              }} />
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>
              {xp} / {xpForNext} XP pour le niveau {level + 1}
            </div>
          </div>
          {!isPremium && (
            <Link to="/login" className="btn btn-primary btn-sm">
              ✨ Passer Premium
            </Link>
          )}
        </div>

        {/* Stats par mode */}
        <h3 style={{ marginBottom: 'var(--space-4)' }}>Statistiques</h3>
        <div className="grid-3" style={{ marginBottom: 'var(--space-8)' }}>
          {MODES.map(mode => {
            const s = stats[mode] ?? { played: 0, won: 0, bestScore: 0, totalHints: 0 }
            const winRate = s.played ? Math.round((s.won / s.played) * 100) : 0
            const avgHints = s.won ? (s.totalHints / s.won).toFixed(1) : '-'
            const streak = streaks[mode]
            return (
              <div key={mode} className="card" style={{ gap: 'var(--space-3)', display: 'flex', flexDirection: 'column' }}>
                <div style={{ fontWeight: 700 }}>{MODE_LABELS[mode]}</div>
                <div className="grid-2" style={{ gap: 'var(--space-2)' }}>
                  <div className="stat-card"><div className="stat-value">{s.played}</div><div className="stat-label">Parties</div></div>
                  <div className="stat-card"><div className="stat-value">{winRate}%</div><div className="stat-label">Victoires</div></div>
                  <div className="stat-card"><div className="stat-value">{avgHints}</div><div className="stat-label">Moy. indices</div></div>
                  <div className="stat-card"><div className="stat-value">{s.bestScore}</div><div className="stat-label">Meilleur</div></div>
                </div>
                {streak && (
                  <div className="streak-display">
                    🔥 Streak : {streak.current_streak}j
                    {streak.longest_streak > 0 && <span style={{ fontSize: '0.75rem', opacity: 0.7 }}>• record : {streak.longest_streak}</span>}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Badges */}
        {badges.length > 0 && (
          <>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Badges ({badges.length})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', marginBottom: 'var(--space-8)' }}>
              {badges.map(b => {
                const info = BADGES_INFO[b.badge_id] ?? { label: b.badge_id, icon: '🏅' }
                return (
                  <div key={b.badge_id} className="badge badge-purple" title={new Date(b.earned_at).toLocaleDateString('fr-FR')}>
                    {info.icon} {info.label}
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Historique */}
        {history.length > 0 && (
          <>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Historique récent</h3>
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              {history.map((row, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: 'var(--space-3) var(--space-4)',
                  borderBottom: i < history.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  fontSize: '0.875rem',
                }}>
                  <span>{MODE_LABELS[row.mode]}</span>
                  <span style={{ color: 'var(--text-muted)' }}>
                    {new Date(row.date).toLocaleDateString('fr-FR')}
                  </span>
                  <span style={{ color: row.won ? 'var(--success)' : 'var(--error)', fontWeight: 600 }}>
                    {row.won ? `✓ ${row.hints_used} hint${row.hints_used > 1 ? 's' : ''}` : '✗'}
                  </span>
                  <span style={{ color: 'var(--purple-300)', fontWeight: 700 }}>{row.score} pts</span>
                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </div>
  )
}
