// Sélection déterministe du daily - même résultat pour tous les users le même jour
// Ne jamais envoyer la réponse complète au client pendant la partie

const EPOCH = new Date('2025-01-01').getTime()

export function getDailyIndex(dataLength, date = new Date()) {
  const todayMidnight = new Date(date).setHours(0, 0, 0, 0)
  const dayNumber = Math.floor((todayMidnight - EPOCH) / 86400000)
  return ((dayNumber % dataLength) + dataLength) % dataLength // toujours positif
}

export function getDayNumber(date = new Date()) {
  const todayMidnight = new Date(date).setHours(0, 0, 0, 0)
  return Math.floor((todayMidnight - EPOCH) / 86400000)
}

export function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function getNextDailyMs() {
  const now = new Date()
  const tomorrow = new Date(now)
  tomorrow.setDate(tomorrow.getDate() + 1)
  tomorrow.setHours(0, 0, 0, 0)
  return tomorrow.getTime() - now.getTime()
}
