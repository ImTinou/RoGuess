// Version Node.js de getDailyIndex (dupliqué depuis src/lib/daily.js)
const EPOCH = new Date('2025-01-01').getTime()

export function getDailyIndex(dataLength, date = new Date()) {
  const todayMidnight = new Date(date).setHours(0, 0, 0, 0)
  const dayNumber = Math.floor((todayMidnight - EPOCH) / 86400000)
  return ((dayNumber % dataLength) + dataLength) % dataLength
}

export function getTodayKey() {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
