'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface CopyToastProps {
  message: string
  visible: boolean
}

export function CopyToast({ message, visible }: CopyToastProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className={cn(
        'fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-full bg-token-toast-bg px-4 py-2 text-xs font-medium text-token-toast-fg shadow-lg transition-all duration-300',
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
      )}
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {message}
    </div>
  )
}

// Hook for managing a toast message that auto-dismisses
export function useToast() {
  const [toast, setToast] = useState<{ message: string; visible: boolean }>({
    message: '',
    visible: false,
  })

  useEffect(() => {
    if (toast.visible) {
      const t = setTimeout(() => setToast((p) => ({ ...p, visible: false })), 1800)
      return () => clearTimeout(t)
    }
  }, [toast.visible])

  const showToast = (message: string) => {
    setToast({ message, visible: true })
  }

  return { toast, showToast }
}
