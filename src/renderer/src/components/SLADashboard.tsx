import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  Download,
  RefreshCw
} from 'lucide-react'
import {
  Button,
  H2,
  StatCard,
  SLATable,
  SLACharts,
  IssueImportModal,
  SLAFilters,
  DEFAULT_FILTER_STATE
} from '@design-system'
import type { SLAFilterState } from '@design-system'
import { useProject } from '../contexts/ProjectContext'
import type { SLAReport, SLAIssue, SLASummary, SLAPrioritySummary } from '../../../shared/sla-types'
import { parseISO, format } from 'date-fns'

function computeSummary(issues: SLAIssue[]): SLASummary {
  const totalIssues = issues.length
  const resolvedIssues = issues.filter((i) => i.resolved !== null).length
  const openIssues = totalIssues - resolvedIssues

  let reactionMet = 0
  let reactionMissed = 0
  let resolutionMet = 0
  let resolutionMissed = 0

  const byType: Record<string, number> = {}
  const byPriorityAccum: Record<
    string,
    { total: number; reactionMet: number; reactionMissed: number; resolutionMet: number; resolutionMissed: number }
  > = {}

  for (const issue of issues) {
    // Reaction
    if (issue.reactionSLAMet === true) reactionMet++
    else if (issue.reactionSLAMet === false) reactionMissed++

    // Resolution
    if (issue.resolutionSLAMet === true) resolutionMet++
    else if (issue.resolutionSLAMet === false) resolutionMissed++

    // By type
    byType[issue.issueType] = (byType[issue.issueType] ?? 0) + 1

    // By priority
    if (!byPriorityAccum[issue.priority]) {
      byPriorityAccum[issue.priority] = {
        total: 0,
        reactionMet: 0,
        reactionMissed: 0,
        resolutionMet: 0,
        resolutionMissed: 0
      }
    }
    const p = byPriorityAccum[issue.priority]
    p.total++
    if (issue.reactionSLAMet === true) p.reactionMet++
    else if (issue.reactionSLAMet === false) p.reactionMissed++
    if (issue.resolutionSLAMet === true) p.resolutionMet++
    else if (issue.resolutionSLAMet === false) p.resolutionMissed++
  }

  const reactionTotal = reactionMet + reactionMissed
  const resolutionTotal = resolutionMet + resolutionMissed
  const reactionCompliance = reactionTotal > 0 ? (reactionMet / reactionTotal) * 100 : 100
  const resolutionCompliance = resolutionTotal > 0 ? (resolutionMet / resolutionTotal) * 100 : 100

  const byPriority: Record<string, SLAPrioritySummary> = {}
  for (const [key, acc] of Object.entries(byPriorityAccum)) {
    const rTotal = acc.reactionMet + acc.reactionMissed
    const rsTotal = acc.resolutionMet + acc.resolutionMissed
    byPriority[key] = {
      total: acc.total,
      reactionMet: acc.reactionMet,
      reactionMissed: acc.reactionMissed,
      resolutionMet: acc.resolutionMet,
      resolutionMissed: acc.resolutionMissed,
      reactionCompliance: rTotal > 0 ? (acc.reactionMet / rTotal) * 100 : 100,
      resolutionCompliance: rsTotal > 0 ? (acc.resolutionMet / rsTotal) * 100 : 100
    }
  }

  return {
    totalIssues,
    resolvedIssues,
    openIssues,
    reactionCompliance,
    resolutionCompliance,
    reactionMet,
    reactionMissed,
    resolutionMet,
    resolutionMissed,
    byPriority,
    byType
  }
}

function applyFilters(issues: SLAIssue[], filters: SLAFilterState): SLAIssue[] {
  return issues.filter((issue) => {
    // Issue type filter
    if (filters.issueTypes.size > 0 && !filters.issueTypes.has(issue.issueType)) {
      return false
    }

    // Priority filter
    if (filters.priorities.size > 0 && !filters.priorities.has(issue.priority)) {
      return false
    }

    // Status filter
    if (filters.statuses.size > 0) {
      const isOpen = issue.resolved === null
      const matchesOpen = filters.statuses.has('open') && isOpen
      const matchesResolved = filters.statuses.has('resolved') && !isOpen
      if (!matchesOpen && !matchesResolved) return false
    }

    // Date filter
    if (filters.dateMode === 'month' && filters.month) {
      const issueMonth = format(parseISO(issue.created), 'yyyy-MM')
      if (issueMonth !== filters.month) return false
    }

    if (filters.dateMode === 'range') {
      const created = issue.created.slice(0, 10) // "YYYY-MM-DD"
      if (filters.dateFrom && created < filters.dateFrom) return false
      if (filters.dateTo && created > filters.dateTo) return false
    }

    return true
  })
}

// --- Persistence Helpers ---
const serializeFilters = (f: SLAFilterState): string => {
  return JSON.stringify({
    ...f,
    issueTypes: Array.from(f.issueTypes),
    priorities: Array.from(f.priorities),
    statuses: Array.from(f.statuses)
  })
}

const deserializeFilters = (json: string): SLAFilterState => {
  try {
    const parsed = JSON.parse(json)
    return {
      ...parsed,
      issueTypes: new Set(parsed.issueTypes),
      priorities: new Set(parsed.priorities),
      statuses: new Set(parsed.statuses)
    }
  } catch (e) {
    console.error('Failed to parse saved filters', e)
    return DEFAULT_FILTER_STATE
  }
}

export function SLADashboard(): JSX.Element {
  const { activeProject } = useProject()
  const [report, setReport] = useState<SLAReport | null>(null)
  const [issueCount, setIssueCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [filters, setFilters] = useState<SLAFilterState>(DEFAULT_FILTER_STATE)

  const loadData = useCallback(async () => {
    if (!activeProject) return
    const cached = await window.api.getSLACache(activeProject.name)
    if (cached) setReport(cached)
    const slaData = await window.api.getSLAIssues(activeProject.name)
    if (slaData) setIssueCount(slaData.issues.length)
  }, [activeProject])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Load saved filters when project changes
  useEffect(() => {
    if (!activeProject) return
    const key = `sla_filters_${activeProject.name}`
    const saved = localStorage.getItem(key)
    if (saved) {
      setFilters(deserializeFilters(saved))
    } else {
      setFilters(DEFAULT_FILTER_STATE)
    }
  }, [activeProject?.name])

  // Save filters when they change
  useEffect(() => {
    if (!activeProject) return
    const key = `sla_filters_${activeProject.name}`
    localStorage.setItem(key, serializeFilters(filters))
  }, [filters, activeProject?.name])

  const filteredIssues = useMemo(() => {
    if (!report) return []
    return applyFilters(report.issues, filters)
  }, [report, filters])

  const filteredSummary = useMemo(() => {
    return computeSummary(filteredIssues)
  }, [filteredIssues])

  const isFiltered = useMemo(() => {
    return (
      filters.issueTypes.size > 0 ||
      filters.priorities.size > 0 ||
      filters.statuses.size > 0 ||
      filters.dateMode !== 'all'
    )
  }, [filters])

  const handleGenerateReport = async (): Promise<void> => {
    if (!activeProject) return
    setLoading(true)
    console.log('[Dashboard] Generating report with config:', activeProject.config)
    try {
      const result = await window.api.generateSLAReport(
        activeProject.name,
        activeProject.config.jiraProjectKey,
        activeProject.config.slaGroups,
        activeProject.config.excludeLunchBreak ?? false
      )
      setReport(result)
    } catch (err) {
      console.error('Failed to generate SLA report:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <H2>No Project Selected</H2>
          <p className="text-sm text-brand-text-sec">
            Select a project from the sidebar to view SLA data
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <H2>SLA Dashboard - {activeProject.config.jiraProjectKey}</H2>
          {issueCount !== null && (
            <p className="text-sm text-brand-text-sec mt-1">
              {issueCount} issues imported
            </p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setImportModalOpen(true)}
            icon={<Download size={16} />}
          >
            Import Issues
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleGenerateReport}
            loading={loading}
            disabled={issueCount === null || issueCount === 0}
            icon={<RefreshCw size={16} />}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {report ? (
        <>
          {/* Filters */}
          <SLAFilters issues={report.issues} filters={filters} onChange={setFilters} />

          {/* Filtered count indicator */}
          {isFiltered && (
            <p className="text-xs text-brand-text-sec">
              Showing {filteredIssues.length} of {report.issues.length} issues
            </p>
          )}

          {/* Stats grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Issues"
              value={filteredSummary.totalIssues}
              subValue={`${filteredSummary.resolvedIssues} resolved`}
              icon={<Activity size={20} />}
            />
            <StatCard
              label="Reaction Compliance"
              value={`${Math.round(filteredSummary.reactionCompliance)}%`}
              subValue={`${filteredSummary.reactionMet} met / ${filteredSummary.reactionMissed} missed`}
              trend={filteredSummary.reactionCompliance >= 90 ? 'up' : 'down'}
              icon={<Clock size={20} />}
            />
            <StatCard
              label="Resolution Compliance"
              value={`${Math.round(filteredSummary.resolutionCompliance)}%`}
              subValue={`${filteredSummary.resolutionMet} met / ${filteredSummary.resolutionMissed} missed`}
              trend={filteredSummary.resolutionCompliance >= 90 ? 'up' : 'down'}
              icon={<CheckCircle size={20} />}
            />
            <StatCard
              label="SLA Missed"
              value={filteredSummary.reactionMissed + filteredSummary.resolutionMissed}
              subValue="total breaches"
              trend={
                filteredSummary.reactionMissed + filteredSummary.resolutionMissed === 0
                  ? 'up'
                  : 'down'
              }
              icon={<AlertTriangle size={20} />}
            />
          </div>

          {/* Charts */}
          <SLACharts summary={filteredSummary} />

          {/* Table */}
          <SLATable issues={filteredIssues} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Activity size={48} className="text-brand-text-sec/30" />
          <p className="text-brand-text-sec">
            No SLA data available. Import issues from Jira and generate a report.
          </p>
          <Button
            variant="glass"
            onClick={() => setImportModalOpen(true)}
            icon={<Download size={16} />}
          >
            Import Issues
          </Button>
        </div>
      )}

      <IssueImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={() => {
          setImportModalOpen(false)
          loadData()
        }}
      />
    </div>
  )
}
