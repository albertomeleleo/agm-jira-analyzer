import { type InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-sm font-medium text-brand-text-sec">{label}</label>
        )}
        <input
          ref={ref}
          className={`w-full px-3 py-2 rounded-lg text-sm
            bg-brand-card/80 border border-white/10
            text-brand-text-pri placeholder:text-brand-text-sec/50
            focus:outline-none focus:border-brand-cyan/40 focus:ring-1 focus:ring-brand-cyan/20
            transition-all duration-200
            ${error ? 'border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20' : ''}
            ${className}`}
          {...props}
        />
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    )
  }
)

Input.displayName = 'Input'
