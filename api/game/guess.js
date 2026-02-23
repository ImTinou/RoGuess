// POST /api/game/guess
// Body: { mode, guess }
// Retourne : { correct, guessedItem, comparison } — ne révèle jamais le nom de la réponse

import { createRequire } from 'module'
import { getDailyIndex } from '../_lib/daily.js'
const require = createRequire(import.meta.url)
const gamesData    = require('../../src/data/games.json')
const limitedsData = require('../../src/data/limiteds.json')
const devsData     = require('../../src/data/devs.json')

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
  const answer  = data[index]
  const guessed = data.find(item => normalize(item.name) === normalize(guess))

  if (!guessed) {
    return res.status(404).json({ error: 'Introuvable dans la liste' })
  }

  const correct    = guessed.id === answer.id
  const comparison = buildComparison(mode, guessed, answer)
  const thumbnail  = guessed.thumbnail ?? guessed.image ?? null

  res.status(200).json({ correct, guessedItem: { id: guessed.id, name: guessed.name, thumbnail }, comparison })
}

// ---- Logique de comparaison ----

function buildComparison(mode, guessed, answer) {
  if (mode === 'game')    return compareGame(guessed, answer)
  if (mode === 'limited') return compareLimited(guessed, answer)
  if (mode === 'dev')     return compareDev(guessed, answer)
  return {}
}

function compareGame(g, a) {
  return {
    genre:   compareStr(g.genre,       a.genre),
    year:    compareYear(g.year,        a.year),
    visits:  compareNum(g.visits_num,  a.visits_num,  g.visits_label,  VISIT_BUCKETS),
    creator: compareStr(g.creator,     a.creator),
    free:    compareBool(g.free,        a.free,         g.free ? 'Gratuit' : 'Payant'),
  }
}

function compareLimited(g, a) {
  return {
    type:   compareStr(g.type,    a.type),
    year:   compareYear(g.year,   a.year),
    rap:    compareNum(g.rap_num, a.rap_num, g.rap_label, RAP_BUCKETS),
    rarity: compareStr(g.rarity,  a.rarity),
  }
}

function compareDev(g, a) {
  return {
    genre:     compareStr(g.genre,         a.genre),
    year:      compareYear(g.year_joined,   a.year_joined),
    followers: compareNum(g.followers_num, a.followers_num, g.followers_label, FOLLOWER_BUCKETS),
    known_for: compareStr(g.known_for,     a.known_for),
  }
}

// ---- Helpers de comparaison ----

function normalize(s) {
  return String(s ?? '').trim().toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ')
}

function compareStr(guessed, answer) {
  const status = normalize(guessed) === normalize(answer) ? 'correct' : 'wrong'
  return { value: guessed, display: String(guessed ?? ''), status }
}

function compareBool(guessed, answer, display) {
  return { value: guessed, display, status: guessed === answer ? 'correct' : 'wrong' }
}

function compareYear(guessed, answer) {
  const diff = guessed - answer
  let status
  if (diff === 0)               status = 'correct'
  else if (Math.abs(diff) <= 3) status = 'partial'
  else if (diff > 0)            status = 'high'
  else                          status = 'low'
  return { value: guessed, display: String(guessed), status }
}

const VISIT_BUCKETS    = [0, 100e6, 300e6, 500e6, 700e6, 1e9, 1.5e9, 2e9, 3e9, 4e9, 5e9, 6e9, 7e9, 8e9, 10e9, 20e9, 30e9, Infinity]
const RAP_BUCKETS      = [0, 100, 500, 1000, 2000, 5000, 10000, 20000, 50000, 100000, 300000, 600000, 1000000, 5000000, Infinity]
const FOLLOWER_BUCKETS = [0, 50000, 100000, 200000, 400000, 600000, 1000000, 2000000, 5000000, 10000000, Infinity]

function bucket(n, buckets) {
  for (let i = 0; i < buckets.length - 1; i++) {
    if (n >= buckets[i] && n < buckets[i + 1]) return i
  }
  return buckets.length - 2
}

function compareNum(guessed, answer, display, buckets) {
  const gb   = bucket(guessed, buckets)
  const ab   = bucket(answer,  buckets)
  const diff = gb - ab
  let status
  if (diff === 0)                status = 'correct'
  else if (Math.abs(diff) === 1) status = 'partial'
  else if (diff > 0)             status = 'high'
  else                           status = 'low'
  return { value: guessed, display: display ?? String(guessed), status }
}
