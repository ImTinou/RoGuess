// GET /api/game/answer?mode=game
// Retourne la réponse complète — UNIQUEMENT appelé après game over côté client

import { createRequire } from 'module'
import { getDailyIndex } from '../_lib/daily.js'
const require = createRequire(import.meta.url)
const gamesData    = require('../../src/data/games.json')
const limitedsData = require('../../src/data/limiteds.json')
const devsData     = require('../../src/data/devs.json')

const DATA = { game: gamesData, limited: limitedsData, dev: devsData }

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { mode } = req.query
  if (!['game', 'limited', 'dev'].includes(mode)) {
    return res.status(400).json({ error: 'Mode invalide' })
  }

  const data  = DATA[mode]
  const index = getDailyIndex(data.length)
  const item  = data[index]

  // On peut renvoyer tout l'item maintenant que la partie est terminée
  res.status(200).json({
    id:         item.id,
    name:       item.name,
    thumbnail:  item.thumbnail ?? item.image ?? item.avatar ?? null,
    roblox_url: item.roblox_url,
  })
}
