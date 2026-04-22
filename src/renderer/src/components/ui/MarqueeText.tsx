import { useRef, useState, useEffect } from 'react'

interface MarqueeTextProps {
  text: string
  className?: string
  speed?: number
  pauseDuration?: number
  gap?: number
}

export default function MarqueeText({
  text,
  className = '',
  speed = 30,
  pauseDuration = 1.5,
  gap = 40
}: MarqueeTextProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLSpanElement>(null)
  const [shouldScroll, setShouldScroll] = useState(false)
  const [animStyle, setAnimStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    const check = () => {
      const container = containerRef.current
      const textEl = textRef.current
      if (!container || !textEl) return

      const tw = textEl.scrollWidth
      const cw = container.clientWidth

      if (tw > cw && cw > 0) {
        const totalShift = tw + gap
        const duration = totalShift / speed

        setShouldScroll(true)
        setAnimStyle({
          ['--marquee-shift' as string]: `-${totalShift}px`,
          animationDuration: `${duration}s`,
          animationDelay: `${pauseDuration}s`
        })
      } else {
        setShouldScroll(false)
      }
    }

    const t1 = setTimeout(check, 10)
    const t2 = setTimeout(check, 100)

    const observer = new ResizeObserver(check)
    if (containerRef.current) observer.observe(containerRef.current)

    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      observer.disconnect()
    }
  }, [text, speed, gap, pauseDuration])

  return (
    <div
      ref={containerRef}
      className={`overflow-hidden whitespace-nowrap ${className}`}
      style={{
        maskImage: shouldScroll
          ? 'linear-gradient(to right, black 0%, black 88%, transparent 100%)'
          : undefined
      }}
    >
      <div
        className={shouldScroll ? 'marquee-scroll' : ''}
        style={shouldScroll ? animStyle : undefined}
      >
        <span ref={textRef} className="inline-block shrink-0 py-1">
          {text}
        </span>
        {shouldScroll && (
          <span className="inline-block shrink-0" style={{ paddingLeft: gap }}>
            {text}
          </span>
        )}
      </div>
    </div>
  )
}
