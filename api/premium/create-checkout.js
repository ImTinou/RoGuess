// POST /api/premium/create-checkout
// Crée une session Stripe Checkout pour l'abonnement premium

import Stripe from 'stripe'
import { supabaseAdmin } from '../_lib/supabaseAdmin.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const PRICE_IDS = {
  monthly: process.env.STRIPE_PRICE_MONTHLY, // À créer dans le dashboard Stripe
  yearly:  process.env.STRIPE_PRICE_YEARLY,
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Non authentifié' })

  const { data: { user } } = await supabaseAdmin.auth.getUser(token)
  if (!user) return res.status(401).json({ error: 'Token invalide' })

  const { plan = 'monthly' } = req.body ?? {}
  const priceId = PRICE_IDS[plan]
  if (!priceId) return res.status(400).json({ error: 'Plan invalide' })

  const siteUrl = process.env.VITE_SITE_URL ?? 'https://roguess.vercel.app'

  const session = await stripe.checkout.sessions.create({
    mode:            'subscription',
    line_items:      [{ price: priceId, quantity: 1 }],
    success_url:     `${siteUrl}/profile?premium=success`,
    cancel_url:      `${siteUrl}/profile?premium=cancelled`,
    customer_email:  user.email,
    metadata:        { user_id: user.id },
  })

  res.status(200).json({ url: session.url })
}
