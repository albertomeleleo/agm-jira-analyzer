import { getISOWeek, getISOWeekYear } from 'date-fns'
import { projectService } from './ProjectService'
import type { SlaMetrics, WeeklyCount, SlaCompliance, PieChartDataPoint } from '../../shared/sla-types'

const BUG_AND_REQUEST_TYPES = ['bug', 'service request', 'incident', 'storia']
const TASK_TYPES = ['task', 'subtask', 'sub-task', 'story']

function isBugOrRequest(issueType: string): boolean {
  const lower = issueType.toLowerCase()
  return BUG_AND_REQUEST_TYPES.some((t) => lower.includes(t))
}

function isTask(issueType: string): boolean {
  const lower = issueType.toLowerCase()
  return TASK_TYPES.some((t) => lower === t)
}

function formatISOWeek(date: Date): string {
  const week = getISOWeek(date)
  const year = getISOWeekYear(date)
  return `${year}-W${String(week).padStart(2, '0')}`
}

function buildWeeklyCount(
  issues: Array<{ created: string; resolved: string | null }>
): WeeklyCount[] {
  const weekMap = new Map<string, { open: number; closed: number }>()

  for (const issue of issues) {
    const createdDate = new Date(issue.created)
    if (isNaN(createdDate.getTime())) continue

    const week = formatISOWeek(createdDate)
    if (!weekMap.has(week)) weekMap.set(week, { open: 0, closed: 0 })

    const entry = weekMap.get(week)!
    if (issue.resolved !== null) {
      entry.closed++
    } else {
      entry.open++
    }
  }

  return Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([week, counts]) => ({ week, ...counts }))
}

export class SlaMetricsService {
  getSlaMetrics(projectName: string): SlaMetrics | null {
    const report = projectService.getSLACache(projectName)
    if (!report) return null

    const { issues } = report

    const taskIssues = issues.filter((i) => isTask(i.issueType))
    const bugAndRequestIssues = issues.filter((i) => isBugOrRequest(i.issueType))

    const tasks: WeeklyCount[] = buildWeeklyCount(taskIssues)
    const bugsAndRequests: WeeklyCount[] = buildWeeklyCount(bugAndRequestIssues)

    // SLA compliance for response time (reaction) — bugs/service requests only
    const responseTimeSla: SlaCompliance = { inSla: 0, outOfSla: 0 }
    for (const issue of bugAndRequestIssues) {
      if (issue.reactionSLAMet === true) responseTimeSla.inSla++
      else if (issue.reactionSLAMet === false) responseTimeSla.outOfSla++
    }

    // SLA compliance for resolution time — bugs/service requests only
    const resolutionTimeSla: SlaCompliance = { inSla: 0, outOfSla: 0 }
    for (const issue of bugAndRequestIssues) {
      if (issue.resolutionSLAMet === true) resolutionTimeSla.inSla++
      else if (issue.resolutionSLAMet === false) resolutionTimeSla.outOfSla++
    }

    // Issue type distribution: bugs/service requests vs rejected
    const rejectedCount = issues.filter((i) => i.status.toLowerCase().includes('reject')).length
    const bugRequestCount = bugAndRequestIssues.length
    const issueTypeDistribution: PieChartDataPoint[] = []
    if (bugRequestCount > 0) issueTypeDistribution.push({ name: 'Bugs & Requests', value: bugRequestCount })
    if (rejectedCount > 0) issueTypeDistribution.push({ name: 'Rejected', value: rejectedCount })

    // Priority distribution — bugs/service requests only
    const priorityMap = new Map<string, number>()
    for (const issue of bugAndRequestIssues) {
      priorityMap.set(issue.priority, (priorityMap.get(issue.priority) ?? 0) + 1)
    }
    const priorityDistribution: PieChartDataPoint[] = Array.from(priorityMap.entries())
      .sort(([, a], [, b]) => b - a)
      .map(([name, value]) => ({ name, value }))

    return {
      tasks,
      bugsAndRequests,
      responseTimeSla,
      resolutionTimeSla,
      issueTypeDistribution,
      priorityDistribution
    }
  }
}

export const slaMetricsService = new SlaMetricsService()
