import { type ReactNode } from 'react'

interface TypographyProps {
  children: ReactNode
  className?: string
}

export function H1({ children, className = '' }: TypographyProps): JSX.Element {
  return (
    <h1 className={`text-3xl font-bold text-brand-text-pri tracking-tight ${className}`}>
      {children}
    </h1>
  )
}

export function H2({ children, className = '' }: TypographyProps): JSX.Element {
  return (
    <h2 className={`text-2xl font-semibold text-brand-text-pri tracking-tight ${className}`}>
      {children}
    </h2>
  )
}

export function H3({ children, className = '' }: TypographyProps): JSX.Element {
  return (
    <h3 className={`text-lg font-semibold text-brand-text-pri ${className}`}>
      {children}
    </h3>
  )
}

export function Text({ children, className = '' }: TypographyProps): JSX.Element {
  return <p className={`text-sm text-brand-text-sec leading-relaxed ${className}`}>{children}</p>
}

export function Label({ children, className = '' }: TypographyProps): JSX.Element {
  return (
    <span className={`text-xs font-medium uppercase tracking-wider text-brand-text-sec ${className}`}>
      {children}
    </span>
  )
}
