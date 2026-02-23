import { useEffect, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'

// Banner AdSense en bas de page (caché pour les utilisateurs Premium)
export default function BannerAd() {
  const { isPremium } = useAuth()
  const adRef = useRef(null)

  useEffect(() => {
    if (isPremium || !adRef.current) return
    try {
      // Pousse l'annonce AdSense si le script est chargé
      ;(window.adsbygoogle = window.adsbygoogle || []).push({})
    } catch {}
  }, [isPremium])

  if (isPremium) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      background: 'rgba(13,13,15,0.95)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '6px var(--space-4)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 50,
      minHeight: 60,
    }}>
      {/* Remplace le data-ad-client et data-ad-slot par tes valeurs AdSense */}
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', maxWidth: 728, height: 60 }}
        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
        data-ad-slot="XXXXXXXXXX"
        data-ad-format="horizontal"
        data-full-width-responsive="true"
      />
    </div>
  )
}
