import { useRef, useEffect } from 'react'

const HINT_ICONS = {
  genre:           '🎲',
  year:            '📅',
  visits_range:    '👁️',
  rap_range:       '💰',
  followers_range: '👥',
  description:     '📝',
  creator_initials:'🔤',
  first_letter:    '🔤',
  initials:        '🔤',
  thumbnail_blur:  '🖼️',
  silhouette:      '🎨',
  avatar_blur:     '👤',
}

export default function HintCard({ hintNum, hintData, isRevealed, isNew }) {
  const cardRef = useRef(null)

  useEffect(() => {
    if (isNew && cardRef.current) {
      cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
    }
  }, [isNew])

  return (
    <div
      ref={cardRef}
      className={[
        'hint-card',
        isRevealed ? 'revealed' : 'locked',
        isNew      ? 'new-reveal' : '',
      ].join(' ')}
    >
      <div className="hint-number">{hintNum}</div>

      <div className="hint-content">
        {isRevealed && hintData ? (
          <>
            <div className="hint-label">
              {HINT_ICONS[hintData.key] ?? hintData.icon ?? '💡'} {hintData.label}
            </div>
            <HintValue hintData={hintData} />
          </>
        ) : (
          <>
            <div className="hint-label">Indice {hintNum}</div>
            <div className="hint-text" style={{ filter: 'blur(6px)', userSelect: 'none', color: 'var(--text-muted)' }}>
              {hintNum === 4 ? '🖼️ Image' : '• • • • • •'}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function HintValue({ hintData }) {
  const { value, isImage } = hintData

  if (isImage && value?.url) {
    return (
      <div className="hint-image-wrapper">
        <img
          className={`hint-image blur-${value.blurLevel ?? 'none'}`}
          src={value.url}
          alt="Indice visuel"
          loading="lazy"
        />
      </div>
    )
  }

  if (isImage && value?.silhouette && value.url) {
    return (
      <img
        className="hint-silhouette"
        src={value.url}
        alt="Silhouette"
        loading="lazy"
      />
    )
  }

  if (isImage && value?.url && !value.blurLevel) {
    return (
      <div className="hint-image-wrapper">
        <img
          className={`hint-avatar blur-${value.blurLevel ?? 'high'}`}
          src={value.url}
          alt="Avatar"
          loading="lazy"
        />
      </div>
    )
  }

  return (
    <div className="hint-text">{String(value ?? '')}</div>
  )
}
