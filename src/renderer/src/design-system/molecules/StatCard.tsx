import { Card } from '../atoms/Card'
import { Label } from '../atoms/Typography'
import { type ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  icon?: ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

export function StatCard({
  label,
  value,
  subValue,
  icon,
  trend,
  className = ''
}: StatCardProps): JSX.Element {
  const trendColors = {
    up: 'text-emerald-400',
    down: 'text-red-400',
    neutral: 'text-brand-text-sec'
  }

  return (
    <Card neon className={className}>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <Label>{label}</Label>
          <span className="text-2xl font-bold text-brand-text-pri">{value}</span>
          {subValue && (
            <span className={`text-xs ${trend ? trendColors[trend] : 'text-brand-text-sec'}`}>
              {subValue}
            </span>
          )}
        </div>
        {icon && (
          <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">{icon}</div>
        )}
      </div>
    </Card>
  )
}
