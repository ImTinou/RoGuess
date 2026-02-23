// GET /api/game/daily?mode=game|limited|dev
// Retourne l'indice 1 du puzzle du jour (jamais la réponse complète)

import { getDailyIndex, getTodayKey } from '../_lib/daily.js'
import gamesData    from '../../src/data/games.json' assert { type: 'json' }
import limitedsData from '../../src/data/limiteds.json' assert { type: 'json' }
import devsData     from '../../src/data/devs.json' assert { type: 'json' }

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

  // On renvoie uniquement les données publiques (jamais le nom complet pendant la partie)
  const safeItem = {
    id:         item.id,
    date:       getTodayKey(),
    puzzleNum:  index,
    hint1:      getHint1(mode, item),
    mode,
  }

  res.status(200).json(safeItem)
}

function getHint1(mode, item) {
  if (mode === 'game')    return { label: 'Genre',        value: item.hints.genre,       icon: '🎲' }
  if (mode === 'limited') return { label: 'Type d\'item', value: item.hints.type,        icon: '🏷️' }
  if (mode === 'dev')     return { label: 'Genre',        value: item.hints.genre,       icon: '🎮' }
}
