import { useMemo } from 'react'
import { format, parseISO } from 'date-fns'
import { Label } from '../atoms/Typography'
import type { SLAIssue } from '../../../../shared/sla-types'

export const PRIORITY_TO_TIER: Record<string, string> = {
  Highest: 'Expedite',
  Critical: 'Expedite',
  High: 'Critical',
  Medium: 'Major',
  Low: 'Minor',
  Lowest: 'Trivial'
}

function priorityLabel(priority: string): string {
  const tier = PRIORITY_TO_TIER[priority]
  return tier ? `${priority} (${tier})` : priority
}

export interface SLAFilterState {
  issueTypes: Set<string>
  priorities: Set<string>
  statuses: Set<string>
  dateMode: 'all' | 'month' | 'range'
  month: string | null
  dateFrom: string | null
  dateTo: string | null
}

export const DEFAULT_FILTER_STATE: SLAFilterState = {
  issueTypes: new Set(),
  priorities: new Set(),
  statuses: new Set(),
  dateMode: 'all',
  month: null,
  dateFrom: null,
  dateTo: null
}

interface SLAFiltersProps {
  issues: SLAIssue[]
  filters: SLAFilterState
  onChange: (filters: SLAFilterState) => void
}

function ToggleChip({
  label,
  active,
  onClick
}: {
  label: string
  active: boolean
  onClick: () => void
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium border transition-all duration-150
        ${
          active
            ? 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/40'
            : 'bg-brand-card/60 text-brand-text-sec border-white/10 hover:border-white/20'
        }`}
    >
      {label}
    </button>
  )
}

export function SLAFilters({ issues, filters, onChange }: SLAFiltersProps): JSX.Element {
  const uniqueTypes = useMemo(
    () => [...new Set(issues.map((i) => i.issueType))].sort(),
    [issues]
  )

  const uniquePriorities = useMemo(
    () => [...new Set(issues.map((i) => i.priority))].sort(),
    [issues]
  )

  const availableMonths = useMemo(() => {
    const months = new Set<string>()
    for (const issue of issues) {
      if (issue.created) {
        months.add(format(parseISO(issue.created), 'yyyy-MM'))
      }
    }
    return [...months].sort().reverse()
  }, [issues])

  const toggleSet = (current: Set<string>, value: string): Set<string> => {
    const next = new Set(current)
    if (next.has(value)) {
      next.delete(value)
    } else {
      next.add(value)
    }
    return next
  }

  const toggleType = (type: string): void => {
    onChange({ ...filters, issueTypes: toggleSet(filters.issueTypes, type) })
  }

  const togglePriority = (priority: string): void => {
    onChange({ ...filters, priorities: toggleSet(filters.priorities, priority) })
  }

  const toggleStatus = (status: string): void => {
    onChange({ ...filters, statuses: toggleSet(filters.statuses, status) })
  }

  const setDateMode = (mode: SLAFilterState['dateMode']): void => {
    onChange({ ...filters, dateMode: mode, month: null, dateFrom: null, dateTo: null })
  }

  return (
    <div className="glass p-4 space-y-3">
      {/* Issue Type */}
      <div className="flex items-center gap-3 flex-wrap">
        <Label className="text-xs uppercase tracking-wider w-16 shrink-0">Type</Label>
        <div className="flex gap-1.5 flex-wrap">
          {uniqueTypes.map((type) => (
            <ToggleChip
              key={type}
              label={type}
              active={filters.issueTypes.size === 0 || filters.issueTypes.has(type)}
              onClick={() => toggleType(type)}
            />
          ))}
        </div>
      </div>

      {/* Priority */}
      <div className="flex items-center gap-3 flex-wrap">
        <Label className="text-xs uppercase tracking-wider w-16 shrink-0">Priority</Label>
        <div className="flex gap-1.5 flex-wrap">
          {uniquePriorities.map((p) => (
            <ToggleChip
              key={p}
              label={priorityLabel(p)}
              active={filters.priorities.size === 0 || filters.priorities.has(p)}
              onClick={() => togglePriority(p)}
            />
          ))}
        </div>
      </div>

      {/* Status */}
      <div className="flex items-center gap-3 flex-wrap">
        <Label className="text-xs uppercase tracking-wider w-16 shrink-0">Status</Label>
        <div className="flex gap-1.5 flex-wrap">
          {(['open', 'resolved'] as const).map((s) => (
            <ToggleChip
              key={s}
              label={s === 'open' ? 'Open' : 'Resolved'}
              active={filters.statuses.size === 0 || filters.statuses.has(s)}
              onClick={() => toggleStatus(s)}
            />
          ))}
        </div>
      </div>

      {/* Date Period */}
      <div className="flex items-center gap-3 flex-wrap">
        <Label className="text-xs uppercase tracking-wider w-16 shrink-0">Period</Label>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode toggles */}
          {(['all', 'month', 'range'] as const).map((mode) => (
            <ToggleChip
              key={mode}
              label={mode === 'all' ? 'All' : mode === 'month' ? 'Month' : 'Range'}
              active={filters.dateMode === mode}
              onClick={() => setDateMode(mode)}
            />
          ))}

          {/* Month selector */}
          {filters.dateMode === 'month' && (
            <select
              value={filters.month ?? ''}
              onChange={(e) =>
                onChange({ ...filters, month: e.target.value || null })
              }
              className="px-2.5 py-1 rounded-md text-xs bg-brand-card/80 border border-white/10 text-brand-text-pri
                focus:outline-none focus:border-brand-cyan/40"
            >
              <option value="">Select month</option>
              {availableMonths.map((m) => (
                <option key={m} value={m}>
                  {format(parseISO(`${m}-01`), 'MMM yyyy')}
                </option>
              ))}
            </select>
          )}

          {/* Date range */}
          {filters.dateMode === 'range' && (
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.dateFrom ?? ''}
                onChange={(e) =>
                  onChange({ ...filters, dateFrom: e.target.value || null })
                }
                className="px-2.5 py-1 rounded-md text-xs bg-brand-card/80 border border-white/10 text-brand-text-pri
                  focus:outline-none focus:border-brand-cyan/40"
              />
              <span className="text-brand-text-sec text-xs">to</span>
              <input
                type="date"
                value={filters.dateTo ?? ''}
                onChange={(e) =>
                  onChange({ ...filters, dateTo: e.target.value || null })
                }
                className="px-2.5 py-1 rounded-md text-xs bg-brand-card/80 border border-white/10 text-brand-text-pri
                  focus:outline-none focus:border-brand-cyan/40"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
