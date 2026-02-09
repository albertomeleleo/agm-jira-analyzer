import { parseISO, format } from 'date-fns'
import type { SLAFilterState } from './filter-types'
import type { SLAIssue } from './sla-types'
import { getStatusVariant } from './status-utils'

export function applyFilters(issues: SLAIssue[], filters: SLAFilterState): SLAIssue[] {
  return issues.filter((issue) => {
    if (filters.issueTypes.size > 0 && !filters.issueTypes.has(issue.issueType)) {
      return false
    }

    if (filters.priorities.size > 0 && !filters.priorities.has(issue.priority)) {
      return false
    }

    if (filters.statuses.size > 0) {
      // Consider an issue resolved if:
      // 1. The 'resolved' field is not null, OR
      // 2. The status indicates completion (Done, Released, Resolved, Closed)
      const statusVariant = getStatusVariant(issue.status)
      const isResolved = issue.resolved !== null || statusVariant === 'success'
      const isOpen = !isResolved

      const matchesOpen = filters.statuses.has('open') && isOpen
      const matchesResolved = filters.statuses.has('resolved') && isResolved
      if (!matchesOpen && !matchesResolved) return false
    }

    if (filters.dateMode === 'month' && filters.month) {
      const issueMonth = format(parseISO(issue.created), 'yyyy-MM')
      if (issueMonth !== filters.month) return false
    }

    if (filters.dateMode === 'range') {
      const created = issue.created.slice(0, 10)
      if (filters.dateFrom && created < filters.dateFrom) return false
      if (filters.dateTo && created > filters.dateTo) return false
    }

    if (filters.search) {
      const term = filters.search.toLowerCase()
      if (!issue.key.toLowerCase().includes(term) && !issue.summary.toLowerCase().includes(term)) {
        return false
      }
    }

    if (filters.rejectedMode === 'exclude') {
      if (issue.status.toLowerCase().includes('reject')) return false
    } else if (filters.rejectedMode === 'only') {
      if (!issue.status.toLowerCase().includes('reject')) return false
    }

    return true
  })
}
