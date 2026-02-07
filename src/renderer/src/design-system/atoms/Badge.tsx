import { type ReactNode } from 'react'

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const variantStyles: Record<BadgeVariant, string> = {
  success: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  danger: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  info: 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30',
  default: 'bg-brand-card text-brand-text-sec border-white/10'
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps): JSX.Element {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border
        ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  )
}
