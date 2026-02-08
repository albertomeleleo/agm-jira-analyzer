import { useState, useEffect, useCallback, useMemo } from 'react'
import { Activity, AlertTriangle, Download, RefreshCw, X } from 'lucide-react'
import { Button, H2, SLACharts, IssueImportModal, SLAFilters } from '@design-system'
import { useProject } from '../contexts/ProjectContext'
import { usePageFilter } from '../contexts/FilterContext'
import { useAutoRefresh } from '../hooks/useAutoRefresh'
import { applyFilters } from '../../../shared/filter-utils'
import { calculateSlaMetrics } from '../../../shared/sla-calculations'
import type { SLAIssue } from '../../../shared/sla-types'

export function SLADashboard(): JSX.Element {
  const { activeProject } = useProject()
  const { filters, setFilters, resetFilters } = usePageFilter('dashboard')
  const [allIssues, setAllIssues] = useState<SLAIssue[]>([])
  const [importModalOpen, setImportModalOpen] = useState(false)
  const [lastJql, setLastJql] = useState<string | null>(null)
  const [syncError, setSyncError] = useState<string | null>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [syncing, setSyncing] = useState(false)

  const loadData = useCallback(async () => {
    if (!activeProject) return
    const report = await window.api.getSLACache(activeProject.name)
    if (report) setAllIssues(report.issues)
    const storedJql = await window.api.getLastJql(activeProject.name)
    setLastJql(storedJql)
  }, [activeProject])

  useEffect(() => {
    loadData()
  }, [loadData])

  const filteredIssues = useMemo(() => applyFilters(allIssues, filters), [allIssues, filters])

  const metrics: SlaMetrics | null = useMemo(
    () => (filteredIssues.length > 0 ? calculateSlaMetrics(filteredIssues) : null),
    [filteredIssues]
  )

  const handleSync = useCallback(async () => {
    if (!activeProject || syncing) return
    if (!lastJql) {
      setImportModalOpen(true)
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
          {allIssues.length > 0 && (
            <p className="text-sm text-brand-text-sec mt-1">
              {filteredIssues.length} / {allIssues.length} issues
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
            disabled={syncing}
            icon={<RefreshCw size={16} />}
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

      {/* Filters */}
      {allIssues.length > 0 && (
        <SLAFilters issues={allIssues} filters={filters} onChange={setFilters} onReset={resetFilters} />
      )}

      {metrics ? (
        <SLACharts metrics={metrics} />
      ) : (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Activity size={48} className="text-brand-text-sec/30" />
          <p className="text-brand-text-sec">
            {allIssues.length > 0
              ? 'No issues match the current filters.'
              : 'No SLA data available. Import issues from Jira and generate a report.'}
          </p>
          {allIssues.length === 0 && (
            <Button
              variant="glass"
              onClick={() => setImportModalOpen(true)}
              icon={<Download size={16} />}
            >
              Import Issues
            </Button>
          )}
        </div>
      )}

      <IssueImportModal
        open={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImportComplete={() => {
          setImportModalOpen(false)
          loadData()
        }}
        onJqlSaved={(jql: string) => setLastJql(jql)}
      />
    </div>
  )
}
