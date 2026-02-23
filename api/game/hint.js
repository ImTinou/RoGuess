// GET /api/game/hint?mode=game&n=2
// Retourne l'indice N du puzzle du jour (jamais la réponse)

import { getDailyIndex } from '../_lib/daily.js'
import gamesData    from '../../src/data/games.json' assert { type: 'json' }
import limitedsData from '../../src/data/limiteds.json' assert { type: 'json' }
import devsData     from '../../src/data/devs.json' assert { type: 'json' }

const DATA = { game: gamesData, limited: limitedsData, dev: devsData }

// Définition des 6 indices par mode
const HINTS_CONFIG = {
  game: [
    { n: 1, label: 'Genre',              icon: '🎲', key: 'genre' },
    { n: 2, label: 'Année de création',  icon: '📅', key: 'year' },
    { n: 3, label: 'Nombre de visites',  icon: '👁️', key: 'visits_range' },
    { n: 4, label: 'Thumbnail floue',    icon: '🖼️', key: 'thumbnail_blur', isImage: true },
    { n: 5, label: 'Description',        icon: '📝', key: 'description' },
    { n: 6, label: 'Initiales créateur', icon: '🔤', key: 'creator_initials' },
  ],
  limited: [
    { n: 1, label: 'Type d\'item',       icon: '🏷️', key: 'type' },
    { n: 2, label: 'Année de sortie',    icon: '📅', key: 'year' },
    { n: 3, label: 'Valeur RAP',         icon: '💰', key: 'rap_range' },
    { n: 4, label: 'Description',        icon: '📝', key: 'description' },
    { n: 5, label: 'Silhouette',         icon: '👁️', key: 'silhouette', isImage: true },
    { n: 6, label: 'Première lettre',    icon: '🔤', key: 'first_letter' },
  ],
  dev: [
    { n: 1, label: 'Genre principal',    icon: '🎮', key: 'genre' },
    { n: 2, label: 'Année sur Roblox',   icon: '📅', key: 'year_joined' },
    { n: 3, label: 'Followers',          icon: '👥', key: 'followers_range' },
    { n: 4, label: 'Description',        icon: '📝', key: 'description' },
    { n: 5, label: 'Avatar flouté',      icon: '👤', key: 'avatar_blur', isImage: true },
    { n: 6, label: 'Initiales',          icon: '🔤', key: 'initials' },
  ],
}

export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { mode, n } = req.query
  const hintNum = parseInt(n, 10)

  if (!['game', 'limited', 'dev'].includes(mode)) {
    return res.status(400).json({ error: 'Mode invalide' })
  }
  if (!hintNum || hintNum < 1 || hintNum > 6) {
    return res.status(400).json({ error: 'Numéro d\'indice invalide (1-6)' })
  }

  const data   = DATA[mode]
  const index  = getDailyIndex(data.length)
  const item   = data[index]
  const config = HINTS_CONFIG[mode].find(h => h.n === hintNum)

  if (!config) return res.status(400).json({ error: 'Indice introuvable' })

  const value = config.isImage
    ? getImageHint(mode, item, hintNum)
    : item.hints[config.key] ?? item[config.key]

  res.status(200).json({
    n:       hintNum,
    label:   config.label,
    icon:    config.icon,
    value,
    isImage: config.isImage ?? false,
  })
}

function getImageHint(mode, item, n) {
  if (mode === 'game')    return { url: item.thumbnail,    blurLevel: n === 4 ? 'high' : 'none' }
  if (mode === 'limited') return { url: item.image ?? null, silhouette: true }
  if (mode === 'dev')     return { url: item.avatar ?? null, blurLevel: n === 5 ? 'low' : 'none' }
  return null
}
