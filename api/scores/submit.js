// POST /api/scores/submit
// Body: { mode, won, hintsUsed, timeTaken, guesses }
// Nécessite un JWT Supabase dans le header Authorization

import { supabaseAdmin } from '../_lib/supabaseAdmin.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  // Vérifie le JWT
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Non authentifié' })

  const { data: { user }, error: authErr } = await supabaseAdmin.auth.getUser(token)
  if (authErr || !user) return res.status(401).json({ error: 'Token invalide' })

  const { mode, won, hintsUsed, timeTaken, guesses } = req.body ?? {}

  if (!['game', 'limited', 'dev'].includes(mode)) {
    return res.status(400).json({ error: 'Mode invalide' })
  }

  // Calcul du score
  const score = calculateScore(won, hintsUsed, timeTaken)

  // Date d'aujourd'hui
  const today = new Date().toISOString().split('T')[0]

  // Insert ou update la session (UNIQUE sur user_id + mode + date)
  const { error: sessionErr } = await supabaseAdmin
    .from('game_sessions')
    .upsert({
      user_id:    user.id,
      mode,
      date:       today,
      hints_used: hintsUsed,
      won:        won ?? false,
      score,
      time_taken: timeTaken ?? null,
      guesses:    guesses ?? [],
    }, { onConflict: 'user_id,mode,date' })

  if (sessionErr) return res.status(500).json({ error: sessionErr.message })

  // Met à jour le streak
  await updateStreak(user.id, mode, won, today)

  // Met à jour l'XP
  const xpGain = won ? Math.floor(score / 10) + 10 : 5
  await supabaseAdmin.rpc('increment_xp', { user_id: user.id, amount: xpGain })

  // Vérifie les badges
  await checkBadges(user.id, mode, hintsUsed, timeTaken, won)

  res.status(200).json({ score, xpGain })
}

function calculateScore(won, hintsUsed, timeTaken) {
  if (!won) return 0
  const h = Math.max(1, Math.min(6, hintsUsed ?? 6))
  const baseScore = (7 - h) * 100
  const timeBonus = timeTaken ? Math.max(0, 60 - timeTaken) * 2 : 0
  return baseScore + timeBonus
}

async function updateStreak(userId, mode, won, today) {
  const { data: streak } = await supabaseAdmin
    .from('streaks')
    .select('*')
    .eq('user_id', userId)
    .eq('mode', mode)
    .single()

  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const yday = yesterday.toISOString().split('T')[0]

  const lastPlayed = streak?.last_played
  let currentStreak = streak?.current_streak ?? 0
  let longestStreak = streak?.longest_streak ?? 0

  if (won) {
    if (lastPlayed === yday) {
      currentStreak += 1
    } else if (lastPlayed !== today) {
      currentStreak = 1
    }
    longestStreak = Math.max(longestStreak, currentStreak)
  }

  await supabaseAdmin.from('streaks').upsert({
    user_id:        userId,
    mode,
    current_streak: currentStreak,
    longest_streak: longestStreak,
    last_played:    today,
  }, { onConflict: 'user_id,mode' })
}

async function checkBadges(userId, mode, hintsUsed, timeTaken, won) {
  const earned = []

  if (won && hintsUsed === 1) earned.push('PERFECTIONIST')
  if (won && timeTaken !== null && timeTaken < 10) earned.push('SPEED_DEMON')

  const { count } = await supabaseAdmin
    .from('game_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('mode', mode)
    .eq('won', true)
  if (count === 1) earned.push('FIRST_WIN')
  if (count >= 100) earned.push(mode === 'game' ? 'GAME_MASTER' : mode === 'limited' ? 'LIMITED_EXPERT' : 'DEV_GURU')

  // Vérifie streak 7j et 30j
  const { data: streak } = await supabaseAdmin
    .from('streaks')
    .select('current_streak')
    .eq('user_id', userId)
    .eq('mode', mode)
    .single()
  if (streak?.current_streak >= 7)  earned.push('WEEK_STREAK')
  if (streak?.current_streak >= 30) earned.push('MONTH_STREAK')

  if (earned.length > 0) {
    await supabaseAdmin.from('user_badges').upsert(
      earned.map(badge_id => ({ user_id: userId, badge_id })),
      { onConflict: 'user_id,badge_id', ignoreDuplicates: true }
    )
  }
}
