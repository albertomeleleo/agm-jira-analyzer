import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { Card } from '../atoms/Card'
import { H3, Label } from '../atoms/Typography'
import type { SLASummary } from '../../../../shared/sla-types'

interface SLAChartsProps {
  summary: SLASummary
  className?: string
}

const COLORS = {
  met: '#10b981',
  missed: '#ef4444',
  cyan: '#00f2ff',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  amber: '#f59e0b'
}

export function SLACharts({ summary, className = '' }: SLAChartsProps): JSX.Element {
  const complianceData = useMemo(
    () => [
      {
        name: 'Reaction',
        met: summary.reactionMet,
        missed: summary.reactionMissed
      },
      {
        name: 'Resolution',
        met: summary.resolutionMet,
        missed: summary.resolutionMissed
      }
    ],
    [summary]
  )

  const typeData = useMemo(
    () =>
      Object.entries(summary.byType).map(([name, value]) => ({
        name,
        value
      })),
    [summary]
  )

  const priorityData = useMemo(
    () =>
      Object.entries(summary.byPriority).map(([name, data]) => ({
        name,
        reactionCompliance: Math.round(data.reactionCompliance),
        resolutionCompliance: Math.round(data.resolutionCompliance)
      })),
    [summary]
  )

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* Compliance overview */}
      <Card>
        <H3 className="mb-4">SLA Compliance</H3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={complianceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(22,22,31,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="met" name="Met" fill={COLORS.met} radius={[4, 4, 0, 0]} />
            <Bar dataKey="missed" name="Missed" fill={COLORS.missed} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Issue type distribution */}
      <Card>
        <H3 className="mb-4">Issue Type Distribution</H3>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie
              data={typeData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={90}
              paddingAngle={4}
              dataKey="value"
              label={({ name, value }) => `${name}: ${value}`}
            >
              {typeData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={Object.values(COLORS)[index % Object.values(COLORS).length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(22,22,31,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Priority compliance */}
      <Card className="lg:col-span-2">
        <H3 className="mb-4">Compliance by Priority</H3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" stroke="rgba(255,255,255,0.4)" fontSize={12} />
            <YAxis stroke="rgba(255,255,255,0.4)" fontSize={12} domain={[0, 100]} unit="%" />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(22,22,31,0.95)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px'
              }}
              formatter={(value: number | undefined) => `${value ?? 0}%`}
            />
            <Legend />
            <Bar
              dataKey="reactionCompliance"
              name="Reaction %"
              fill={COLORS.cyan}
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="resolutionCompliance"
              name="Resolution %"
              fill={COLORS.purple}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-2 flex justify-center gap-4">
          <Label>Target: 100% compliance across all priorities</Label>
        </div>
      </Card>
    </div>
  )
}
