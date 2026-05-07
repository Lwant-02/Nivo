import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface BentoEmptyStateProps {
  title: string
  description?: string
  lottieSrc?: string
}

export const BentoEmptyState: React.FC<BentoEmptyStateProps> = ({
  title,
  description,
  lottieSrc = 'https://lottie.host/35d8a45e-69c7-47f2-b712-34a7d743d088/quPIsQA9QD.lottie'
}) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
        padding: '16px',
        boxSizing: 'border-box',
        textAlign: 'center'
      }}
    >
      <div className="relative size-[95px] shrink-0 mb-1">
        <DotLottieReact src={lottieSrc} loop autoplay style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <h3
          style={{
            color: '#fff',
            fontSize: '13px',
            fontWeight: '700',
            margin: 0,
            opacity: 0.9
          }}
        >
          {title}
        </h3>
        {description && (
          <p
            style={{
              color: 'rgba(255,255,255,0.4)',
              fontSize: '11px',
              fontWeight: '600',
              margin: 0,
              maxWidth: '180px',
              lineHeight: '1.4'
            }}
          >
            {description}
          </p>
        )}
      </div>
    </div>
  )
}
