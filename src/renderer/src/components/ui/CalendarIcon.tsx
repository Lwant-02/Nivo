import React from 'react'

interface CalendarIconProps {
  className?: string
  date?: number
}

export const CalendarIcon: React.FC<CalendarIconProps> = ({ className, date }) => {
  const displayDate = date || new Date().getDate()
  const displayDay = new Date().toLocaleDateString('en-US', { weekday: 'short' })

  return (
    <div className={className} style={{ perspective: '1000px' }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 128 128"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
      >
        <rect
          x="8"
          y="12"
          width="112"
          height="104"
          rx="24"
          fill="url(#bodyGradient)"
          className="transition-all duration-300"
        />

        <rect
          x="10"
          y="14"
          width="108"
          height="100"
          rx="22"
          stroke="white"
          strokeOpacity="0.2"
          strokeWidth="1"
          fill="none"
        />

        <path
          d="M8 36C8 22.7452 18.7452 12 32 12H96C109.255 12 120 22.7452 120 36V44H8V36Z"
          fill="url(#headerGradient)"
        />

        <path
          d="M32 12.5H96C106.769 12.5 115.5 21.2315 115.5 32V32V32C115.5 32 115.5 32 115.5 32"
          stroke="white"
          strokeOpacity="0.3"
          strokeWidth="1"
          strokeLinecap="round"
        />

        <text
          x="50%"
          y="98"
          textAnchor="middle"
          fill="#1A1A1A"
          fontSize="54"
          fontWeight="700"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          letterSpacing="-2"
          filter="url(#textShadow)"
        >
          {displayDate}
        </text>

        <text
          x="50%"
          y="35"
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="800"
          fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          letterSpacing="1.5"
          style={{ textTransform: 'uppercase' }}
        >
          {displayDay}
        </text>

        <defs>
          <linearGradient
            id="bodyGradient"
            x1="64"
            y1="12"
            x2="64"
            y2="116"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FFFFFF" />
            <stop offset="1" stopColor="#F0F0F0" />
          </linearGradient>

          <linearGradient
            id="headerGradient"
            x1="64"
            y1="12"
            x2="64"
            y2="44"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#FF5F5F" />
            <stop offset="1" stopColor="#E63946" />
          </linearGradient>

          <filter id="textShadow" x="0" y="0" width="128" height="128" filterUnits="userSpaceOnUse">
            <feOffset dy="1" />
            <feGaussianBlur stdDeviation="0.5" />
            <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
            <feBlend mode="normal" in="SourceGraphic" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
