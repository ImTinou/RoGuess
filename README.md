# RoGuess 🎮

Le hub de daily games sur l'univers Roblox.

## Stack technique

- **Frontend** : React + Vite
- **Auth + DB** : Supabase (PostgreSQL + Auth)
- **API** : Vercel Serverless Functions (`/api/`)
- **Hébergement** : Vercel

---

## Installation

### 1. Cloner et installer les dépendances

```bash
npm install
```

### 2. Configurer l'environnement

Modifie le fichier `.env` :

```env
VITE_SUPABASE_URL=https://TON_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=...    # clé anon depuis Supabase > Settings > API
SUPABASE_SERVICE_ROLE_KEY=... # clé service role (côté serveur uniquement)
```

### 3. Créer les tables Supabase

Va dans **Supabase Dashboard > SQL Editor** et colle le contenu de [`supabase-schema.sql`](./supabase-schema.sql).

### 4. Activer Google OAuth (optionnel)

Dans Supabase > Authentication > Providers > Google, active le provider et ajoute tes credentials OAuth Google.

### 5. Lancer en local

```bash
npm run dev
```

L'app tourne sur `http://localhost:5173`.

---

## Déploiement sur Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Déployer
vercel

# Ou via GitHub : importe le repo sur vercel.com
```

Ajoute les variables d'environnement dans **Vercel > Settings > Environment Variables** :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` (si tu actives le premium)
- `STRIPE_WEBHOOK_SECRET`
- `VITE_SITE_URL` (ton domaine Vercel)

---

## Structure des fichiers

```
roGuess/
├── api/                     ← Vercel Serverless Functions
│   ├── game/
│   │   ├── daily.js         GET /api/game/daily?mode=...
│   │   ├── hint.js          GET /api/game/hint?mode=...&n=...
│   │   ├── guess.js         POST /api/game/guess
│   │   └── answer.js        GET /api/game/answer?mode=...
│   ├── scores/
│   │   ├── submit.js        POST /api/scores/submit
│   │   └── today.js         GET /api/scores/today?mode=...
│   ├── leaderboard/
│   │   └── index.js         GET /api/leaderboard?mode=...&period=...
│   └── premium/
│       ├── create-checkout.js
│       └── webhook.js
├── src/
│   ├── data/                ← JSON des jeux, limiteds, devs
│   ├── pages/               ← Pages React
│   ├── components/          ← Composants réutilisables
│   ├── hooks/               ← Logique métier
│   ├── lib/                 ← Supabase client, daily logic
│   ├── utils/               ← share.js, scoring.js
│   └── styles/              ← CSS
└── supabase-schema.sql      ← Schéma à importer dans Supabase
```

---

## Modes de jeu

| Mode | Description |
|------|-------------|
| 🎮 GameGuess | Devine le jeu Roblox du jour en 6 indices |
| 💎 LimitedGuess | Devine le limited/UGC Roblox du jour |
| 👤 DevGuess | Devine le développeur Roblox du jour |
| ♾️ Endless | Mode infini avec combo et multiplicateur |

### Formule de score (daily)
```
baseScore = (7 - hintsUsed) * 100    // 600 → 100
timeBonus = max(0, 60 - secondes) * 2
score     = baseScore + timeBonus
```

### Mode Endless
```
comboMultiplier = min(1 + combo × 0.25, 3.0)
roundScore      = floor(baseScore × comboMultiplier)
```

---

## Badges

| Badge | Condition |
|-------|-----------|
| 🏅 Première victoire | 1ère win |
| ⭐ Perfectionniste | Win au hint 1 |
| ⚡ Speed Demon | Win en < 10s |
| 🔥 Streak 7 jours | 7j consécutifs |
| 🌟 Streak 30 jours | 30j consécutifs |
| 🎮 Game Master | 100 GameGuess complétés |
| 💎 Limited Expert | 100 LimitedGuess complétés |
| 👤 Dev Guru | 100 DevGuess complétés |

---

## Monétisation

- **Google AdSense** : Banner bas de page + pub reward pour hint bonus
- **Premium (2.99€/mois)** : Pas de pub, hint supplémentaire, badge 👑
  - Intégration Stripe : `/api/premium/create-checkout` + `/api/premium/webhook`

Pour activer Stripe :
1. Crée les prix dans le dashboard Stripe
2. Ajoute `STRIPE_PRICE_MONTHLY` et `STRIPE_PRICE_YEARLY` dans les env vars Vercel
3. Configure le webhook Stripe pour pointer vers `https://tonsite.vercel.app/api/premium/webhook`
