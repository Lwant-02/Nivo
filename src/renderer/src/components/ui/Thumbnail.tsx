import { useState, useEffect } from 'react'
import { Disc3 } from 'lucide-react'
import cn from 'clsx'

const DEFAULT_ART = 'https://img.icons8.com/ios-filled/100/ffffff/music-record.png'

interface ThumbnailProps {
  src: string | null
  alt?: string
  size?: 'pill' | 'expanded'
  className?: string
  isPlaying?: boolean
  accentColor?: string
}

export function Thumbnail({
  src,
  alt = '',
  size = 'expanded',
  className = '',
  isPlaying = false,
  accentColor
}: ThumbnailProps) {
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setErrored(false)
  }, [src])

  const isPill = size === 'pill'
  const usable = src && src !== DEFAULT_ART && !errored

  if (!usable) {
    return (
      <div
        className={cn('flex flex-col overflow-hidden', isPill ? '' : 'size-full', className)}
        style={
          !isPill
            ? { background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)' }
            : {}
        }
      >
        <div className="flex-1 flex items-center justify-center p-2">
          <Disc3
            className={cn(
              isPill ? 'size-5' : 'size-10',
              isPlaying ? 'animate-spin [animation-duration:3s]' : ''
            )}
            style={{ color: accentColor || '#fff' }}
          />
        </div>
      </div>
    )
  }

  return (
    <img
      src={src as string}
      alt={alt}
      onError={() => setErrored(true)}
      className={cn(
        isPill ? 'w-6 h-3.5 overflow-hidden rounded-xs object-cover' : 'size-full object-cover',
        className
      )}
    />
  )
}
