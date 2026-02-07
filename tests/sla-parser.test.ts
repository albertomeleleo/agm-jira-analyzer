import { describe, it, expect } from 'vitest'
import { getBusinessMinutesBetween, parseSLAForIssue } from '../src/main/sla-parser'
import type { JiraIssue } from '../src/shared/jira-types'
import type { SLAGroup } from '../src/main/sla-parser' // Note: SLAGroup is exported from project-types but imported in parser

// --- HELPER to create mock issues ---
function createMockIssue(type: 'Bug' | 'Task', created: string, priority: string = 'High', status: string = 'Open'): JiraIssue {
  const issue: JiraIssue = {
    id: '10000',
    key: 'TEST-1',
    self: '',
    fields: {
      summary: 'Test Issue',
      status: { name: status, id: '1' },
      issuetype: { name: type, id: '1', subtask: false },
      priority: { name: priority, id: '2' },
      created: created,
      updated: created,
      resolutiondate: null,
      assignee: null,
      reporter: null,
      labels: [],
      fixVersions: [],
      components: []
    },
    changelog: { histories: [] }
  }

  if (status === 'In Progress') {
    issue.changelog.histories.push({
      id: '1',
      created: created, // Transition happened at creation time for simplicity
      items: [{ field: 'status', fromString: 'Open', toString: 'In Progress', from: '1', to: '3' }],
      author: { displayName: 'User', emailAddress: '' }
    })
  }

  return issue
}

const mockSLAGroups = [
  {
    name: 'Critical',
    priorities: ['High'],
    target: { reactionMinutes: 60, resolutionMinutes: 240 }
  }
]

describe('SLA Logic', () => {
  describe('Business Time Calculation', () => {
    it('calculates full working day (9-18) as 540 minutes', () => {
      // 04 Feb 2026 is Wednesday
      const start = new Date(2026, 1, 4, 9, 0, 0)
      const end = new Date(2026, 1, 4, 18, 0, 0)
      const minutes = getBusinessMinutesBetween(start, end, false)
      expect(minutes).toBe(540)
    })

    it('calculates full working day excluding lunch (9-18) as 480 minutes', () => {
      const start = new Date(2026, 1, 4, 9, 0, 0)
      const end = new Date(2026, 1, 4, 18, 0, 0)
      const minutes = getBusinessMinutesBetween(start, end, true)
      expect(minutes).toBe(480)
    })

    it('handles interval straddling lunch break (12:30 - 14:30)', () => {
        // Total 2h (120m). Lunch is 13-14 (60m). Net should be 60m.
        const start = new Date(2026, 1, 4, 12, 30, 0)
        const end = new Date(2026, 1, 4, 14, 30, 0)
        
        expect(getBusinessMinutesBetween(start, end, false)).toBe(120)
        expect(getBusinessMinutesBetween(start, end, true)).toBe(60)
    })

    it('handles the specific user report case (09:23 - 14:50)', () => {
        // 04 Feb 2026 09:23 -> 14:50
        // Gross: 5h 27m = 327m
        // Lunch (13-14): 60m
        // Net: 267m
        const start = new Date(2026, 1, 4, 9, 23, 0)
        const end = new Date(2026, 1, 4, 14, 50, 0)
        
        expect(getBusinessMinutesBetween(start, end, false)).toBe(327)
        expect(getBusinessMinutesBetween(start, end, true)).toBe(267)
    })
  })

  describe('Task SLA Rules', () => {
    it('should have NULL reaction target for Tasks', () => {
        const issue = createMockIssue('Task', new Date().toISOString())
        const result = parseSLAForIssue(issue, mockSLAGroups, false)
        expect(result.reactionTargetMinutes).toBeNull()
    })

    it('should have 8100 minutes (15 days) resolution target for Tasks', () => {
        const issue = createMockIssue('Task', new Date().toISOString())
        const result = parseSLAForIssue(issue, mockSLAGroups, false)
        expect(result.resolutionTargetMinutes).toBe(8100)
    })

    it('should respect priority targets for Bugs (not Tasks)', () => {
        // Bug in Progress -> Resolution SLA should be active and based on Priority
        const issue = createMockIssue('Bug', new Date().toISOString(), 'High', 'In Progress')
        const result = parseSLAForIssue(issue, mockSLAGroups, false)
        
        // Critical group target
        expect(result.reactionTargetMinutes).toBe(60)
        expect(result.resolutionTargetMinutes).toBe(240) // or dynamic if time elapsed?
        // Note: resolutionTarget depends on logic. If open, it calculates remaining based on target.
        // The parser returns resolutionTargetMinutes as the group target if resolved or if calculating remaining.
        
        // Let's verify resolutionTargetMinutes is populated from group
        // If issue is Open, resolutionTargetMinutes is set in the open block
        expect(result.resolutionTargetMinutes).toBe(240)
    })
  })
})
