import spotifyLogo from '../../assets/badges/spotify.png'
import musicLogo from '../../assets/badges/music.png'
import youtubeLogo from '../../assets/badges/youtube.png'
import chromeLogo from '../../assets/badges/chrome.png'
import braveLogo from '../../assets/badges/brave.png'
import safariLogo from '../../assets/badges/safari.png'

export const SourceBadge = ({ source }: { source: string }) => {
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
    <div className="absolute -bottom-1 -right-1 size-4 flex items-center justify-center overflow-hidden">
      <img
        src={logos[source]}
        alt={source}
        className="size-full object-contain pointer-events-none"
      />
    </div>
  )
}
