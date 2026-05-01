import React from 'react'
import { Thumbnail } from './Thumbnail'
import { MusicVisualizer } from './MusicVisualizer'

interface CollapsedNotchViewProps {
  settings: any
  displayArt: string | null
  title: string
  isPlaying: boolean
  showLottie: boolean
  accentColor: string
}

export const CollapsedNotchView: React.FC<CollapsedNotchViewProps> = ({
  settings,
  displayArt,
  title,
  isPlaying,
  showLottie,
  accentColor
}) => {
  return (
    <div className="relative flex items-center px-6 h-full justify-between w-full">
      {!showLottie && (
        <div className="relative z-10 flex items-center justify-between w-full">
          <Thumbnail
            src={settings.showAlbumArt ? displayArt : null}
            alt={title}
            size="pill"
            isPlaying={isPlaying}
            accentColor={accentColor}
          />
          <MusicVisualizer isPlaying={isPlaying} isStatic={!settings.showVisualizer} />
        </div>
      )}
    </div>
  )
}
