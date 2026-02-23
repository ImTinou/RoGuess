// GET /api/scores/today?mode=game
// Vérifie si le user a déjà joué aujourd'hui

import { supabaseAdmin } from '../_lib/supabaseAdmin.js'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(200).json({ played: false })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return res.status(200).json({ played: false })

  const today = new Date().toISOString().split('T')[0]
  const { mode } = req.query

  const { data } = await supabaseAdmin
    .from('game_sessions')
    .select('score, won, hints_used, guesses')
    .eq('user_id', user.id)
    .eq('mode', mode)
    .eq('date', today)
    .single()

  res.status(200).json({
    played: !!data,
    session: data ?? null,
  })
}
