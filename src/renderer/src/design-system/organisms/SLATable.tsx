import { useState, useMemo } from 'react'
import { ChevronDown, ChevronRight, Clock, AlertTriangle, CheckCircle, Timer } from 'lucide-react'
import { Badge } from '../atoms/Badge'
import { SearchField } from '../molecules/SearchField'
import { PRIORITY_TO_TIER } from '../molecules/SLAFilters'
import { useRemainingTime } from '../../hooks/useRemainingTime'
import { calculateRemainingMinutes } from '../../utils/sla-utils'
import type { SLAIssue, SLASegment } from '../../../../shared/sla-types'

interface SLATableProps {
  issues: SLAIssue[]
  excludeLunchBreak: boolean
  className?: string
}

function formatMinutes(minutes: number | null): string {
  if (minutes === null) return '-'
  if (minutes < 60) return `${Math.round(minutes)}m`
  const hours = Math.floor(minutes / 60)
  const mins = Math.round(minutes % 60)
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function SLABadge({ met }: { met: boolean | null }): JSX.Element {
  if (met === null) return <Badge variant="default">N/A</Badge>
  return met ? (
    <Badge variant="success">
      <CheckCircle size={12} className="mr-1" />
      Met
    </Badge>
  ) : (
    <Badge variant="danger">
      <AlertTriangle size={12} className="mr-1" />
      Missed
    </Badge>
  )
}

function formatRemaining(minutes: number | null): string {
  if (minutes === null || isNaN(minutes as number)) return '-'
  const abs = Math.abs(minutes)
  const sign = minutes < 0 ? '-' : ''
  const days = Math.floor(abs / (60 * 24))
  const hours = Math.floor((abs % (60 * 24)) / 60)
  const mins = Math.round(abs % 60)
  if (days > 0) return `${sign}${days}d ${hours}h ${mins}m`
  if (hours > 0) return `${sign}${hours}h ${mins}m`
  return `${sign}${mins}m`
}

function getRemainingVariant(minutes: number | null): 'success' | 'danger' | 'warning' | 'default' {
  if (minutes === null || isNaN(minutes as number)) return 'default'
  if (minutes <= 0) return 'danger'
  if (minutes < 60) return 'warning'
  return 'success'
}

function RemainingBadge({
  issue,
  now,
  excludeLunchBreak
}: {
  issue: SLAIssue
  now: Date
  excludeLunchBreak: boolean
}): JSX.Element {
  // Resolved issues: no remaining time to show
  if (issue.resolved !== null) return <span className="text-brand-text-sec text-sm">-</span>

  // Calculate real-time remaining minutes
  const remaining = calculateRemainingMinutes(issue, now, excludeLunchBreak)
  const variant = getRemainingVariant(remaining)

  if (remaining === null) return <Badge variant="default">N/A</Badge>

  return (
    <Badge variant={variant}>
      <Timer size={12} className="mr-1" />
      {formatRemaining(remaining)}
    </Badge>
  )
}

function formatDurationFull(minutes: number): string {
  const days = Math.floor(minutes / (60 * 24))
  const hours = Math.floor((minutes % (60 * 24)) / 60)
  const mins = Math.round(minutes % 60)
  const parts: string[] = []
  if (days > 0) parts.push(`${days}d`)
  if (hours > 0) parts.push(`${hours}h`)
  if (mins > 0 || parts.length === 0) parts.push(`${mins}m`)
  return parts.join(' ')
}

function getSegmentVariant(segment: SLASegment): 'danger' | 'info' | 'default' {
  if (segment.isPause) return 'danger'
  if (segment.isWork) return 'info'
  return 'default'
}

function IssueRow({
  issue,
  now,
  excludeLunchBreak
}: {
  issue: SLAIssue
  now: Date
  excludeLunchBreak: boolean
}): JSX.Element {
  const [expanded, setExpanded] = useState(false)

  return (
    <>
      <tr
        className="border-b border-white/5 hover:bg-brand-card/40 cursor-pointer transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {expanded ? (
              <ChevronDown size={14} className="text-brand-text-sec" />
            ) : (
              <ChevronRight size={14} className="text-brand-text-sec" />
            )}
            <span className="text-sm font-medium text-brand-cyan">{issue.key}</span>
          </div>
        </td>
        <td className="px-4 py-3 text-sm text-brand-text-pri max-w-xs truncate">
          {issue.summary}
        </td>
        <td className="px-4 py-3">
          <Badge variant="info">{issue.issueType}</Badge>
        </td>
        <td className="px-4 py-3">
          <Badge variant={issue.priority === 'Highest' || issue.priority === 'Critical' ? 'danger' : 'default'}>
            {issue.priority}{PRIORITY_TO_TIER[issue.priority] ? ` (${PRIORITY_TO_TIER[issue.priority]})` : ''}
          </Badge>
        </td>
        <td className="px-4 py-3 text-sm text-brand-text-sec">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {formatMinutes(issue.reactionTimeMinutes)}
          </div>
        </td>
        <td className="px-4 py-3">
          <SLABadge met={issue.reactionSLAMet} />
        </td>
        <td className="px-4 py-3 text-sm text-brand-text-sec">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            {formatMinutes(issue.resolutionNetMinutes)}
          </div>
        </td>
        <td className="px-4 py-3">
          <SLABadge met={issue.resolutionSLAMet} />
        </td>
        <td className="px-4 py-3">
          <RemainingBadge issue={issue} now={now} excludeLunchBreak={excludeLunchBreak} />
        </td>
      </tr>
      {expanded && (
        <tr className="bg-brand-card/20">
          <td colSpan={9} className="px-8 py-4">
            <div className="grid grid-cols-3 gap-4 text-xs">
              <div>
                <span className="text-brand-text-sec">Tier:</span>{' '}
                <span className="text-brand-text-pri font-medium">{issue.slaTier}</span>
              </div>
              <div>
                <span className="text-brand-text-sec">Pause time:</span>{' '}
                <span className="text-brand-text-pri font-medium">
                  {formatMinutes(issue.timeInPauseMinutes)}
                </span>
              </div>
              <div>
                <span className="text-brand-text-sec">24x7:</span>{' '}
                <span className="text-brand-text-pri font-medium">
                  {issue.is24x7 ? 'Yes' : 'No'}
                </span>
              </div>
              <div>
                <span className="text-brand-text-sec">Reaction target:</span>{' '}
                <span className="text-brand-text-pri font-medium">
                  {formatMinutes(issue.reactionTargetMinutes)}
                </span>
              </div>
              <div>
                <span className="text-brand-text-sec">Resolution target:</span>{' '}
                <span className="text-brand-text-pri font-medium">
                  {formatMinutes(issue.resolutionTargetMinutes)}
                </span>
              </div>
              <div>
                <span className="text-brand-text-sec">Gross resolution:</span>{' '}
                <span className="text-brand-text-pri font-medium">
                  {formatMinutes(issue.resolutionTimeMinutes)}
                </span>
              </div>
              {issue.pauseSegments.length > 0 && (
                <div className="col-span-3">
                  <span className="text-brand-text-sec block mb-1">Pause segments:</span>
                  <div className="space-y-1">
                    {issue.pauseSegments.map((seg, i) => (
                      <div key={i} className="flex gap-4 text-brand-text-sec/80">
                        <span>{seg.status}</span>
                        <span>{formatMinutes(seg.durationMinutes)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {issue.segments.length > 0 && (
                <div className="col-span-3 mt-2">
                  <span className="text-brand-text-sec block mb-2">Status Timeline:</span>
                  <div className="space-y-1.5">
                    {issue.segments.map((seg, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Badge variant={getSegmentVariant(seg)} className="min-w-[140px] justify-center text-xs">
                          {seg.status}
                        </Badge>
                        <span className="text-brand-text-pri font-medium text-xs min-w-[80px]">
                          {formatDurationFull(seg.durationMinutes)}
                        </span>
                        <span className="text-brand-text-sec/70 text-xs">
                          {new Date(seg.startTime).toLocaleDateString()} {new Date(seg.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {' → '}
                          {new Date(seg.endTime).toLocaleDateString()} {new Date(seg.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export function SLATable({ issues, excludeLunchBreak, className = '' }: SLATableProps): JSX.Element {
  const [search, setSearch] = useState('')
  const [sortField, setSortField] = useState<'key' | 'priority' | 'reaction' | 'resolution' | 'remaining'>('key')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const now = useRemainingTime()

  const filtered = useMemo(() => {
    let result = issues
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (i) =>
          i.key.toLowerCase().includes(q) ||
          i.summary.toLowerCase().includes(q) ||
          i.assignee?.toLowerCase().includes(q)
      )
    }

    result.sort((a, b) => {
      let cmp = 0
      switch (sortField) {
        case 'key':
          cmp = a.key.localeCompare(b.key)
          break
        case 'priority':
          cmp = (a.priority ?? '').localeCompare(b.priority ?? '')
          break
        case 'reaction':
          cmp = (a.reactionTimeMinutes ?? 0) - (b.reactionTimeMinutes ?? 0)
          break
        case 'resolution':
          cmp = (a.resolutionNetMinutes ?? 0) - (b.resolutionNetMinutes ?? 0)
          break
        case 'remaining': {
          const aRemaining = calculateRemainingMinutes(a, now, excludeLunchBreak) ?? Infinity
          const bRemaining = calculateRemainingMinutes(b, now, excludeLunchBreak) ?? Infinity
          cmp = aRemaining - bRemaining
          break
        }
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

    return result
  }, [issues, search, sortField, sortDir, now, excludeLunchBreak])

  const handleSort = (field: typeof sortField): void => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDir('asc')
    }
  }

  return (
    <div className={`glass overflow-hidden ${className}`}>
      <div className="p-4 border-b border-white/5">
        <SearchField placeholder="Search issues..." onSearch={setSearch} className="max-w-sm" />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10">
              {[
                { key: 'key' as const, label: 'Key' },
                { key: null, label: 'Summary' },
                { key: null, label: 'Type' },
                { key: 'priority' as const, label: 'Priority' },
                { key: 'reaction' as const, label: 'Reaction' },
                { key: null, label: 'Reaction SLA' },
                { key: 'resolution' as const, label: 'Resolution (Net)' },
                { key: null, label: 'Resolution SLA' },
                { key: 'remaining' as const, label: 'SLA Remaining' }
              ].map((col, i) => (
                <th
                  key={i}
                  className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-text-sec
                    ${col.key ? 'cursor-pointer hover:text-brand-text-pri' : ''}`}
                  onClick={() => col.key && handleSort(col.key)}
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((issue) => (
              <IssueRow key={issue.key} issue={issue} now={now} excludeLunchBreak={excludeLunchBreak} />
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-4 py-8 text-center text-sm text-brand-text-sec">
                  No issues found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
