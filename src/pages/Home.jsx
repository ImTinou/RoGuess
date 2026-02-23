import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import CountdownTimer from '../components/ui/CountdownTimer.jsx'
import { getDayNumber } from '../lib/daily'

const MODES = [
  {
    path: '/game',
    icon: '🎮',
    title: 'GameGuess',
    desc: 'Devine le jeu Roblox du jour en 6 indices',
    color: '#8800e6',
    endlessPath: '/endless/game',
  },
  {
    path: '/limited',
    icon: '💎',
    title: 'LimitedGuess',
    desc: 'Devine le limited Roblox du jour en 6 indices',
    color: '#0088cc',
    endlessPath: '/endless/limited',
  },
  {
    path: '/dev',
    icon: '👤',
    title: 'DevGuess',
    desc: 'Devine le développeur Roblox du jour en 6 indices',
    color: '#cc6600',
    endlessPath: '/endless/dev',
  },
]

export default function Home() {
  const { user, profile } = useAuth()
  const dayNumber = getDayNumber()

  return (
    <div className="page">
      <div className="container">

        {/* Hero */}
        <section style={{ textAlign: 'center', marginBottom: 'var(--space-12)' }}>
          <div style={{ fontSize: '4rem', marginBottom: 'var(--space-4)' }}>🎮</div>
          <h1 style={{ marginBottom: 'var(--space-3)' }}>
            <span className="text-gradient">RoGuess</span>
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: 520, margin: '0 auto var(--space-6)', color: 'var(--text-secondary)' }}>
            Le hub de daily games sur l'univers Roblox.<br />
            Devine des jeux, limiteds et développeurs chaque jour.
          </p>

          {/* Compteur prochain daily */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-3)' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)',
              padding: '8px 16px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
            }}>
              <span>🗓️ Jour #{dayNumber}</span>
            </div>
            <CountdownTimer />
          </div>
        </section>

        {/* Salutation si connecté */}
        {user && profile && (
          <div style={{
            background: 'linear-gradient(135deg, rgba(136,0,230,0.15), rgba(170,51,255,0.05))',
            border: '1px solid var(--border-purple)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-5)',
            marginBottom: 'var(--space-8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-3)',
          }}>
            <div>
              <strong style={{ color: 'var(--purple-300)' }}>
                {profile.is_premium && '👑 '}Bienvenue, {profile.username} !
              </strong>
              <p style={{ margin: 0, fontSize: '0.875rem' }}>
                {profile.xp} XP • Niveau {Math.floor(Math.sqrt(profile.xp / 100)) + 1}
              </p>
            </div>
            <Link to="/profile" className="btn btn-ghost btn-sm">Voir mon profil →</Link>
          </div>
        )}

        {/* Mode cards */}
        <div className="grid-3" style={{ marginBottom: 'var(--space-12)' }}>
          {MODES.map(mode => (
            <div key={mode.path} className="card card-hover" style={{ padding: 0, overflow: 'hidden' }}>
              {/* Top couleur */}
              <div style={{
                height: 6,
                background: `linear-gradient(90deg, ${mode.color}, transparent)`,
              }} />
              <div style={{ padding: 'var(--space-6)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-3)' }}>{mode.icon}</div>
                <h2 style={{ fontSize: '1.3rem', marginBottom: 'var(--space-2)' }}>{mode.title}</h2>
                <p style={{ fontSize: '0.875rem', marginBottom: 'var(--space-5)' }}>{mode.desc}</p>

                <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                  <Link to={mode.path} className="btn btn-primary" style={{ flex: 1 }}>
                    Jouer
                  </Link>
                  <Link to={mode.endlessPath} className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: '0.8rem' }}>
                    ♾️ Endless
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Comment jouer */}
        <section style={{
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-xl)',
          padding: 'var(--space-8)',
          marginBottom: 'var(--space-12)',
        }}>
          <h2 style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>Comment jouer ?</h2>
          <div className="grid-3">
            {[
              { icon: '🔍', title: '6 Indices progressifs', desc: 'Chaque mauvaise réponse dévoile un nouvel indice, du plus vague au plus précis.' },
              { icon: '⚡', title: 'Score par vitesse', desc: 'Plus tu trouves tôt, plus ton score est élevé. Vise le 1er indice !' },
              { icon: '🔥', title: 'Streak de victoires', desc: "Reviens chaque jour pour maintenir ta série et grimper dans le classement." },
            ].map(item => (
              <div key={item.title} style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>{item.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: 'var(--space-2)' }}>{item.title}</h3>
                <p style={{ fontSize: '0.875rem' }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA inscription */}
        {!user && (
          <section style={{ textAlign: 'center', padding: 'var(--space-8) 0' }}>
            <h2 style={{ marginBottom: 'var(--space-3)' }}>Rejoins le classement</h2>
            <p style={{ marginBottom: 'var(--space-5)' }}>
              Crée un compte gratuit pour sauvegarder tes scores, suivre ta streak et rejoindre le top mondial.
            </p>
            <Link to="/login" className="btn btn-primary btn-lg">
              Créer un compte gratuit
            </Link>
          </section>
        )}

      </div>
    </div>
  )
}
