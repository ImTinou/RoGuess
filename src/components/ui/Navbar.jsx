import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export default function Navbar() {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">RoGuess</Link>

        {/* Navigation principale */}
        <div className="navbar-nav">
          <NavLink to="/game"      className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>🎮 GameGuess</NavLink>
          <NavLink to="/limited"   className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>💎 LimitedGuess</NavLink>
          <NavLink to="/dev"       className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>👤 DevGuess</NavLink>
          <NavLink to="/leaderboard" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>🏆 Classement</NavLink>
        </div>

        {/* Actions utilisateur */}
        <div className="navbar-actions">
          {user ? (
            <>
              <NavLink to="/profile" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                {profile?.is_premium && <span title="Premium">👑 </span>}
                {profile?.username ?? 'Profil'}
              </NavLink>
              <button className="btn btn-ghost btn-sm" onClick={handleSignOut}>Déconnexion</button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary btn-sm">Connexion</Link>
          )}
        </div>
      </div>
    </nav>
  )
}
