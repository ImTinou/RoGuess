import { Routes, Route } from 'react-router-dom'
import Navbar from './components/ui/Navbar.jsx'
import Home from './pages/Home.jsx'
import GameGuess from './pages/GameGuess.jsx'
import LimitedGuess from './pages/LimitedGuess.jsx'
import DevGuess from './pages/DevGuess.jsx'
import Endless from './pages/Endless.jsx'
import Leaderboard from './pages/Leaderboard.jsx'
import Profile from './pages/Profile.jsx'
import Login from './pages/Login.jsx'
import BannerAd from './components/ads/BannerAd.jsx'
import ToastContainer from './components/ui/ToastContainer.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"               element={<Home />} />
        <Route path="/game"           element={<GameGuess />} />
        <Route path="/limited"        element={<LimitedGuess />} />
        <Route path="/dev"            element={<DevGuess />} />
        <Route path="/endless/:mode"  element={<Endless />} />
        <Route path="/leaderboard"    element={<Leaderboard />} />
        <Route path="/profile"        element={<Profile />} />
        <Route path="/login"          element={<Login />} />
      </Routes>
      <BannerAd />
      <ToastContainer />
    </>
  )
}
