import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { generateShareText, copyShareText, nativeShare } from '../../utils/share'
import { getDayNumber } from '../../lib/daily'
import CountdownTimer from '../ui/CountdownTimer.jsx'

export default function ResultOverlay({ mode, won, hintsUsed, score, guesses, onClose }) {
  const { user } = useAuth()
  const [answerData, setAnswer] = useState(null)
  const [copied, setCopied]     = useState(false)
  const [submitted, setSubmit]  = useState(false)

  const dayNumber = getDayNumber()

  // Récupère la réponse complète
  useEffect(() => {
    fetch(`/api/game/answer?mode=${mode}`)
      .then(r => r.json())
      .then(setAnswer)
      .catch(() => {})
  }, [mode])

  // Soumet le score sur Supabase
  useEffect(() => {
    if (!user || submitted) return
    const token = localStorage.getItem(`sb-${import.meta.env.VITE_SUPABASE_URL?.split('//')[1]?.split('.')[0]}-auth-token`)
    let parsedToken = null
    try { parsedToken = JSON.parse(token)?.access_token } catch {}
    if (!parsedToken) return

    fetch('/api/scores/submit', {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        'Authorization': `Bearer ${parsedToken}`,
      },
      body: JSON.stringify({ mode, won, hintsUsed, timeTaken: null, guesses }),
    })
    setSubmit(true)
  }, [user, mode, won, hintsUsed, guesses, submitted])

  async function handleShare() {
    const text = generateShareText(mode, dayNumber, won, hintsUsed, score)
    const shared = await nativeShare(text)
    if (!shared) {
      const ok = await copyShareText(text)
      if (ok) { setCopied(true); setTimeout(() => setCopied(false), 2500) }
    }
  }

  const squares = buildSquaresArray(won, hintsUsed)

  return (
    <div className="result-overlay" onClick={e => e.target === e.currentTarget && onClose?.()}>
      <div className="result-card">
        {/* Emoji résultat */}
        <div className="result-emoji">{won ? '🎉' : '😞'}</div>

        {/* Titre */}
        <div className={`result-title ${won ? 'win' : 'lose'}`}>
          {won ? 'Bien joué !' : 'Pas cette fois...'}
        </div>

        {/* Nom de la réponse */}
        {answerData && (
          <div className="result-answer-name">{answerData.name}</div>
        )}

        {/* Carrés Wordle */}
        <div className="result-squares">
          {squares.map((type, i) => (
            <div key={i} className={`result-square ${type}`} title={`Hint ${i + 1}`} />
          ))}
        </div>

        {/* Score */}
        {won && (
          <>
            <div className="result-score">{score}</div>
            <div className="result-score-label">points</div>
          </>
        )}

        {/* Preview réponse */}
        {answerData && (
          <div className="result-answer-preview">
            {answerData.thumbnail && (
              <img src={answerData.thumbnail} alt={answerData.name} />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{answerData.name}</div>
              {answerData.roblox_url && (
                <a
                  href={answerData.roblox_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: '0.8rem', color: 'var(--purple-300)' }}
                >
                  Voir sur Roblox ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="result-actions">
          <button className="btn btn-primary" onClick={handleShare}>
            {copied ? '✓ Copié !' : '📤 Partager'}
          </button>
          {onClose && (
            <button className="btn btn-secondary btn-sm" onClick={onClose}>Fermer</button>
          )}
        </div>

        {/* Countdown */}
        <div className="result-timer">
          <CountdownTimer label="Prochain daily" />
        </div>
      </div>
    </div>
  )
}

function buildSquaresArray(won, hintsUsed) {
  return Array.from({ length: 6 }, (_, i) => {
    const n = i + 1
    if (won && n === hintsUsed) return 'win'
    if (n < hintsUsed || (!won && n <= 6)) return 'lose'
    return 'skip'
  })
}
