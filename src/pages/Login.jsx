import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export default function Login() {
  const [tab, setTab]       = useState('login') // 'login' | 'register'
  const [email, setEmail]   = useState('')
  const [password, setPass] = useState('')
  const [username, setUser] = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoad]  = useState(false)
  const { signInWithEmail, signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoad(true)
    try {
      if (tab === 'login') {
        await signInWithEmail(email, password)
      } else {
        if (username.length < 3) throw new Error('Le pseudo doit faire au moins 3 caractères')
        await signUpWithEmail(email, password, username)
      }
      navigate('/')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoad(false)
    }
  }

  async function handleGoogle() {
    try { await signInWithGoogle() }
    catch (err) { setError(err.message) }
  }

  return (
    <div className="page-center" style={{ justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', marginTop: 0 }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: 'var(--space-2)' }}>🎮</div>
          <h1 style={{ fontSize: '1.8rem', marginBottom: 4 }}>RoGuess</h1>
          <p>Connecte-toi pour sauvegarder tes scores et rejoindre le classement</p>
        </div>

        {/* Tabs */}
        <div className="mode-tabs" style={{ marginBottom: 'var(--space-5)' }}>
          <button className={`mode-tab${tab === 'login' ? ' active' : ''}`} onClick={() => setTab('login')}>Connexion</button>
          <button className={`mode-tab${tab === 'register' ? ' active' : ''}`} onClick={() => setTab('register')}>Inscription</button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {tab === 'register' && (
            <div className="input-group">
              <label className="input-label">Pseudo</label>
              <input className="input" type="text" placeholder="TonPseudo123" value={username}
                onChange={e => setUser(e.target.value)} required minLength={3} maxLength={20} />
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email</label>
            <input className="input" type="email" placeholder="toi@email.com" value={email}
              onChange={e => setEmail(e.target.value)} required />
          </div>

          <div className="input-group">
            <label className="input-label">Mot de passe</label>
            <input className="input" type="password" placeholder="••••••••" value={password}
              onChange={e => setPass(e.target.value)} required minLength={6} />
          </div>

          {error && (
            <div style={{
              padding: 'var(--space-3)',
              background: 'var(--error-bg)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              fontSize: '0.875rem',
            }}>
              {error}
            </div>
          )}

          <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
            {loading ? <span className="spinner" /> : tab === 'login' ? 'Se connecter' : "S'inscrire"}
          </button>
        </form>

        <div className="divider" />

        {/* Google */}
        <button className="btn btn-secondary btn-full" onClick={handleGoogle} type="button">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuer avec Google
        </button>

        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 'var(--space-4)' }}>
          Tu peux aussi jouer sans compte — tes scores ne seront juste pas sauvegardés.
        </p>
        <div style={{ textAlign: 'center', marginTop: 'var(--space-3)' }}>
          <Link to="/" style={{ color: 'var(--purple-300)', fontSize: '0.875rem' }}>
            ← Jouer sans compte
          </Link>
        </div>
      </div>
    </div>
  )
}
