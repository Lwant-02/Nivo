import React from 'react'
import { motion } from 'framer-motion'
import { DotLottieReact } from '@lottiefiles/dotlottie-react'

interface NotchToastProps {
  toast: {
    title: string
    body: string
  } | null
}

export const NotchToast: React.FC<NotchToastProps> = ({ toast }) => {
  if (!toast) return null

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="absolute inset-0 z-200 flex items-center justify-center px-4 bg-transparent"
    >
      <div className="flex items-center gap-3 text-left">
        <div className="relative size-[96px] shrink-0 rounded-full overflow-hidden">
          <DotLottieReact
            src="https://lottie.host/35d8a45e-69c7-47f2-b712-34a7d743d088/quPIsQA9QD.lottie"
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </div>
        <div className="flex flex-col min-w-0 flex-1 gap-2">
          <h3 className="text-text text-[18px] text-center font-bold tracking-tight leading-tight mt-1">
            {toast.title}
          </h3>
          <span className="text-text font-bold uppercase tracking-[0.22em] text-[10px] text-center">
            {toast.body}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
