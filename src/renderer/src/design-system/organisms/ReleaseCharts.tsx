import { useState, useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { Card } from '../atoms/Card'
import { H3 } from '../atoms/Typography'
import { parseISO, startOfMonth, startOfWeek, format } from 'date-fns'
import type { JiraIssue, JiraVersion } from '../../../../shared/jira-types'

interface ReleaseEntry {
  version: JiraVersion
  issues: JiraIssue[]
  fetchedAt: string
}

interface ReleaseChartsProps {
  releases: ReleaseEntry[]
  className?: string
}

type FrequencyMode = 'month' | 'week' | 'day'

const TOOLTIP_STYLE = {
  backgroundColor: 'rgba(22,22,31,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px'
}

export function ReleaseCharts({ releases, className = '' }: ReleaseChartsProps): JSX.Element {
  const [frequencyMode, setFrequencyMode] = useState<FrequencyMode>('month')

  // Chart A — Releases Over Time (only released versions with a releaseDate)
  const releasesOverTime = useMemo(() => {
    return releases
      .filter((r) => r.version.released && r.version.releaseDate)
      .sort((a, b) => a.version.releaseDate!.localeCompare(b.version.releaseDate!))
      .map((r) => ({
        name: r.version.name,
        issues: r.issues.length
      }))
  }, [releases])

  // Chart B — Release Frequency
  const frequencyData = useMemo(() => {
    const dated = releases.filter((r) => r.version.released && r.version.releaseDate)
    const groups: Record<string, number> = {}

    for (const r of dated) {
      const date = parseISO(r.version.releaseDate!)
      let key: string
      switch (frequencyMode) {
        case 'month':
          key = format(startOfMonth(date), 'yyyy-MM')
          break
        case 'week':
          key = format(startOfWeek(date, { weekStartsOn: 1 }), 'yyyy-MM-dd')
          break
        case 'day':
          key = format(date, 'yyyy-MM-dd')
          break
      }
      groups[key] = (groups[key] ?? 0) + 1
    }

    return Object.entries(groups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, count]) => ({ period, releases: count }))
  }, [releases, frequencyMode])

  if (releasesOverTime.length === 0) return <></>

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Chart A — Releases Over Time */}
      <Card>
        <H3 className="mb-4">Releases Over Time</H3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={releasesOverTime}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={11} angle={-30} textAnchor="end" height={60} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="issues" name="Issues" fill="#00f2ff" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Chart B — Release Frequency */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <H3>Release Frequency</H3>
          <div className="flex gap-1">
            {(['month', 'week', 'day'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFrequencyMode(mode)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all
                  ${frequencyMode === mode
                    ? 'bg-brand-purple/20 text-brand-purple border border-brand-purple/30'
                    : 'text-brand-text-sec hover:text-brand-text-pri hover:bg-white/5 border border-transparent'}`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={frequencyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="period" stroke="rgba(255,255,255,0.4)" fontSize={11} angle={-30} textAnchor="end" height={60} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} allowDecimals={false} />
            <Tooltip contentStyle={TOOLTIP_STYLE} />
            <Bar dataKey="releases" name="Releases" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  )
}
