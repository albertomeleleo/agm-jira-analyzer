import { describe, it, expect } from 'vitest'
import { calculateSlaMetrics } from '../src/shared/sla-calculations'
import type { SLAIssue } from '../src/shared/sla-types'

function makeIssue(overrides: Partial<SLAIssue>): SLAIssue {
  return {
    key: 'TEST-1',
    summary: 'Test issue',
    issueType: 'Bug',
    priority: 'Medium',
    slaTier: 'Major',
    created: '2026-01-06T10:00:00.000Z',
    resolved: null,
    assignee: null,
    reactionTimeMinutes: null,
    reactionTargetMinutes: null,
    reactionSLAMet: null,
    resolutionTimeMinutes: null,
    resolutionNetMinutes: null,
    resolutionTargetMinutes: null,
    resolutionSLAMet: null,
    reactionRemainingMinutes: null,
    resolutionRemainingMinutes: null,
    timeInPauseMinutes: 0,
    pauseSegments: [],
    segments: [],
    is24x7: false,
    status: 'Open',
    labels: [],
    fixVersions: [],
    ...overrides
  }
}

describe('calculateSlaMetrics', () => {
  it('returns empty metrics for empty issues array', () => {
    const result = calculateSlaMetrics([])
    expect(result.tasks).toHaveLength(0)
    expect(result.bugsAndRequests).toHaveLength(0)
    expect(result.responseTimeSla).toEqual({ inSla: 0, outOfSla: 0 })
    expect(result.resolutionTimeSla).toEqual({ inSla: 0, outOfSla: 0 })
    expect(result.issueTypeDistribution).toHaveLength(0)
    expect(result.priorityDistribution).toHaveLength(0)
  })

  it('aggregates tasks by week (open vs closed)', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Task', created: '2026-01-05T10:00:00.000Z', resolved: null }),
      makeIssue({ issueType: 'Task', created: '2026-01-05T11:00:00.000Z', resolved: '2026-01-06T10:00:00.000Z' }),
      makeIssue({ issueType: 'Story', created: '2026-01-12T10:00:00.000Z', resolved: null })
    ]
    const result = calculateSlaMetrics(issues)
    expect(result.tasks).toHaveLength(2)
    const week2 = result.tasks.find((w) => w.week === '2026-W02')
    expect(week2?.open).toBe(1)
    expect(week2?.closed).toBe(1)
    const week3 = result.tasks.find((w) => w.week === '2026-W03')
    expect(week3?.open).toBe(1)
  })

  it('aggregates bugs and service requests by week', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Bug', created: '2026-01-05T10:00:00.000Z', resolved: null }),
      makeIssue({ issueType: 'Service Request', created: '2026-01-05T10:00:00.000Z', resolved: '2026-01-06T10:00:00.000Z' }),
      makeIssue({ issueType: 'Task', created: '2026-01-05T10:00:00.000Z', resolved: null })
    ]
    const result = calculateSlaMetrics(issues)
    expect(result.bugsAndRequests).toHaveLength(1)
    expect(result.bugsAndRequests[0].open).toBe(1)
    expect(result.bugsAndRequests[0].closed).toBe(1)
  })

  it('computes response time SLA compliance', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Bug', reactionSLAMet: true }),
      makeIssue({ issueType: 'Bug', reactionSLAMet: true }),
      makeIssue({ issueType: 'Bug', reactionSLAMet: false }),
      makeIssue({ issueType: 'Task', reactionSLAMet: true })
    ]
    const result = calculateSlaMetrics(issues)
    expect(result.responseTimeSla.inSla).toBe(2)
    expect(result.responseTimeSla.outOfSla).toBe(1)
  })

  it('computes resolution time SLA compliance', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Bug', resolutionSLAMet: true }),
      makeIssue({ issueType: 'Bug', resolutionSLAMet: false }),
      makeIssue({ issueType: 'Bug', resolutionSLAMet: false })
    ]
    const result = calculateSlaMetrics(issues)
    expect(result.resolutionTimeSla.inSla).toBe(1)
    expect(result.resolutionTimeSla.outOfSla).toBe(2)
  })

  it('builds issue type distribution (bugs/requests vs rejected)', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Bug', status: 'Open' }),
      makeIssue({ issueType: 'Bug', status: 'Open' }),
      makeIssue({ issueType: 'Task', status: 'Rejected' }),
      makeIssue({ issueType: 'Task', status: 'Rejected' }),
      makeIssue({ issueType: 'Task', status: 'Rejected' })
    ]
    const result = calculateSlaMetrics(issues)
    const bugsEntry = result.issueTypeDistribution.find((d) => d.name === 'Bugs & Requests')
    expect(bugsEntry?.value).toBe(2)
    const rejectedEntry = result.issueTypeDistribution.find((d) => d.name === 'Rejected')
    expect(rejectedEntry?.value).toBe(3)
  })

  it('builds priority distribution for bugs and requests only', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Bug', priority: 'High' }),
      makeIssue({ issueType: 'Bug', priority: 'High' }),
      makeIssue({ issueType: 'Bug', priority: 'Low' }),
      makeIssue({ issueType: 'Task', priority: 'Critical' })
    ]
    const result = calculateSlaMetrics(issues)
    expect(result.priorityDistribution).toHaveLength(2)
    const high = result.priorityDistribution.find((d) => d.name === 'High')
    expect(high?.value).toBe(2)
    const low = result.priorityDistribution.find((d) => d.name === 'Low')
    expect(low?.value).toBe(1)
  })
})
