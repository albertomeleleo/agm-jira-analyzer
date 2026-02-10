import { parseISO, isBefore, isAfter } from 'date-fns'
import {
  getBusinessMinutesBetween,
  getCalendarMinutesBetween,
  getNonWorkingDayMinutes
} from '../shared/business-hours'
import { isRejectedStatus } from '../shared/status-utils'
import type { JiraIssue } from '../shared/jira-types'
import type { SLAIssue, SLASegment, SLAReport, SLASummary, SLAPrioritySummary } from '../shared/sla-types'
import type { SLAGroup } from '../shared/project-types'

// --- Pause statuses ---
const PAUSE_STATUSES = [
  'Waiting for support',
  'In pausa',
  'Sospeso',
  'Pausa',
  'Dipendenza Adesso.it',
  'Dipendenza GNV'
]

// --- Work statuses (trigger resolution start) ---
const WORK_STATUSES = [
  'In Progress',
  'Presa in carico',
  'Developer Testing',
  'READY IN HOTFIX'
]

// --- Done statuses ---
const DONE_STATUSES = ['Done', 'Released']

// --- Open statuses (reaction not yet started) ---
const OPEN_STATUSES = ['Open', 'New', 'Backlog']

// --- Status transition extraction ---
interface StatusTransition {
  timestamp: Date
  fromStatus: string | null
  toStatus: string
}

function extractStatusTransitions(issue: JiraIssue): StatusTransition[] {
  const transitions: StatusTransition[] = []

  for (const history of issue.changelog.histories) {
    for (const item of history.items) {
      if (item.field === 'status' || item.field === 'Motivo Impedimento') { 
        transitions.push({
          timestamp: parseISO(history.created),
          fromStatus: item.fromString,
          toStatus: item.toString ?? ''
        })
      }
    }
  }

  transitions.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
  return transitions
}

// --- SLA parsing for a single issue ---
function isPauseStatus(status: string): boolean {
  return PAUSE_STATUSES.some(
    (ps) => status.toLowerCase() === ps.toLowerCase() || status.toLowerCase().startsWith('dipendenza')
  )
}

function isDependencyStatus(status: string): boolean {
  return status.toLowerCase().startsWith('dipendenza')
}

function isWorkStatus(status: string): boolean {
  return WORK_STATUSES.some((ws) => status.toLowerCase() === ws.toLowerCase())
}

function isDoneStatus(status: string): boolean {
  return DONE_STATUSES.some((ds) => status.toLowerCase() === ds.toLowerCase())
}

function isOpenStatus(status: string): boolean {
  return OPEN_STATUSES.some((os) => status.toLowerCase() === os.toLowerCase())
}

function isExpedite(priority: string, createdDate: Date): boolean {
  const cutoffDate = new Date(2026, 1, 1) // Feb 1, 2026
  const isHighPriority = ['Highest', 'Critical'].some(
    (p) => priority.toLowerCase() === p.toLowerCase()
  )
  return isHighPriority && isAfter(createdDate, cutoffDate)
}

function findSLAGroup(priority: string, groups: SLAGroup[]): SLAGroup | null {
  return groups.find((g) => g.priorities.some((p) => p.toLowerCase() === priority.toLowerCase())) ?? null
}

export function parseSLAForIssue(issue: JiraIssue, slaGroups: SLAGroup[], excludeLunchBreak = false): SLAIssue {
  const createdDate = parseISO(issue.fields.created)
  const priority = issue.fields.priority.name
  const issueType = issue.fields.issuetype.name
  const isTask = issueType.toLowerCase() === 'task'
  const use24x7 = isExpedite(priority, createdDate)
  const status = issue.fields.status.name
  const isRejected = isRejectedStatus(status)

  const calcMinutes = use24x7
    ? getCalendarMinutesBetween
    : (start: Date, end: Date) => getBusinessMinutesBetween(start, end, excludeLunchBreak)

  const slaGroup = findSLAGroup(priority, slaGroups)
  const transitions = extractStatusTransitions(issue)

  // --- Reaction time ---
  let reactionTimeMinutes: number | null = null
  let reactionTargetMinutes: number | null = null
  let reactionSLAMet: boolean | null = null

  // Don't calculate SLA for rejected issues
  if (!isTask && !isRejected) {
    const firstNonOpen = transitions.find(
      (t) => t.fromStatus && isOpenStatus(t.fromStatus) && !isOpenStatus(t.toStatus)
    )

    if (firstNonOpen) {
      reactionTimeMinutes = calcMinutes(createdDate, firstNonOpen.timestamp)
    }

    reactionTargetMinutes = slaGroup?.target.reactionMinutes ?? null
    if (reactionTimeMinutes !== null && reactionTargetMinutes !== null) {
      reactionSLAMet = reactionTimeMinutes <= reactionTargetMinutes
    }
  }

  // --- Resolution time ---
  let resolutionStart: Date | null = null
  let resolutionEnd: Date | null = null

  if (isTask) {
    resolutionStart = createdDate
  } else {
    const firstWork = transitions.find((t) => isWorkStatus(t.toStatus))
    if (firstWork) {
      resolutionStart = firstWork.timestamp
    } else {
      // Fallback: use end of reaction as start of resolution
      const firstNonOpen = transitions.find(
        (t) => t.fromStatus && isOpenStatus(t.fromStatus) && !isOpenStatus(t.toStatus)
      )
      if (firstNonOpen) {
        resolutionStart = firstNonOpen.timestamp
      }
    }
  }

  const doneTransition = transitions.find((t) => isDoneStatus(t.toStatus))
  if (doneTransition) {
    resolutionEnd = doneTransition.timestamp
  } else if (issue.fields.resolutiondate) {
    resolutionEnd = parseISO(issue.fields.resolutiondate)
  }

  // --- Build segments and compute pause ---
  const segments: SLASegment[] = []
  const pauseSegments: SLASegment[] = []
  const dependencySegments: SLASegment[] = []
  let timeInPauseMinutes = 0
  let timeInDependencyMinutes = 0

  if (resolutionStart) {
    let currentStatus = isTask ? 'Created' : (transitions.find((t) => isWorkStatus(t.toStatus))?.toStatus ?? 'Unknown')
    
    let segmentStart = resolutionStart
    const endBound = resolutionEnd ?? new Date()

    for (const transition of transitions) {
      if (isBefore(transition.timestamp, resolutionStart)) continue
      if (isAfter(transition.timestamp, endBound)) break

      const segDuration = calcMinutes(segmentStart, transition.timestamp)
      const isCurrentPause = isPauseStatus(currentStatus)
      const isCurrentDependency = isDependencyStatus(currentStatus)

      const segment: SLASegment = {
        status: currentStatus,
        startTime: segmentStart.toISOString(),
        endTime: transition.timestamp.toISOString(),
        durationMinutes: segDuration,
        isPause: isCurrentPause,
        isWork: !isCurrentPause
      }
      segments.push(segment)
      
      if (isCurrentPause) {
        pauseSegments.push(segment)
        timeInPauseMinutes += segDuration
      }

      if (isCurrentDependency) {
        dependencySegments.push(segment)
        timeInDependencyMinutes += segDuration
      }

      currentStatus = transition.toStatus
      segmentStart = transition.timestamp
    }

    // Final segment
    if (isBefore(segmentStart, endBound)) {
      const segDuration = calcMinutes(segmentStart, endBound)
      const isCurrentPause = isPauseStatus(currentStatus)
      const isCurrentDependency = isDependencyStatus(currentStatus)
      const segment: SLASegment = {
        status: currentStatus,
        startTime: segmentStart.toISOString(),
        endTime: endBound.toISOString(),
        durationMinutes: segDuration,
        isPause: isCurrentPause,
        isWork: !isCurrentPause
      }
      segments.push(segment)
      if (isCurrentPause) {
        pauseSegments.push(segment)
        timeInPauseMinutes += segDuration
      }
      if (isCurrentDependency) {
        dependencySegments.push(segment)
        timeInDependencyMinutes += segDuration
      }
    }
  }

  let resolutionTimeMinutes: number | null = null
  let resolutionNetMinutes: number | null = null
  let resolutionTargetMinutes: number | null = null
  let resolutionSLAMet: boolean | null = null

  let reactionRemainingMinutes: number | null = null
  let resolutionRemainingMinutes: number | null = null

  // Calculate time spent on non-working days (weekends and holidays)
  let timeInNonWorkingDaysMinutes = 0
  if (resolutionStart) {
    const endBound = resolutionEnd ?? new Date()
    timeInNonWorkingDaysMinutes = getNonWorkingDayMinutes(resolutionStart, endBound)
  }

  // Don't calculate SLA for rejected issues
  if (!isRejected) {
    if (resolutionStart && resolutionEnd) {
      resolutionTimeMinutes = calcMinutes(resolutionStart, resolutionEnd)
      resolutionNetMinutes = resolutionTimeMinutes - timeInPauseMinutes

      if (isTask) {
        resolutionTargetMinutes = 8100 // 15 business days * 9h * 60m
      } else {
        resolutionTargetMinutes = slaGroup?.target.resolutionMinutes ?? null
      }

      if (resolutionNetMinutes !== null && resolutionTargetMinutes !== null) {
        resolutionSLAMet = resolutionNetMinutes <= resolutionTargetMinutes
      }
    } else if (resolutionStart && !resolutionEnd) {
      // Open issue: compute elapsed net and remaining time
      const now = new Date()
      const elapsedGross = calcMinutes(resolutionStart, now)
      resolutionNetMinutes = elapsedGross - timeInPauseMinutes

      if (isTask) {
        resolutionTargetMinutes = 8100 // 15 business days * 9h * 60m
      } else {
        resolutionTargetMinutes = slaGroup?.target.resolutionMinutes ?? null
      }

      resolutionTimeMinutes = elapsedGross

      if (resolutionTargetMinutes !== null) {
        resolutionRemainingMinutes = resolutionTargetMinutes - resolutionNetMinutes
      }
    }

    // Reaction remaining for open issues (non-task, no first-non-open transition yet)
    if (!isTask && reactionTimeMinutes === null && !resolutionEnd) {
      const now = new Date()
      reactionTimeMinutes = calcMinutes(createdDate, now)
      reactionTargetMinutes = slaGroup?.target.reactionMinutes ?? null

      if (reactionTargetMinutes !== null) {
        reactionRemainingMinutes = reactionTargetMinutes - reactionTimeMinutes
      }
    }
  }

  return {
    key: issue.key,
    summary: issue.fields.summary,
    issueType,
    priority,
    slaTier: slaGroup?.name ?? 'Unknown',
    created: issue.fields.created,
    resolved: issue.fields.resolutiondate,
    assignee: issue.fields.assignee?.displayName ?? null,
    reactionTimeMinutes,
    reactionTargetMinutes,
    reactionSLAMet,
    reactionStart: isTask ? null : createdDate.toISOString(),
    resolutionTimeMinutes,
    resolutionNetMinutes,
    resolutionTargetMinutes,
    resolutionSLAMet,
    resolutionStart: resolutionStart ? resolutionStart.toISOString() : null,
    reactionRemainingMinutes,
    resolutionRemainingMinutes,
    timeInPauseMinutes,
    timeInDependencyMinutes,
    timeInNonWorkingDaysMinutes,
    pauseSegments,
    dependencySegments,
    segments,
    is24x7: use24x7,
    status: issue.fields.status.name,
    labels: issue.fields.labels,
    fixVersions: issue.fields.fixVersions.map((v) => v.name)
  }
}

// --- Aggregate ---
function buildSummary(issues: SLAIssue[]): SLASummary {
  const resolved = issues.filter((i) => i.resolved !== null)
  const open = issues.filter((i) => i.resolved === null)
  const rejected = issues.filter((i) => isRejectedStatus(i.status))

  const reactionEligible = issues.filter((i) => i.reactionSLAMet !== null)
  const reactionMet = reactionEligible.filter((i) => i.reactionSLAMet === true).length
  const reactionMissed = reactionEligible.filter((i) => i.reactionSLAMet === false).length

  const resolutionEligible = issues.filter((i) => i.resolutionSLAMet !== null)
  const resolutionMet = resolutionEligible.filter((i) => i.resolutionSLAMet === true).length
  const resolutionMissed = resolutionEligible.filter((i) => i.resolutionSLAMet === false).length

  const byPriority: Record<string, SLAPrioritySummary> = {}
  for (const issue of issues) {
    if (!byPriority[issue.priority]) {
      byPriority[issue.priority] = {
        total: 0,
        rejected: 0,
        reactionMet: 0,
        reactionMissed: 0,
        resolutionMet: 0,
        resolutionMissed: 0,
        reactionCompliance: 0,
        resolutionCompliance: 0
      }
    }
    const p = byPriority[issue.priority]
    p.total++
    if (isRejectedStatus(issue.status)) p.rejected++
    if (issue.reactionSLAMet === true) p.reactionMet++
    if (issue.reactionSLAMet === false) p.reactionMissed++
    if (issue.resolutionSLAMet === true) p.resolutionMet++
    if (issue.resolutionSLAMet === false) p.resolutionMissed++
  }

  for (const key of Object.keys(byPriority)) {
    const p = byPriority[key]
    const rTotal = p.reactionMet + p.reactionMissed
    const sTotal = p.resolutionMet + p.resolutionMissed
    p.reactionCompliance = rTotal > 0 ? (p.reactionMet / rTotal) * 100 : 100
    p.resolutionCompliance = sTotal > 0 ? (p.resolutionMet / sTotal) * 100 : 100
  }

  const byType: Record<string, number> = {}
  for (const issue of issues) {
    byType[issue.issueType] = (byType[issue.issueType] ?? 0) + 1
  }

  return {
    totalIssues: issues.length,
    resolvedIssues: resolved.length,
    openIssues: open.length,
    rejectedIssues: rejected.length,
    reactionCompliance: reactionEligible.length > 0 ? (reactionMet / reactionEligible.length) * 100 : 100,
    resolutionCompliance: resolutionEligible.length > 0 ? (resolutionMet / resolutionEligible.length) * 100 : 100,
    reactionMet,
    reactionMissed,
    resolutionMet,
    resolutionMissed,
    byPriority,
    byType
  }
}

export function generateSLAReport(
  issues: JiraIssue[],
  slaGroups: SLAGroup[],
  projectKey: string,
  excludeLunchBreak = false
): SLAReport {
  console.log(`[SLA Parser] Generating report for ${projectKey}. Exclude Lunch: ${excludeLunchBreak}`)
  const slaIssues = issues.map((issue) => parseSLAForIssue(issue, slaGroups, excludeLunchBreak))

  return {
    generatedAt: new Date().toISOString(),
    projectKey,
    totalIssues: slaIssues.length,
    issues: slaIssues,
    summary: buildSummary(slaIssues),
    excludeLunchBreak
  }
}
