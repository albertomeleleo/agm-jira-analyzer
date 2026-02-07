import {
  isWeekend,
  parseISO,
  differenceInMinutes,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  addDays,
  getYear,
  isBefore,
  isAfter,
  isSameDay
} from 'date-fns'
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

// --- Italian holidays ---
function getItalianHolidays(year: number): Date[] {
  const fixed = [
    new Date(year, 0, 1),   // Capodanno
    new Date(year, 0, 6),   // Epifania
    new Date(year, 3, 25),  // Liberazione
    new Date(year, 4, 1),   // Festa del Lavoro
    new Date(year, 5, 2),   // Festa della Repubblica
    new Date(year, 7, 15),  // Ferragosto
    new Date(year, 10, 1),  // Ognissanti
    new Date(year, 11, 8),  // Immacolata
    new Date(year, 11, 25), // Natale
    new Date(year, 11, 26)  // Santo Stefano
  ]

  // Easter Monday (Pasquetta) - computus algorithm
  const easterMonday = getEasterMonday(year)
  fixed.push(easterMonday)

  return fixed
}

function getEasterMonday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1

  // Easter Sunday + 1 = Easter Monday
  const easterSunday = new Date(year, month - 1, day)
  return addDays(easterSunday, 1)
}

// Holiday cache per year
const holidayCache = new Map<number, Date[]>()
function getHolidays(year: number): Date[] {
  if (!holidayCache.has(year)) {
    holidayCache.set(year, getItalianHolidays(year))
  }
  return holidayCache.get(year)!
}

function isHoliday(date: Date): boolean {
  const year = getYear(date)
  return getHolidays(year).some((h) => isSameDay(h, date))
}

function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date)
}

// --- Business time calculation ---
const WORK_START_HOUR = 9
const WORK_END_HOUR = 18
// Total minutes in a business day: (18 - 9) * 60 = 540

function setTimeOfDay(date: Date, hours: number, minutes = 0): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0)
}

const LUNCH_START_HOUR = 13
const LUNCH_END_HOUR = 14

export function getBusinessMinutesBetween(start: Date, end: Date, excludeLunch = false): number {
  if (!isBefore(start, end)) return 0
  
  // Debug log (temporary)
  console.log(`[SLA Calc] ${start.toISOString()} -> ${end.toISOString()} | ExcludeLunch: ${excludeLunch}`)

  let totalMinutes = 0
  let current = new Date(start)

  while (isBefore(current, end)) {
    if (isBusinessDay(current)) {
      const dayStart = setTimeOfDay(current, WORK_START_HOUR)
      const dayEnd = setTimeOfDay(current, WORK_END_HOUR)

      const effectiveStart = isBefore(current, dayStart) ? dayStart : current
      const effectiveEnd = isAfter(end, dayEnd) ? dayEnd : end

      if (isBefore(effectiveStart, effectiveEnd) && !isBefore(effectiveEnd, dayStart) && !isAfter(effectiveStart, dayEnd)) {
        let dayMinutes = differenceInMinutes(effectiveEnd, effectiveStart)

        if (excludeLunch) {
          const lunchStart = setTimeOfDay(current, LUNCH_START_HOUR)
          const lunchEnd = setTimeOfDay(current, LUNCH_END_HOUR)
          const overlapStart = isBefore(effectiveStart, lunchStart) ? lunchStart : effectiveStart
          const overlapEnd = isAfter(effectiveEnd, lunchEnd) ? lunchEnd : effectiveEnd
          if (isBefore(overlapStart, overlapEnd)) {
            const deduction = differenceInMinutes(overlapEnd, overlapStart)
            console.log(`[SLA Calc]   -> Deducting ${deduction}m for lunch on ${current.toISOString().slice(0,10)}`)
            dayMinutes -= deduction
          }
        }

        totalMinutes += dayMinutes
      }
    }

    current = setTimeOfDay(addDays(current, 1), 0)
  }

  return totalMinutes
}

function getCalendarMinutesBetween(start: Date, end: Date): number {
  return Math.max(0, differenceInMinutes(end, start))
}

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
      if (item.field === 'status') {
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

  const calcMinutes = use24x7
    ? getCalendarMinutesBetween
    : (start: Date, end: Date) => getBusinessMinutesBetween(start, end, excludeLunchBreak)

  const slaGroup = findSLAGroup(priority, slaGroups)
  const transitions = extractStatusTransitions(issue)

  // --- Reaction time ---
  let reactionTimeMinutes: number | null = null
  let reactionTargetMinutes: number | null = null
  let reactionSLAMet: boolean | null = null

  if (!isTask) {
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
  let timeInPauseMinutes = 0

  if (resolutionStart) {
    let currentStatus = isTask ? 'Created' : (transitions.find((t) => isWorkStatus(t.toStatus))?.toStatus ?? 'Unknown')
    let segmentStart = resolutionStart
    const endBound = resolutionEnd ?? new Date()

    for (const transition of transitions) {
      if (isBefore(transition.timestamp, resolutionStart)) continue
      if (isAfter(transition.timestamp, endBound)) break

      const segDuration = calcMinutes(segmentStart, transition.timestamp)
      const isCurrentPause = isPauseStatus(currentStatus)

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

      currentStatus = transition.toStatus
      segmentStart = transition.timestamp
    }

    // Final segment
    if (isBefore(segmentStart, endBound)) {
      const segDuration = calcMinutes(segmentStart, endBound)
      const isCurrentPause = isPauseStatus(currentStatus)
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
    }
  }

  let resolutionTimeMinutes: number | null = null
  let resolutionNetMinutes: number | null = null
  let resolutionTargetMinutes: number | null = null
  let resolutionSLAMet: boolean | null = null

  let reactionRemainingMinutes: number | null = null
  let resolutionRemainingMinutes: number | null = null

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
    resolutionTimeMinutes,
    resolutionNetMinutes,
    resolutionTargetMinutes,
    resolutionSLAMet,
    reactionRemainingMinutes,
    resolutionRemainingMinutes,
    timeInPauseMinutes,
    pauseSegments,
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
    summary: buildSummary(slaIssues)
  }
}
