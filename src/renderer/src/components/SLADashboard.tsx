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
  FilterPresetBar
} from '@design-system'
import { useProject } from '../contexts/ProjectContext'
import { useFilter } from '../contexts/FilterContext'
import { applyFilters } from '../../../shared/filter-utils'
import type { SLAReport, SLAIssue, SLASummary, SLAPrioritySummary } from '../../../shared/sla-types'

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
    if (issue.reactionSLAMet === true) reactionMet++
    else if (issue.reactionSLAMet === false) reactionMissed++

    if (issue.resolutionSLAMet === true) resolutionMet++
    else if (issue.resolutionSLAMet === false) resolutionMissed++

    byType[issue.issueType] = (byType[issue.issueType] ?? 0) + 1

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

export function SLADashboard(): JSX.Element {
  const { activeProject } = useProject()
  const {
    filters,
    setFilters,
    resetFilters,
    presets,
    savePreset,
    deletePreset,
    updatePreset,
    loadPreset
  } = useFilter()
  const [report, setReport] = useState<SLAReport | null>(null)
  const [issueCount, setIssueCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [importModalOpen, setImportModalOpen] = useState(false)

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
          {/* Filter Presets */}
          <FilterPresetBar
            presets={presets}
            onLoad={loadPreset}
            onSave={savePreset}
            onDelete={deletePreset}
            onUpdate={updatePreset}
            currentFilters={filters}
          />

          {/* Filters */}
          <SLAFilters
            issues={report.issues}
            filters={filters}
            onChange={setFilters}
            onReset={resetFilters}
          />

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
