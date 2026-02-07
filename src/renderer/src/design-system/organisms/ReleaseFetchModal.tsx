import { useState, useEffect } from 'react'
import { Download, CheckCircle, AlertTriangle, Loader2, RefreshCw } from 'lucide-react'
import { Modal } from '../molecules/Modal'
import { Button } from '../atoms/Button'
import { Badge } from '../atoms/Badge'
import { useProject } from '../../contexts/ProjectContext'
import type { JiraVersion } from '../../../../shared/jira-types'

interface ReleaseFetchModalProps {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
  importedVersionIds?: Set<string>
}

export function ReleaseFetchModal({
  open,
  onClose,
  onImportComplete,
  importedVersionIds
}: ReleaseFetchModalProps): JSX.Element {
  const { activeProject } = useProject()
  const [versions, setVersions] = useState<JiraVersion[]>([])
  const [selectedVersions, setSelectedVersions] = useState<Set<string>>(new Set())
  const [loadStatus, setLoadStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [importStatus, setImportStatus] = useState<'idle' | 'importing' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 })

  const loadVersions = async (): Promise<void> => {
    if (!activeProject) return
    setLoadStatus('loading')
    setError('')
    try {
      const config = activeProject.config.jira
      const projectKey = activeProject.config.jiraProjectKey
      const result = await window.api.jiraGetVersions(config, projectKey)
      // Sort: unreleased first, then by name descending
      result.sort((a, b) => {
        if (a.released !== b.released) return a.released ? 1 : -1
        return b.name.localeCompare(a.name)
      })
      setVersions(result)
      if (importedVersionIds && importedVersionIds.size > 0) {
        setSelectedVersions(new Set(result.filter((v) => importedVersionIds.has(v.id)).map((v) => v.id)))
      }
      setLoadStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load versions')
      setLoadStatus('error')
    }
  }

  useEffect(() => {
    if (open && versions.length === 0) loadVersions()
  }, [open])

  const toggleVersion = (id: string): void => {
    setSelectedVersions((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleImport = async (): Promise<void> => {
    if (!activeProject || selectedVersions.size === 0) return
    setImportStatus('importing')
    setError('')
    const toImport = versions.filter((v) => selectedVersions.has(v.id))
    setImportProgress({ current: 0, total: toImport.length })

    try {
      const config = activeProject.config.jira
      const projectKey = activeProject.config.jiraProjectKey

      for (let i = 0; i < toImport.length; i++) {
        setImportProgress({ current: i + 1, total: toImport.length })
        await window.api.jiraFetchRelease(config, projectKey, activeProject.name, toImport[i])
      }

      setImportStatus('done')
      setSelectedVersions(new Set())
      onImportComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import releases')
      setImportStatus('error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Import Releases" size="lg">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-brand-text-sec">
            Select one or more Jira versions to import.
          </p>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadVersions}
            loading={loadStatus === 'loading'}
            icon={<RefreshCw size={14} />}
          >
            Refresh
          </Button>
        </div>

        {/* Version list */}
        {loadStatus === 'loading' && (
          <div className="flex items-center justify-center py-8 text-brand-text-sec">
            <Loader2 size={20} className="animate-spin mr-2" />
            Loading versions...
          </div>
        )}

        {loadStatus === 'done' && versions.length === 0 && (
          <p className="text-sm text-brand-text-sec text-center py-8">
            No versions found in this project.
          </p>
        )}

        {versions.length > 0 && (
          <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg border border-white/10 p-2">
            {versions.map((v) => (
              <label
                key={v.id}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all
                  ${selectedVersions.has(v.id) ? 'bg-brand-cyan/10 border border-brand-cyan/20' : 'hover:bg-brand-card/60 border border-transparent'}`}
              >
                <input
                  type="checkbox"
                  checked={selectedVersions.has(v.id)}
                  onChange={() => toggleVersion(v.id)}
                  className="rounded border-white/20 text-brand-cyan focus:ring-brand-cyan/20"
                />
                <span className="flex-1 text-sm text-brand-text-pri">{v.name}</span>
                {importedVersionIds?.has(v.id) && (
                  <Badge variant="info">Imported</Badge>
                )}
                <Badge variant={v.released ? 'success' : 'warning'}>
                  {v.released ? 'Released' : 'Unreleased'}
                </Badge>
                {v.releaseDate && (
                  <span className="text-xs text-brand-text-sec">{v.releaseDate}</span>
                )}
              </label>
            ))}
          </div>
        )}

        {/* Import progress */}
        {importStatus === 'importing' && (
          <div className="flex items-center gap-2 text-sm text-brand-cyan">
            <Loader2 size={16} className="animate-spin" />
            Importing release {importProgress.current} of {importProgress.total}...
          </div>
        )}

        {importStatus === 'done' && (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle size={16} />
            Releases imported successfully
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-red-400">
            <AlertTriangle size={16} />
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleImport}
            disabled={selectedVersions.size === 0}
            loading={importStatus === 'importing'}
            icon={<Download size={16} />}
          >
            Import {selectedVersions.size > 0 ? `(${selectedVersions.size})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  )
}
