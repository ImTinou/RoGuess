import { useState, useEffect } from 'react'

export function useLeaderboard(mode, period) {
  const [data,    setData]    = useState([])
  const [myRank,  setMyRank]  = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!mode || !period) return
    setLoading(true)
    fetchLeaderboard(mode, period)
  }, [mode, period])

  async function fetchLeaderboard(m, p) {
    try {
      // Récupère le token Supabase depuis localStorage
      const keys  = Object.keys(localStorage).filter(k => k.includes('-auth-token'))
      let token   = null
      if (keys.length) {
        try { token = JSON.parse(localStorage.getItem(keys[0]))?.access_token } catch {}
      }

      const headers = token ? { Authorization: `Bearer ${token}` } : {}
      const res = await fetch(`/api/leaderboard?mode=${m}&period=${p}`, { headers })
      const json = await res.json()
      setData(json.leaderboard ?? [])
      setMyRank(json.myRank ?? null)
    } catch {
      setData([])
    } finally {
      setLoading(false)
    }
  }

  return { data, myRank, loading, refresh: () => fetchLeaderboard(mode, period) }
}
