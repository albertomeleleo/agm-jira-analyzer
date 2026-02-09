import { describe, it, expect } from 'vitest'
import { getBusinessMinutesBetween } from '../src/shared/business-hours'
import { parseSLAForIssue } from '../src/main/sla-parser'
import type { JiraIssue } from '../src/shared/jira-types'
import type { SLAGroup } from '../src/shared/project-types'

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

  describe('Dipendenza Pause Statuses', () => {
    it('should exclude "Dipendenza GNV" and "Dipendenza Adesso.it" from resolution time', () => {
      // Create a bug with status transitions including dependency pauses
      // Timeline:
      // 2026-02-04 09:00 - Created (Open)
      // 2026-02-04 09:15 - Open -> In Progress (reaction: 15m)
      // 2026-02-04 10:00 - In Progress -> Dipendenza GNV (worked: 45m)
      // 2026-02-04 12:00 - Dipendenza GNV -> In Progress (paused: 120m)
      // 2026-02-04 13:30 - In Progress -> Dipendenza Adesso.it (worked: 90m)
      // 2026-02-04 15:00 - Dipendenza Adesso.it -> In Progress (paused: 90m)
      // 2026-02-04 16:00 - In Progress -> Done (worked: 60m)
      //
      // Total work time: 45m + 90m + 60m = 195m
      // Total pause time: 120m + 90m = 210m
      // Gross resolution time: 400m (10:00 to 16:00 = 6h excluding lunch)
      // Net resolution time: 195m (gross - pause)

      const created = '2026-02-04T09:00:00.000Z'
      const issue: JiraIssue = {
        id: '10001',
        key: 'TEST-2',
        self: '',
        fields: {
          summary: 'Test Issue with Dependencies',
          status: { name: 'Done', id: '6' },
          issuetype: { name: 'Bug', id: '1', subtask: false },
          priority: { name: 'High', id: '2' },
          created,
          updated: '2026-02-04T16:00:00.000Z',
          resolutiondate: '2026-02-04T16:00:00.000Z',
          assignee: null,
          reporter: null,
          labels: [],
          fixVersions: [],
          components: []
        },
        changelog: {
          histories: [
            {
              id: '1',
              created: '2026-02-04T09:15:00.000Z',
              items: [{ field: 'status', fromString: 'Open', toString: 'In Progress', from: '1', to: '3' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '2',
              created: '2026-02-04T10:00:00.000Z',
              items: [{ field: 'status', fromString: 'In Progress', toString: 'Dipendenza GNV', from: '3', to: '10' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '3',
              created: '2026-02-04T12:00:00.000Z',
              items: [{ field: 'status', fromString: 'Dipendenza GNV', toString: '', from: '10', to: '3' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '4',
              created: '2026-02-04T13:30:00.000Z',
              items: [{ field: 'status', fromString: 'In Progress', toString: 'Dipendenza Adesso.it', from: '3', to: '11' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '5',
              created: '2026-02-04T15:00:00.000Z',
              items: [{ field: 'status', fromString: 'Dipendenza Adesso.it', toString: 'In Progress', from: '11', to: '3' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '6',
              created: '2026-02-04T16:00:00.000Z',
              items: [{ field: 'status', fromString: 'In Progress', toString: 'Done', from: '3', to: '6' }],
              author: { displayName: 'User', emailAddress: '' }
            }
          ]
        }
      }

      const result = parseSLAForIssue(issue, mockSLAGroups, false)

      // Verify pause segments are identified
      expect(result.pauseSegments).toHaveLength(2)
      expect(result.pauseSegments[0].status).toBe('Dipendenza GNV')
      expect(result.pauseSegments[1].status).toBe('Dipendenza Adesso.it')

      // Verify total pause time (120m + 90m = 210m)
      expect(result.timeInPauseMinutes).toBe(210)

      // Verify gross resolution time (09:15 to 16:00 = 6h 45m = 405 minutes)
      // Note: excludeLunchBreak = false, so lunch is NOT excluded from gross time
      expect(result.resolutionTimeMinutes).toBe(405)

      // Verify net resolution time excludes pause time (405m - 210m = 195m)
      expect(result.resolutionNetMinutes).toBe(195)

      // Verify SLA calculation uses net time
      // Critical target is 240m, net is 195m, so SLA should be MET
      expect(result.resolutionSLAMet).toBe(true)
      expect(result.resolutionTargetMinutes).toBe(240)
    })

    it('should track dependency time separately from total pause time', () => {
      // Create a bug with both dependency and non-dependency pause statuses
      // Timeline:
      // 2026-02-04 09:00 - Created (Open)
      // 2026-02-04 09:15 - Open -> In Progress
      // 2026-02-04 10:00 - In Progress -> Waiting for support (non-dependency pause: 60m)
      // 2026-02-04 11:00 - Waiting for support -> In Progress
      // 2026-02-04 12:00 - In Progress -> Dipendenza GNV (dependency pause: 120m)
      // 2026-02-04 14:00 - Dipendenza GNV -> Done

      const created = '2026-02-04T09:00:00.000Z'
      const issue: JiraIssue = {
        id: '10003',
        key: 'TEST-4',
        self: '',
        fields: {
          summary: 'Test Dependency vs Other Pause',
          status: { name: 'Done', id: '6' },
          issuetype: { name: 'Bug', id: '1', subtask: false },
          priority: { name: 'High', id: '2' },
          created,
          updated: '2026-02-04T14:00:00.000Z',
          resolutiondate: '2026-02-04T14:00:00.000Z',
          assignee: null,
          reporter: null,
          labels: [],
          fixVersions: [],
          components: []
        },
        changelog: {
          histories: [
            {
              id: '1',
              created: '2026-02-04T09:15:00.000Z',
              items: [{ field: 'status', fromString: 'Open', toString: 'In Progress', from: '1', to: '3' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '2',
              created: '2026-02-04T10:00:00.000Z',
              items: [{ field: 'status', fromString: 'In Progress', toString: 'Waiting for support', from: '3', to: '8' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '3',
              created: '2026-02-04T11:00:00.000Z',
              items: [{ field: 'status', fromString: 'Waiting for support', toString: 'In Progress', from: '8', to: '3' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '4',
              created: '2026-02-04T12:00:00.000Z',
              items: [{ field: 'status', fromString: 'In Progress', toString: 'Dipendenza GNV', from: '3', to: '10' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '5',
              created: '2026-02-04T14:00:00.000Z',
              items: [{ field: 'status', fromString: 'Dipendenza GNV', toString: 'Done', from: '10', to: '6' }],
              author: { displayName: 'User', emailAddress: '' }
            }
          ]
        }
      }

      const result = parseSLAForIssue(issue, mockSLAGroups, false)

      // Verify total pause time (60m + 120m = 180m)
      expect(result.timeInPauseMinutes).toBe(180)

      // Verify dependency time (only Dipendenza GNV: 120m)
      expect(result.timeInDependencyMinutes).toBe(120)

      // Verify dependency segments
      expect(result.dependencySegments).toHaveLength(1)
      expect(result.dependencySegments[0].status).toBe('Dipendenza GNV')
      expect(result.dependencySegments[0].durationMinutes).toBe(120)

      // Verify pause segments include both types
      expect(result.pauseSegments).toHaveLength(2)
    })

    it('should identify any status starting with "Dipendenza" as pause status', () => {
      const created = '2026-02-04T09:00:00.000Z'
      const issue: JiraIssue = {
        id: '10002',
        key: 'TEST-3',
        self: '',
        fields: {
          summary: 'Test Custom Dependency',
          status: { name: 'Done', id: '6' },
          issuetype: { name: 'Bug', id: '1', subtask: false },
          priority: { name: 'High', id: '2' },
          created,
          updated: '2026-02-04T12:00:00.000Z',
          resolutiondate: '2026-02-04T12:00:00.000Z',
          assignee: null,
          reporter: null,
          labels: [],
          fixVersions: [],
          components: []
        },
        changelog: {
          histories: [
            {
              id: '1',
              created: '2026-02-04T09:15:00.000Z',
              items: [{ field: 'status', fromString: 'Open', toString: 'In Progress', from: '1', to: '3' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '2',
              created: '2026-02-04T10:00:00.000Z',
              items: [{ field: 'status', fromString: 'In Progress', toString: 'Dipendenza Custom Cliente', from: '3', to: '12' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '3',
              created: '2026-02-04T11:00:00.000Z',
              items: [{ field: 'status', fromString: 'Dipendenza Custom Cliente', toString: 'Done', from: '12', to: '6' }],
              author: { displayName: 'User', emailAddress: '' }
            }
          ]
        }
      }

      const result = parseSLAForIssue(issue, mockSLAGroups, false)

      // Verify custom dependency status is recognized as pause
      expect(result.pauseSegments).toHaveLength(1)
      expect(result.pauseSegments[0].status).toBe('Dipendenza Custom Cliente')
      expect(result.pauseSegments[0].isPause).toBe(true)

      // Verify pause time is accumulated (60 minutes)
      expect(result.timeInPauseMinutes).toBe(60)
    })

    it('should calculate time spent on non-working days (weekends and holidays)', () => {
      // Create an issue that spans a weekend
      // 2026-02-06 (Friday) 17:00 - Created and started work
      // 2026-02-07 (Saturday) - Weekend, should count 24h = 1440m
      // 2026-02-08 (Sunday) - Weekend, should count 24h = 1440m
      // 2026-02-09 (Monday) 10:00 - Done
      // Total non-working time: ~2880 minutes (48 hours)

      const created = '2026-02-06T17:00:00.000Z'
      const issue: JiraIssue = {
        id: '10004',
        key: 'TEST-5',
        self: '',
        fields: {
          summary: 'Test Weekend Time',
          status: { name: 'Done', id: '6' },
          issuetype: { name: 'Bug', id: '1', subtask: false },
          priority: { name: 'High', id: '2' },
          created,
          updated: '2026-02-09T10:00:00.000Z',
          resolutiondate: '2026-02-09T10:00:00.000Z',
          assignee: null,
          reporter: null,
          labels: [],
          fixVersions: [],
          components: []
        },
        changelog: {
          histories: [
            {
              id: '1',
              created: '2026-02-06T17:00:00.000Z',
              items: [{ field: 'status', fromString: 'Open', toString: 'In Progress', from: '1', to: '3' }],
              author: { displayName: 'User', emailAddress: '' }
            },
            {
              id: '2',
              created: '2026-02-09T10:00:00.000Z',
              items: [{ field: 'status', fromString: 'In Progress', toString: 'Done', from: '3', to: '6' }],
              author: { displayName: 'User', emailAddress: '' }
            }
          ]
        }
      }

      const result = parseSLAForIssue(issue, mockSLAGroups, false)

      // Verify non-working days time is calculated
      // Saturday 00:00 to Sunday 23:59 = ~2880 minutes (48 hours)
      // Actually from Friday 17:00 the weekend starts at Saturday 00:00
      // From Sat 00:00 to Mon 00:00 = 2880 minutes (2 full days)
      expect(result.timeInNonWorkingDaysMinutes).toBeGreaterThan(2800)
      expect(result.timeInNonWorkingDaysMinutes).toBeLessThan(2900)
    })
  })
})
