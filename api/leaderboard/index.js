// GET /api/leaderboard?mode=game&period=daily
// Retourne le top 50 + la position du user connecté

import { supabaseAdmin } from '../_lib/supabaseAdmin.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { mode = 'game', period = 'daily' } = req.query

  // Filtre de date selon la période
  const dateFilter = getDateFilter(period)

  // Top 50 par score total
  const { data: top, error } = await supabaseAdmin
    .from('game_sessions')
    .select(`
      user_id,
      score,
      profiles!inner(username, is_premium, xp),
      user_badges(badge_id)
    `)
    .eq('mode', mode)
    .eq('won', true)
    .gte('date', dateFilter)
    .order('score', { ascending: false })
    .limit(50)

  if (error) return res.status(500).json({ error: error.message })

  // Dé-duplique par user (garde le meilleur score)
  const seen = new Set()
  const leaderboard = []
  for (const row of (top ?? [])) {
    if (seen.has(row.user_id)) continue
    seen.add(row.user_id)
    leaderboard.push({
      userId:    row.user_id,
      username:  row.profiles?.username ?? 'Anonyme',
      isPremium: row.profiles?.is_premium ?? false,
      xp:        row.profiles?.xp ?? 0,
      score:     row.score,
      badges:    (row.user_badges ?? []).map(b => b.badge_id),
    })
  }

  // Rang du user connecté (si token présent)
  let myRank = null
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token) {
    const { data: { user } } = await supabaseAdmin.auth.getUser(token).catch(() => ({ data: { user: null } }))
    if (user) {
      const myEntry = leaderboard.find(e => e.userId === user.id)
      if (myEntry) {
        myRank = { rank: leaderboard.indexOf(myEntry) + 1, ...myEntry }
      } else {
        // Calcule son rang réel même si hors top 50
        const { count } = await supabaseAdmin
          .from('game_sessions')
          .select('user_id', { count: 'exact', head: true })
          .eq('mode', mode)
          .eq('won', true)
          .gte('date', dateFilter)
          .gt('score', await getMyBestScore(user.id, mode, dateFilter))
        if (count !== null) myRank = { rank: count + 1, userId: user.id }
      }
    }
  }

  res.status(200).json({ leaderboard, myRank })
}

function getDateFilter(period) {
  const now = new Date()
  if (period === 'daily') {
    return now.toISOString().split('T')[0]
  }
  if (period === 'weekly') {
    const d = new Date(now)
    d.setDate(d.getDate() - 7)
    return d.toISOString().split('T')[0]
  }
  return '2000-01-01' // alltime
}

async function getMyBestScore(userId, mode, dateFilter) {
  const { data } = await supabaseAdmin
    .from('game_sessions')
    .select('score')
    .eq('user_id', userId)
    .eq('mode', mode)
    .gte('date', dateFilter)
    .order('score', { ascending: false })
    .limit(1)
    .single()
  return data?.score ?? 0
}
