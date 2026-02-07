import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'glass' | 'danger'
type ButtonSize = 'sm' | 'md' | 'lg'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  children: ReactNode
  loading?: boolean
  icon?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-brand-cyan text-brand-deep hover:bg-brand-cyan/90 font-semibold shadow-lg shadow-brand-cyan/20',
  secondary:
    'bg-brand-card border border-white/10 text-brand-text-pri hover:bg-brand-card/80 hover:border-brand-cyan/20',
  ghost: 'bg-transparent text-brand-text-sec hover:text-brand-text-pri hover:bg-brand-card/40',
  glass:
    'bg-brand-card/60 backdrop-blur-xl border border-white/10 text-brand-text-pri hover:bg-brand-card/80 hover:border-brand-cyan/20',
  danger: 'bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30'
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-lg',
  lg: 'px-6 py-3 text-base rounded-xl'
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}: ButtonProps): JSX.Element {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 transition-all duration-200 font-medium
        ${variantStyles[variant]} ${sizeStyles[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      ) : icon ? (
        icon
      ) : null}
      {children}
    </button>
  )
}
