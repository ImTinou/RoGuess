import { useState, useRef, useEffect } from 'react'

export default function GuessInput({ dataset, alreadyGuessed = [], onGuess, disabled, shaking }) {
  const [value, setValue]       = useState('')
  const [filtered, setFiltered] = useState([])
  const [open, setOpen]         = useState(false)
  const [highlighted, setHigh]  = useState(-1)
  const inputRef                = useRef(null)
  const dropRef                 = useRef(null)

  // Filtre l'autocomplete
  useEffect(() => {
    if (!value.trim()) { setFiltered([]); setOpen(false); return }
    const q = value.toLowerCase()
    const results = dataset
      .filter(item => item.name.toLowerCase().includes(q))
      .filter(item => !alreadyGuessed.includes(item.name))
      .slice(0, 8)
    setFiltered(results)
    setOpen(results.length > 0)
    setHigh(-1)
  }, [value, dataset, alreadyGuessed])

  // Ferme sur clic extérieur
  useEffect(() => {
    function onDown(e) {
      if (!dropRef.current?.contains(e.target) && !inputRef.current?.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onDown)
    return () => document.removeEventListener('mousedown', onDown)
  }, [])

  function select(name) {
    setValue(name)
    setOpen(false)
    inputRef.current?.focus()
  }

  function submit(name = value) {
    const trimmed = name.trim()
    if (!trimmed) return
    if (alreadyGuessed.includes(trimmed)) return
    onGuess(trimmed)
    setValue('')
    setOpen(false)
  }

  function onKeyDown(e) {
    if (!open) {
      if (e.key === 'Enter') submit()
      return
    }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHigh(h => Math.min(h + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setHigh(h => Math.max(h - 1, -1)) }
    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted >= 0) { select(filtered[highlighted].name); submit(filtered[highlighted].name) }
      else submit()
    }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div>
      <div className={`guess-input-wrapper ${shaking ? 'animate-shake' : ''}`}>
        <input
          ref={inputRef}
          className="guess-input"
          type="text"
          placeholder="Tape le nom du jeu..."
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          onFocus={() => value && filtered.length && setOpen(true)}
          disabled={disabled}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
        />

        {open && (
          <div ref={dropRef} className="autocomplete-dropdown">
            {filtered.map((item, i) => (
              <div
                key={item.id}
                className={`autocomplete-item${i === highlighted ? ' highlighted' : ''}`}
                onMouseDown={() => { select(item.name); setTimeout(() => submit(item.name), 10) }}
                onMouseEnter={() => setHigh(i)}
              >
                {(item.thumbnail ?? item.image) && (
                  <img src={item.thumbnail ?? item.image} alt="" onError={e => { e.target.style.display = 'none' }} />
                )}
                <span>{item.name}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <button
        className="btn btn-primary guess-submit-btn"
        style={{ marginTop: 'var(--space-2)' }}
        onClick={() => submit()}
        disabled={disabled || !value.trim()}
      >
        Valider
      </button>
    </div>
  )
}
