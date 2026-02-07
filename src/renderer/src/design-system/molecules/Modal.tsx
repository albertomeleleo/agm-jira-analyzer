import { type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

const sizeStyles = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl'
}

export function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md'
}: ModalProps): JSX.Element | null {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') onClose()
    }
    if (open) document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative glass p-6 ${sizeStyles[size]} w-full mx-4 animate-fade-in-up`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-brand-text-pri">{title}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-brand-card/80 text-brand-text-sec hover:text-brand-text-pri transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
