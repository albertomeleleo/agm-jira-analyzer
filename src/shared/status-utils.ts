/**
 * Status badge variant type matching Badge component
 */
export type StatusBadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default'

/**
 * Maps a Jira status string to a semantic UI variant
 * @param status - Raw Jira status (e.g., "In Progress", "Done")
 * @returns Badge variant for color coding
 */
export function getStatusVariant(status: string): StatusBadgeVariant {
  const lower = status.toLowerCase()

  // Success (Green): Done, Released, Resolved, Closed
  if (
    lower.includes('done') ||
    lower.includes('released') ||
    lower.includes('resolved') ||
    lower.includes('closed')
  ) {
    return 'success'
  }

  // Danger (Red): Rejected, Won't Fix, Cancelled
  if (
    lower.includes('reject') ||
    lower.includes("won't") ||
    lower.includes('cancel')
  ) {
    return 'danger'
  }

  // Warning (Orange): In Progress, Review, Testing, Development
  if (
    lower.includes('progress') ||
    lower.includes('review') ||
    lower.includes('testing') ||
    lower.includes('development') ||
    lower.includes('presa in carico') ||
    lower.includes('developer')
  ) {
    return 'warning'
  }

  // Info (Blue): Backlog, Open, New, To Do
  if (
    lower.includes('backlog') ||
    lower.includes('open') ||
    lower.includes('new') ||
    lower.includes('to do') ||
    lower.includes('todo')
  ) {
    return 'info'
  }

  // Default (Gray): Any other status
  return 'default'
}
