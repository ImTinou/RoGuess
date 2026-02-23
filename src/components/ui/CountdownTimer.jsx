import { useState, useEffect } from 'react'
import { getNextDailyMs } from '../../lib/daily'

function formatTime(ms) {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function CountdownTimer({ label = 'Prochain daily dans' }) {
  const [timeLeft, setTimeLeft] = useState(getNextDailyMs())

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getNextDailyMs())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 'var(--space-2)',
      padding: '8px 16px',
      background: 'var(--bg-card)',
      border: '1px solid var(--border-subtle)',
      borderRadius: 'var(--radius-full)',
      fontSize: '0.875rem',
    }}>
      <span style={{ color: 'var(--text-muted)' }}>⏱️ {label}</span>
      <span style={{
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        color: 'var(--purple-300)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {formatTime(timeLeft)}
      </span>
    </div>
  )
}
