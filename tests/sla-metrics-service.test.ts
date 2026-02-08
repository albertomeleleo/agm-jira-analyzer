import { describe, it, expect, vi, beforeEach } from 'vitest'
import { SlaMetricsService } from '../src/main/services/SlaMetricsService'
import type { SLAReport, SLAIssue } from '../src/shared/sla-types'

function makeIssue(overrides: Partial<SLAIssue>): SLAIssue {
  return {
    key: 'TEST-1',
    summary: 'Test issue',
    issueType: 'Bug',
    priority: 'Medium',
    slaTier: 'Major',
    created: '2026-01-06T10:00:00.000Z', // Monday week 2
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

function makeReport(issues: SLAIssue[]): SLAReport {
  return {
    generatedAt: new Date().toISOString(),
    projectKey: 'TEST',
    totalIssues: issues.length,
    issues,
    summary: {
      totalIssues: issues.length,
      resolvedIssues: 0,
      openIssues: issues.length,
      reactionCompliance: 100,
      resolutionCompliance: 100,
      reactionMet: 0,
      reactionMissed: 0,
      resolutionMet: 0,
      resolutionMissed: 0,
      byPriority: {},
      byType: {}
    }
  }
}

vi.mock('../src/main/services/ProjectService', () => ({
  projectService: {
    getSLACache: vi.fn()
  }
}))

import { projectService } from '../src/main/services/ProjectService'

describe('SlaMetricsService', () => {
  let service: SlaMetricsService
  const mockGetSLACache = projectService.getSLACache as ReturnType<typeof vi.fn>

  beforeEach(() => {
    service = new SlaMetricsService()
    mockGetSLACache.mockReset()
  })

  it('returns null when no cached report exists', () => {
    mockGetSLACache.mockReturnValue(null)
    expect(service.getSlaMetrics('test-project')).toBeNull()
  })

  it('aggregates tasks by week (open vs closed)', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Task', created: '2026-01-05T10:00:00.000Z', resolved: null }), // week 2026-W02
      makeIssue({ issueType: 'Task', created: '2026-01-05T11:00:00.000Z', resolved: '2026-01-06T10:00:00.000Z' }), // closed
      makeIssue({ issueType: 'Story', created: '2026-01-12T10:00:00.000Z', resolved: null }) // week 2026-W03
    ]
    mockGetSLACache.mockReturnValue(makeReport(issues))
    const result = service.getSlaMetrics('test-project')
    expect(result).not.toBeNull()
    expect(result!.tasks).toHaveLength(2)
    const week2 = result!.tasks.find((w) => w.week === '2026-W02')
    expect(week2).toBeDefined()
    expect(week2!.open).toBe(1)
    expect(week2!.closed).toBe(1)
    const week3 = result!.tasks.find((w) => w.week === '2026-W03')
    expect(week3).toBeDefined()
    expect(week3!.open).toBe(1)
  })

  it('aggregates bugs and service requests by week', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Bug', created: '2026-01-05T10:00:00.000Z', resolved: null }),
      makeIssue({ issueType: 'Service Request', created: '2026-01-05T10:00:00.000Z', resolved: '2026-01-06T10:00:00.000Z' }),
      makeIssue({ issueType: 'Task', created: '2026-01-05T10:00:00.000Z', resolved: null }) // should not appear
    ]
    mockGetSLACache.mockReturnValue(makeReport(issues))
    const result = service.getSlaMetrics('test-project')
    expect(result!.bugsAndRequests).toHaveLength(1)
    expect(result!.bugsAndRequests[0].open).toBe(1)
    expect(result!.bugsAndRequests[0].closed).toBe(1)
  })

  it('computes response time SLA compliance', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Bug', reactionSLAMet: true }),
      makeIssue({ issueType: 'Bug', reactionSLAMet: true }),
      makeIssue({ issueType: 'Bug', reactionSLAMet: false }),
      makeIssue({ issueType: 'Task', reactionSLAMet: true }) // excluded
    ]
    mockGetSLACache.mockReturnValue(makeReport(issues))
    const result = service.getSlaMetrics('test-project')
    expect(result!.responseTimeSla.inSla).toBe(2)
    expect(result!.responseTimeSla.outOfSla).toBe(1)
  })

  it('computes resolution time SLA compliance', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Bug', resolutionSLAMet: true }),
      makeIssue({ issueType: 'Bug', resolutionSLAMet: false }),
      makeIssue({ issueType: 'Bug', resolutionSLAMet: false })
    ]
    mockGetSLACache.mockReturnValue(makeReport(issues))
    const result = service.getSlaMetrics('test-project')
    expect(result!.resolutionTimeSla.inSla).toBe(1)
    expect(result!.resolutionTimeSla.outOfSla).toBe(2)
  })

  it('builds issue type distribution (bugs/requests vs rejected)', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Bug', status: 'Open' }),
      makeIssue({ issueType: 'Bug', status: 'Open' }),
      makeIssue({ issueType: 'Task', status: 'Rejected' }),
      makeIssue({ issueType: 'Task', status: 'Rejected' }),
      makeIssue({ issueType: 'Task', status: 'Rejected' })
    ]
    mockGetSLACache.mockReturnValue(makeReport(issues))
    const result = service.getSlaMetrics('test-project')
    const bugsEntry = result!.issueTypeDistribution.find((d) => d.name === 'Bugs & Requests')
    expect(bugsEntry?.value).toBe(2)
    const rejectedEntry = result!.issueTypeDistribution.find((d) => d.name === 'Rejected')
    expect(rejectedEntry?.value).toBe(3)
  })

  it('builds priority distribution for bugs and requests only', () => {
    const issues: SLAIssue[] = [
      makeIssue({ issueType: 'Bug', priority: 'High' }),
      makeIssue({ issueType: 'Bug', priority: 'High' }),
      makeIssue({ issueType: 'Bug', priority: 'Low' }),
      makeIssue({ issueType: 'Task', priority: 'Critical' }) // excluded
    ]
    mockGetSLACache.mockReturnValue(makeReport(issues))
    const result = service.getSlaMetrics('test-project')
    expect(result!.priorityDistribution).toHaveLength(2)
    const high = result!.priorityDistribution.find((d) => d.name === 'High')
    expect(high?.value).toBe(2)
    const low = result!.priorityDistribution.find((d) => d.name === 'Low')
    expect(low?.value).toBe(1)
  })
})
