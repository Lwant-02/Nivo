import React from 'react'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface NotchToastProps {
  toast: {
    title: string
    body: string
  }
  accentColor: string
}

export const NotchToast: React.FC<NotchToastProps> = ({ toast, accentColor }) => {
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        borderRadius: '30px',
        border: '1px solid rgba(255,255,255,0.25)',
        background: 'rgba(255,255,255,0.04)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.20)',
        padding: '16px',
        boxSizing: 'border-box',
        textAlign: 'center'
      }}
    >
      <div
        style={{
          width: '90px',
          height: '90px',
          flexShrink: 0
        }}
      >
        <DotLottieReact
          src="https://lottie.host/35d8a45e-69c7-47f2-b712-34a7d743d088/quPIsQA9QD.lottie"
          loop
          autoplay
          style={{ width: '100%', height: '100%' }}
        />
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '6px',
          minWidth: 0,
          width: '100%'
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: '700',
            color: accentColor,
            textTransform: 'uppercase',
            letterSpacing: '0.18em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxWidth: '100%'
          }}
        >
          {toast.title}
        </span>
        <h3
          style={{
            fontSize: '16px',
            fontWeight: '800',
            color: '#fff',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
            margin: 0,
            maxWidth: '100%'
          }}
        >
          {toast.body}
        </h3>
      </div>
    </div>
  )
}
