import { getBusinessMinutesBetween, getCalendarMinutesBetween } from '../../../shared/business-hours'
import { getStatusVariant, isRejectedStatus } from '../../../shared/status-utils'
import type { SLAIssue } from '../../../shared/sla-types'

/**
 * Calculate remaining SLA time for an open issue in real-time
 * @param issue - The SLA issue
 * @param now - Current timestamp
 * @param excludeLunchBreak - Whether to exclude lunch break from calculations
 * @returns Remaining minutes (negative if overdue), or null if not applicable
 */
export function calculateRemainingMinutes(
  issue: SLAIssue,
  now: Date,
  excludeLunchBreak: boolean
): number | null {
  // Don't calculate remaining time for rejected issues
  if (isRejectedStatus(issue.status)) return null

  // Only calculate for non-closed issues (Done, Released, Resolved, Closed)
  const statusVariant = getStatusVariant(issue.status)
  if (statusVariant === 'success') return null

  const calcMinutes = issue.is24x7
    ? getCalendarMinutesBetween
    : (start: Date, end: Date) => getBusinessMinutesBetween(start, end, excludeLunchBreak)

  // Priority: Resolution SLA for issues in work, Reaction SLA for new issues
  if (issue.resolutionStart && issue.resolutionTargetMinutes !== null) {
    // Calculate net elapsed time (gross - pause)
    const resolutionStartDate = new Date(issue.resolutionStart)
    const elapsedGross = calcMinutes(resolutionStartDate, now)
    const elapsedNet = elapsedGross - issue.timeInPauseMinutes
    return issue.resolutionTargetMinutes - elapsedNet
  }

  // Fallback: Reaction SLA (for non-Tasks that haven't started work)
  if (issue.reactionStart && issue.reactionTargetMinutes !== null) {
    const reactionStartDate = new Date(issue.reactionStart)
    const elapsed = calcMinutes(reactionStartDate, now)
    return issue.reactionTargetMinutes - elapsed
  }

  return null
}

/**
 * Format remaining minutes as human-readable string
 */
export function formatRemainingTime(minutes: number | null): string {
  if (minutes === null) return 'N/A'

  if (minutes < 0) {
    const absMinutes = Math.abs(minutes)
    const hours = Math.floor(absMinutes / 60)
    const mins = absMinutes % 60
    return hours > 0 ? `-${hours}h ${mins}m` : `-${mins}m`
  }

  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
}
