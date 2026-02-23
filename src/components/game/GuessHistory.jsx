export default function GuessHistory({ guesses }) {
  if (!guesses.length) return null

  return (
    <div className="guess-history">
      <div className="guess-history-title">Tentatives ({guesses.length}/6)</div>
      {guesses.map((g, i) => (
        <div key={i} className="guess-chip wrong">
          <span className="guess-icon">✗</span>
          <span>{g}</span>
        </div>
      ))}
    </div>
  )
}
