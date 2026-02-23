// POST /api/premium/webhook
// Webhook Stripe — active ou désactive le premium dans Supabase

import Stripe from 'stripe'
import { supabaseAdmin } from '../_lib/supabaseAdmin.js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export const config = { api: { bodyParser: false } }

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', chunk => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end()

  const sig = req.headers['stripe-signature']
  const rawBody = await getRawBody(req)
  let event

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return res.status(400).json({ error: `Webhook Error: ${err.message}` })
  }

  const session = event.data.object

  if (event.type === 'checkout.session.completed') {
    const userId = session.metadata?.user_id
    if (userId) {
      await supabaseAdmin.from('profiles').update({
        is_premium: true,
        premium_expires_at: null, // géré par Stripe subscription
      }).eq('id', userId)
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const customerId = session.customer
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single()
    if (profile) {
      await supabaseAdmin.from('profiles').update({
        is_premium: false,
        premium_expires_at: new Date().toISOString(),
      }).eq('id', profile.id)
    }
  }

  res.status(200).json({ received: true })
}
