import { type ReactNode } from 'react'

interface FormGroupProps {
  label: string
  description?: string
  children: ReactNode
  error?: string
  className?: string
}

export function FormGroup({
  label,
  description,
  children,
  error,
  className = ''
}: FormGroupProps): JSX.Element {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-brand-text-pri">{label}</label>
      {description && (
        <p className="text-xs text-brand-text-sec">{description}</p>
      )}
      {children}
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  )
}
