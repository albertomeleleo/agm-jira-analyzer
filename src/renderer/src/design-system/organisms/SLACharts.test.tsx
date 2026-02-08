import { render, screen } from '@testing-library/react'
import { SLACharts } from './SLACharts'
import type { SlaMetrics } from '../../../../shared/sla-types'

const mockMetrics: SlaMetrics = {
  tasks: [
    { week: '2026-W02', open: 3, closed: 5 },
    { week: '2026-W03', open: 2, closed: 4 }
  ],
  bugsAndRequests: [
    { week: '2026-W02', open: 1, closed: 2 }
  ],
  responseTimeSla: { inSla: 10, outOfSla: 2 },
  resolutionTimeSla: { inSla: 8, outOfSla: 4 },
  issueTypeDistribution: [
    { name: 'Bugs & Requests', value: 12 },
    { name: 'Rejected', value: 3 }
  ],
  priorityDistribution: [
    { name: 'High', value: 5 },
    { name: 'Medium', value: 7 },
    { name: 'Low', value: 2 }
  ]
}

describe('SLACharts', () => {
  it('renders all chart headings', () => {
    render(<SLACharts metrics={mockMetrics} />)
    expect(screen.getByText('Open vs Closed Tasks')).toBeInTheDocument()
    expect(screen.getByText('Open vs Closed Bugs / Service Requests')).toBeInTheDocument()
    expect(screen.getByText('SLA Compliance – Response Time')).toBeInTheDocument()
    expect(screen.getByText('SLA Compliance – Resolution Time')).toBeInTheDocument()
    expect(screen.getByText('Bugs / Service Requests vs Rejected')).toBeInTheDocument()
    expect(screen.getByText('Priority Distribution')).toBeInTheDocument()
  })
})
