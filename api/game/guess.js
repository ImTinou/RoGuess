// POST /api/game/guess
// Body: { mode, guess, hintNumber }
// Valide la guess côté serveur — ne divulgue jamais la réponse avant game over

import { getDailyIndex } from '../_lib/daily.js'
import gamesData    from '../../src/data/games.json' assert { type: 'json' }
import limitedsData from '../../src/data/limiteds.json' assert { type: 'json' }
import devsData     from '../../src/data/devs.json' assert { type: 'json' }

const DATA = { game: gamesData, limited: limitedsData, dev: devsData }

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const { mode, guess } = req.body ?? {}

  if (!['game', 'limited', 'dev'].includes(mode)) {
    return res.status(400).json({ error: 'Mode invalide' })
  }
  if (!guess || typeof guess !== 'string') {
    return res.status(400).json({ error: 'Guess manquant' })
  }

  const data    = DATA[mode]
  const index   = getDailyIndex(data.length)
  const item    = data[index]
  const correct = normalize(item.name) === normalize(guess)

  res.status(200).json({ correct, itemId: item.id })
}

function normalize(str) {
  return str.trim().toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')  // retire ponctuation
    .replace(/\s+/g, ' ')
}
