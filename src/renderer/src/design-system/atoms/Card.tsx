import { type ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  neon?: boolean
  onClick?: () => void
}

export function Card({ children, className = '', neon = false, onClick }: CardProps): JSX.Element {
  return (
    <div
      className={`glass rounded-xl p-4 animate-fade-in-up
        ${neon ? 'neon-glow' : ''}
        ${onClick ? 'cursor-pointer glass-hover' : ''}
        ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
