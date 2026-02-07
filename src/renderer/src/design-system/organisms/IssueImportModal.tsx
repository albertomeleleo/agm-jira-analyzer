import { useState, useEffect } from 'react'
import { Download, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react'
import { Modal } from '../molecules/Modal'
import { Button } from '../atoms/Button'
import { FormGroup } from '../molecules/FormGroup'
import { useProject } from '../../contexts/ProjectContext'

interface IssueImportModalProps {
  open: boolean
  onClose: () => void
  onImportComplete: () => void
}

export function IssueImportModal({
  open,
  onClose,
  onImportComplete
}: IssueImportModalProps): JSX.Element {
  const { activeProject } = useProject()
  const [jql, setJql] = useState('')
  const [fetchStatus, setFetchStatus] = useState<'idle' | 'fetching' | 'done' | 'error'>('idle')
  const [error, setError] = useState('')
  const [fetchedCount, setFetchedCount] = useState(0)

  // Pre-populate JQL with project key
  useEffect(() => {
    if (activeProject && !jql) {
      setJql(`project = "${activeProject.config.jiraProjectKey}" ORDER BY created DESC`)
    }
  }, [activeProject, jql])

  const handleImport = async (): Promise<void> => {
    if (!activeProject || !jql.trim()) return
    setFetchStatus('fetching')
    setError('')
    try {
      const config = activeProject.config.jira
      const issues = await window.api.jiraImportIssues(config, jql, activeProject.name)
      setFetchedCount(issues.length)
      setFetchStatus('done')
      onImportComplete()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import issues')
      setFetchStatus('error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Import Issues" size="lg">
      <div className="space-y-4">
        <FormGroup
          label="JQL Query"
          description="Write a JQL query to select the issues to analyze for SLA compliance."
        >
          <textarea
            value={jql}
            onChange={(e) => setJql(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 rounded-lg text-sm font-mono
              bg-brand-card/80 border border-white/10
              text-brand-text-pri placeholder:text-brand-text-sec/50
              focus:outline-none focus:border-brand-cyan/40 focus:ring-1 focus:ring-brand-cyan/20
              transition-all duration-200 resize-y"
            placeholder='project = "PROJ" AND status changed DURING (startOfMonth(), now())'
          />
        </FormGroup>

        {/* Quick filters */}
        <div className="flex flex-wrap gap-2">
          {activeProject && (
            <>
              <button
                className="px-2 py-1 text-xs rounded-md bg-brand-card border border-white/10
                  text-brand-text-sec hover:text-brand-text-pri hover:border-brand-cyan/20 transition-all"
                onClick={() =>
                  setJql(
                    `project = "${activeProject.config.jiraProjectKey}" AND status changed DURING (startOfMonth(), now()) ORDER BY created DESC`
                  )
                }
              >
                This month
              </button>
              <button
                className="px-2 py-1 text-xs rounded-md bg-brand-card border border-white/10
                  text-brand-text-sec hover:text-brand-text-pri hover:border-brand-cyan/20 transition-all"
                onClick={() =>
                  setJql(
                    `project = "${activeProject.config.jiraProjectKey}" AND created >= -30d ORDER BY created DESC`
                  )
                }
              >
                Last 30 days
              </button>
              <button
                className="px-2 py-1 text-xs rounded-md bg-brand-card border border-white/10
                  text-brand-text-sec hover:text-brand-text-pri hover:border-brand-cyan/20 transition-all"
                onClick={() =>
                  setJql(
                    `project = "${activeProject.config.jiraProjectKey}" AND status in (Done, Released) AND resolutiondate >= startOfMonth() ORDER BY created DESC`
                  )
                }
              >
                Resolved this month
              </button>
            </>
          )}
        </div>

        {/* Status */}
        {fetchStatus === 'fetching' && (
          <div className="flex items-center gap-2 text-sm text-brand-cyan">
            <Loader2 size={16} className="animate-spin" />
            Importing issues...
          </div>
        )}

        {fetchStatus === 'done' && (
          <div className="flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle size={16} />
            Imported {fetchedCount} issues successfully
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
            disabled={!jql.trim()}
            loading={fetchStatus === 'fetching'}
            icon={<Download size={16} />}
          >
            Import Issues
          </Button>
        </div>
      </div>
    </Modal>
  )
}
