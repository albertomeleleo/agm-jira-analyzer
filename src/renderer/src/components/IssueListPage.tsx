import { useState, useEffect, useCallback, useMemo } from 'react'
import { Table } from 'lucide-react'
import {
  H2,
  SLATable,
  SLAFilters,
  FilterPresetBar
} from '@design-system'
import { useProject } from '../contexts/ProjectContext'
import { usePageFilter } from '../contexts/FilterContext'
import { applyFilters } from '../../../shared/filter-utils'
import type { SLAReport } from '../../../shared/sla-types'

export function IssueListPage(): JSX.Element {
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
  } = usePageFilter('issues')
  const [report, setReport] = useState<SLAReport | null>(null)

  const loadData = useCallback(async () => {
    if (!activeProject) return
    const cached = await window.api.getSLACache(activeProject.name)
    if (cached) setReport(cached)
  }, [activeProject])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredIssues = useMemo(() => {
    if (!report) return []
    return applyFilters(report.issues, filters)
  }, [report, filters])

  const isFiltered = useMemo(() => {
    return (
      filters.issueTypes.size > 0 ||
      filters.priorities.size > 0 ||
      filters.statuses.size > 0 ||
      filters.dateMode !== 'all'
    )
  }, [filters])

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-2">
          <H2>No Project Selected</H2>
          <p className="text-sm text-brand-text-sec">
            Select a project from the sidebar to view issues
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <H2>Issue List - {activeProject.config.jiraProjectKey}</H2>
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

          {/* Table */}
          <SLATable issues={filteredIssues} excludeLunchBreak={report.excludeLunchBreak} />
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Table size={48} className="text-brand-text-sec/30" />
          <p className="text-brand-text-sec">
            No SLA data available. Generate a report from the SLA Dashboard.
          </p>
        </div>
      )}
    </div>
  )
}
