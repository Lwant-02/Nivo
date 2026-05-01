import spotifyLogo from '../../assets/badges/spotify.png'
import musicLogo from '../../assets/badges/music.png'
import youtubeLogo from '../../assets/badges/youtube.png'
import chromeLogo from '../../assets/badges/chrome.png'
import braveLogo from '../../assets/badges/brave.png'
import safariLogo from '../../assets/badges/safari.png'

export const SourceBadge = ({ source, size = 16 }: { source: string, size?: number }) => {
  const logos: Record<string, string> = {
    spotify: spotifyLogo,
    music: musicLogo,
    youtube: youtubeLogo,
    chrome: chromeLogo,
    brave: braveLogo,
    safari: safariLogo
  }

  if (!logos[source]) return null

  return (
    <div
      style={{
        width: `${size}px`,
        height: `${size}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      <img
        src={logos[source]}
        alt={source}
        style={{ width: '100%', height: '100%', objectFit: 'contain', pointerEvents: 'none' }}
      />
    </div>
  )
}
