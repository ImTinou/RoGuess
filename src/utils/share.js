// Génération du texte de partage Wordle-style

const MODE_NAMES = {
  game:    'GameGuess',
  limited: 'LimitedGuess',
  dev:     'DevGuess',
}

/**
 * @param {string} mode
 * @param {number} dayNumber
 * @param {boolean} won
 * @param {number} hintsUsed  - nombre d'indices révélés à la victoire (1-6)
 * @param {number} score
 */
export function generateShareText(mode, dayNumber, won, hintsUsed, score) {
  const modeName = MODE_NAMES[mode] ?? mode
  const squares  = buildSquares(won, hintsUsed)
  const hint     = won ? `Trouvé au hint ${hintsUsed}` : 'Non trouvé'
  const lines = [
    `RoGuess - ${modeName} #${dayNumber}`,
    squares,
    `${hint} • Score: ${score}`,
    'roguess.gg',
  ]
  return lines.join('\n')
}

function buildSquares(won, hintsUsed) {
  const squares = []
  for (let i = 1; i <= 6; i++) {
    if (won && i === hintsUsed) {
      squares.push('🟩')
    } else if (i < hintsUsed || !won) {
      squares.push('🟥')
    } else {
      squares.push('⬛')
    }
  }
  return squares.join('')
}

export async function copyShareText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    // Fallback
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.left     = '-9999px'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  }
}

export async function nativeShare(text) {
  if (navigator.share) {
    try {
      await navigator.share({ text, title: 'RoGuess' })
      return true
    } catch { return false }
  }
  return false
}
