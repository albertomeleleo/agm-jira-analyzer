import { useState, useEffect, useCallback, useMemo } from 'react'
import { Table, RefreshCw, Download, AlertTriangle, X } from 'lucide-react'
import {
  H2,
  Button,
  SLATable,
  SLAFilters,
  FilterPresetBar,
  IssueImportModal
} from '@design-system'
import { useProject } from '../contexts/ProjectContext'
import { usePageFilter } from '../contexts/FilterContext'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
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
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [lastJql, setLastJql] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncing, setSyncing] = useState(false)

  const loadData = useCallback(async () => {
    if (!activeProject) return
    const cached = await window.api.getSLACache(activeProject.name)
    if (cached) setReport(cached)
    const storedJql = await window.api.getLastJql(activeProject.name)
    setLastJql(storedJql)
  }, [activeProject])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSync = useCallback(async () => {
    if (!activeProject || syncing) return
    if (!lastJql) {
      setSyncError('No JQL query configured. Please use "Import Issues" to set up a query first.')
      return
    }
    setSyncing(true)
    setSyncError(null)
    try {
      const config = activeProject.config.jira
      await window.api.jiraImportIssues(config, lastJql, activeProject.name)
    } catch (err) {
      setSyncError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setSyncing(false)
      return
    }
    try {
      await window.api.generateSLAReport(
        activeProject.name,
        activeProject.config.jiraProjectKey,
        activeProject.config.slaGroups,
        activeProject.config.excludeLunchBreak ?? false
      )
      await loadData()
      setLastSyncTime(new Date())
    } catch (err) {
      setSyncError(`Report generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setSyncing(false)
    }
  }, [activeProject, lastJql, loadData, syncing])

  useAutoRefresh(handleSync, lastJql)

  const filteredIssues = useMemo(() => {
    if (!report) return []
    return applyFilters(report.issues, filters)
  }, [report, filters])

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
      <div className="flex items-center justify-between">
        <div>
          <H2>Issue List - {activeProject.config.jiraProjectKey}</H2>
          {report && (
            <p className="text-sm text-brand-text-sec mt-1">
              {filteredIssues.length} / {report.issues.length} issues
            </p>
          )}
          {lastSyncTime && (
            <p className="text-xs text-brand-text-sec mt-1">
              Last sync: {lastSyncTime.toLocaleTimeString()}
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
            variant="glass"
            size="sm"
            onClick={handleSync}
            loading={syncing}
            disabled={syncing || !lastJql}
            icon={<RefreshCw size={16} />}
            title={!lastJql ? 'Configure JQL query first using "Import Issues"' : 'Sync issues from Jira'}
          >
            Sync
          </Button>
        </div>
      </div>

      {/* Sync error */}
      {syncError && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={16} className="text-red-400 shrink-0" />
          <p className="text-sm text-red-400 flex-1">{syncError}</p>
          <button onClick={() => setSyncError(null)} className="text-red-400 hover:text-red-300">
            <X size={14} />
          </button>
        </div>
      )}

      {/* Import Modal */}
      <IssueImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={() => {
          setImportModalOpen(false)
          loadData()
        }}
        onJqlSaved={(jql: string) => setLastJql(jql)}
      />

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
