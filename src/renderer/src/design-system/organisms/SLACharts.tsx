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
import { H3 } from '../atoms/Typography'
import type { SlaMetrics } from '../../../../shared/sla-types'

interface SLAChartsProps {
  metrics: SlaMetrics
  className?: string
}

const COLORS = {
  open: '#f59e0b',
  closed: '#10b981',
  inSla: '#10b981',
  outOfSla: '#ef4444',
  cyan: '#00f2ff',
  blue: '#3b82f6',
  purple: '#8b5cf6',
  amber: '#f59e0b',
  pink: '#ec4899',
  teal: '#14b8a6'
}

const PIE_PALETTE = [
  COLORS.cyan,
  COLORS.purple,
  COLORS.amber,
  COLORS.blue,
  COLORS.pink,
  COLORS.teal
]

const tooltipStyle = {
  backgroundColor: 'rgba(22,22,31,0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '8px'
}

const axisStyle = { stroke: 'rgba(255,255,255,0.4)', fontSize: 12 }
const gridStyle = { strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.05)' }

export function SLACharts({ metrics, className = '' }: SLAChartsProps): JSX.Element {
  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 ${className}`}>
      {/* US1 — Open vs Closed Tasks per week */}
      <Card>
        <H3 className="mb-4">Open vs Closed Tasks</H3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={metrics.tasks}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="week" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="open" name="Open" fill={COLORS.open} radius={[4, 4, 0, 0]} />
            <Bar dataKey="closed" name="Closed" fill={COLORS.closed} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* US2 — Open vs Closed Bugs/Service Requests per week */}
      <Card>
        <H3 className="mb-4">Open vs Closed Bugs / Service Requests</H3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={metrics.bugsAndRequests}>
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="week" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="open" name="Open" fill={COLORS.open} radius={[4, 4, 0, 0]} />
            <Bar dataKey="closed" name="Closed" fill={COLORS.closed} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* US3 — SLA Compliance for Response Time */}
      <Card>
        <H3 className="mb-4">SLA Compliance – Response Time</H3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { name: 'Response Time', inSla: metrics.responseTimeSla.inSla, outOfSla: metrics.responseTimeSla.outOfSla }
            ]}
          >
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="name" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="inSla" name="In SLA" fill={COLORS.inSla} radius={[4, 4, 0, 0]} />
            <Bar dataKey="outOfSla" name="Out of SLA" fill={COLORS.outOfSla} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* US4 — SLA Compliance for Resolution Time */}
      <Card>
        <H3 className="mb-4">SLA Compliance – Resolution Time</H3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[
              { name: 'Resolution Time', inSla: metrics.resolutionTimeSla.inSla, outOfSla: metrics.resolutionTimeSla.outOfSla }
            ]}
          >
            <CartesianGrid {...gridStyle} />
            <XAxis dataKey="name" {...axisStyle} />
            <YAxis {...axisStyle} />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend />
            <Bar dataKey="inSla" name="In SLA" fill={COLORS.inSla} radius={[4, 4, 0, 0]} />
            <Bar dataKey="outOfSla" name="Out of SLA" fill={COLORS.outOfSla} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* US5 — Bugs/Service Requests vs Rejected Issues pie */}
      <Card>
        <H3 className="mb-4">Bugs / Service Requests vs Rejected</H3>
        {metrics.issueTypeDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={metrics.issueTypeDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${Math.round((percent ?? 0) * 100)}%`}
              >
                {metrics.issueTypeDistribution.map((_, index) => (
                  <Cell key={`cell-type-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-brand-text-sec text-sm">No Data</div>
        )}
      </Card>

      {/* US6 — Priority Distribution pie */}
      <Card>
        <H3 className="mb-4">Priority Distribution</H3>
        {metrics.priorityDistribution.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={metrics.priorityDistribution}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${Math.round((percent ?? 0) * 100)}%`}
              >
                {metrics.priorityDistribution.map((_, index) => (
                  <Cell key={`cell-prio-${index}`} fill={PIE_PALETTE[index % PIE_PALETTE.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[250px] text-brand-text-sec text-sm">No Data</div>
        )}
      </Card>
    </div>
  )
}
