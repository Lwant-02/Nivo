import { useState, useEffect } from 'react'
import { Disc3 } from 'lucide-react'
import cn from 'clsx'

const DEFAULT_ART = 'https://img.icons8.com/ios-filled/100/ffffff/music-record.png'

interface ThumbnailProps {
  src: string | null
  alt?: string
  size?: 'pill' | 'expanded'
  className?: string
}

export function Thumbnail({ src, alt = '', size = 'expanded', className = '' }: ThumbnailProps) {
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    setErrored(false)
  }, [src])

  const isPill = size === 'pill'
  const usable = src && src !== DEFAULT_ART && !errored

  if (!usable) {
    return (
      <div
        className={cn(
          'flex items-center justify-center',
          isPill ? '' : 'size-full bg-purple/20',
          className
        )}
      >
        <Disc3
          className={cn(
            'text-purple animate-spin [animation-duration:2s]',
            isPill ? 'size-5' : 'size-8'
          )}
        />
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
