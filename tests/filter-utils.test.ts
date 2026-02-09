import { describe, it, expect } from 'vitest'
import { applyFilters } from '../src/shared/filter-utils'
import { DEFAULT_FILTER_STATE } from '../src/shared/filter-types'
import type { SLAIssue } from '../src/shared/sla-types'
import type { SLAFilterState } from '../src/shared/filter-types'

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

function makeFilters(overrides: Partial<SLAFilterState>): SLAFilterState {
  return { ...DEFAULT_FILTER_STATE, ...overrides }
}

describe('applyFilters – search', () => {
  const issues = [
    makeIssue({ key: 'PROJ-100', summary: 'Login button broken' }),
    makeIssue({ key: 'PROJ-101', summary: 'Dashboard chart empty' }),
    makeIssue({ key: 'PROJ-102', summary: 'Export PDF fails' })
  ]

  it('returns all issues when search is empty', () => {
    const result = applyFilters(issues, makeFilters({ search: '' }))
    expect(result).toHaveLength(3)
  })

  it('filters by issue key (case-insensitive)', () => {
    const result = applyFilters(issues, makeFilters({ search: 'proj-101' }))
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('PROJ-101')
  })

  it('filters by summary substring (case-insensitive)', () => {
    const result = applyFilters(issues, makeFilters({ search: 'chart' }))
    expect(result).toHaveLength(1)
    expect(result[0].summary).toBe('Dashboard chart empty')
  })

  it('matches both key and summary', () => {
    const result = applyFilters(issues, makeFilters({ search: 'export' }))
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('PROJ-102')
  })

  it('returns empty array when no match', () => {
    const result = applyFilters(issues, makeFilters({ search: 'xyz_not_found' }))
    expect(result).toHaveLength(0)
  })
})

describe('applyFilters – rejectedMode', () => {
  const issues = [
    makeIssue({ key: 'PROJ-1', status: 'Open' }),
    makeIssue({ key: 'PROJ-2', status: 'In Progress' }),
    makeIssue({ key: 'PROJ-3', status: 'Rejected' }),
    makeIssue({ key: 'PROJ-4', status: "Won't fix" }),
    makeIssue({ key: 'PROJ-5', status: 'REJECTED - Out of Scope' })
  ]

  it('include: returns all issues', () => {
    const result = applyFilters(issues, makeFilters({ rejectedMode: 'include' }))
    expect(result).toHaveLength(5)
  })

  it('exclude: removes issues whose status contains "reject"', () => {
    const result = applyFilters(issues, makeFilters({ rejectedMode: 'exclude' }))
    expect(result).toHaveLength(3)
    expect(result.every((i) => !i.status.toLowerCase().includes('reject'))).toBe(true)
  })

  it('only: keeps only issues whose status contains "reject"', () => {
    const result = applyFilters(issues, makeFilters({ rejectedMode: 'only' }))
    expect(result).toHaveLength(2)
    expect(result.every((i) => i.status.toLowerCase().includes('reject'))).toBe(true)
  })
})

describe('applyFilters – status (open/resolved)', () => {
  const issues = [
    makeIssue({ key: 'PROJ-1', status: 'Open', resolved: null }),
    makeIssue({ key: 'PROJ-2', status: 'In Progress', resolved: null }),
    makeIssue({ key: 'PROJ-3', status: 'Done', resolved: '2026-01-10T10:00:00.000Z' }),
    makeIssue({ key: 'PROJ-4', status: 'Released', resolved: '2026-01-11T10:00:00.000Z' }),
    // Issue with Done status but no resolved date (should still be considered resolved)
    makeIssue({ key: 'PROJ-5', status: 'Done', resolved: null }),
    makeIssue({ key: 'PROJ-6', status: 'Resolved', resolved: null }),
    makeIssue({ key: 'PROJ-7', status: 'Closed', resolved: '2026-01-12T10:00:00.000Z' })
  ]

  it('returns all issues when no status filter is applied', () => {
    const result = applyFilters(issues, makeFilters({ statuses: new Set() }))
    expect(result).toHaveLength(7)
  })

  it('filters for open issues (excluding Done/Released/Resolved/Closed)', () => {
    const result = applyFilters(issues, makeFilters({ statuses: new Set(['open']) }))
    expect(result).toHaveLength(2)
    expect(result.map(i => i.key).sort()).toEqual(['PROJ-1', 'PROJ-2'])
  })

  it('filters for resolved issues (including Done even without resolved date)', () => {
    const result = applyFilters(issues, makeFilters({ statuses: new Set(['resolved']) }))
    expect(result).toHaveLength(5)
    expect(result.map(i => i.key).sort()).toEqual(['PROJ-3', 'PROJ-4', 'PROJ-5', 'PROJ-6', 'PROJ-7'])
  })

  it('considers Done status as resolved even when resolved field is null', () => {
    const doneIssueOnly = [makeIssue({ key: 'TEST-1', status: 'Done', resolved: null })]
    const result = applyFilters(doneIssueOnly, makeFilters({ statuses: new Set(['resolved']) }))
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('TEST-1')
  })

  it('considers Released status as resolved even when resolved field is null', () => {
    const releasedIssueOnly = [makeIssue({ key: 'TEST-1', status: 'Released', resolved: null })]
    const result = applyFilters(releasedIssueOnly, makeFilters({ statuses: new Set(['resolved']) }))
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('TEST-1')
  })
})

describe('applyFilters – combined filters', () => {
  const issues = [
    makeIssue({ key: 'PROJ-1', summary: 'Bug one', issueType: 'Bug', status: 'Open' }),
    makeIssue({ key: 'PROJ-2', summary: 'Task two', issueType: 'Task', status: 'Rejected' }),
    makeIssue({ key: 'PROJ-3', summary: 'Bug rejected', issueType: 'Bug', status: 'Rejected' })
  ]

  it('applies search and rejectedMode together', () => {
    const result = applyFilters(
      issues,
      makeFilters({ search: 'bug', rejectedMode: 'exclude' })
    )
    expect(result).toHaveLength(1)
    expect(result[0].key).toBe('PROJ-1')
  })
})
