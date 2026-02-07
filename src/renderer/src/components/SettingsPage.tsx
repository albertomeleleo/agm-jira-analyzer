import { useState, useEffect } from 'react'
import { Save, FolderOpen } from 'lucide-react'
import { Button, Input, Card, H2, H3, FormGroup } from '@design-system'
import { useProject } from '../contexts/ProjectContext'
import type { AppSettings } from '../../../shared/project-types'

export function SettingsPage(): JSX.Element {
  const { activeProject, refreshProjects } = useProject()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [jiraHost, setJiraHost] = useState('')
  const [jiraEmail, setJiraEmail] = useState('')
  const [jiraToken, setJiraToken] = useState('')
  const [excludeLunchBreak, setExcludeLunchBreak] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    window.api.getSettings().then(setSettings)
  }, [])

  useEffect(() => {
    if (activeProject) {
      setJiraHost(activeProject.config.jira.host)
      setJiraEmail(activeProject.config.jira.email)
      setJiraToken(activeProject.config.jira.apiToken)
      setExcludeLunchBreak(activeProject.config.excludeLunchBreak ?? false)
    }
  }, [activeProject])

  const handleChangeStorage = async (): Promise<void> => {
    const dir = await window.api.selectDirectory()
    if (dir) {
      const updated = await window.api.setStorageRoot(dir)
      setSettings(updated)
      await refreshProjects()
    }
  }

  const handleSaveJira = async (): Promise<void> => {
    if (!activeProject) return
    const updatedConfig = {
      ...activeProject.config,
      jira: { host: jiraHost, email: jiraEmail, apiToken: jiraToken },
      excludeLunchBreak
    }
    await window.api.updateProjectConfig(activeProject.name, updatedConfig)
    await refreshProjects()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleToggleLunch = async (): Promise<void> => {
    if (!activeProject) return
    const newValue = !excludeLunchBreak
    setExcludeLunchBreak(newValue) // Optimistic update

    const updatedConfig = {
      ...activeProject.config,
      excludeLunchBreak: newValue
    }
    await window.api.updateProjectConfig(activeProject.name, updatedConfig)
    await refreshProjects()
  }

  return (
    <div className="space-y-6 p-6">
      <H2>Settings</H2>

      {/* Storage */}
      <Card>
        <H3 className="mb-4">Storage Location</H3>
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono text-brand-text-sec flex-1">
            {settings?.storageRoot || 'Default (app data)'}
          </span>
          <Button variant="glass" size="sm" onClick={handleChangeStorage} icon={<FolderOpen size={16} />}>
            Change
          </Button>
        </div>
      </Card>

      {/* Jira config */}
      {activeProject && (
        <Card>
          <H3 className="mb-4">Jira Configuration ({activeProject.name})</H3>
          <div className="space-y-4">
            <FormGroup label="Host">
              <Input value={jiraHost} onChange={(e) => setJiraHost(e.target.value)} />
            </FormGroup>
            <FormGroup label="Email">
              <Input value={jiraEmail} onChange={(e) => setJiraEmail(e.target.value)} />
            </FormGroup>
            <FormGroup label="API Token">
              <Input
                type="password"
                value={jiraToken}
                onChange={(e) => setJiraToken(e.target.value)}
              />
            </FormGroup>
            <div className="flex items-center gap-3">
              <Button size="sm" onClick={handleSaveJira} icon={<Save size={16} />}>
                Save
              </Button>
              {saved && (
                <span className="text-sm text-emerald-400">Saved successfully</span>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* SLA Settings */}
      {activeProject && (
        <Card>
          <H3 className="mb-4">SLA Settings</H3>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-brand-text-pri font-medium">Exclude Lunch Break</p>
              <p className="text-xs text-brand-text-sec mt-0.5">
                Subtract 13:00–14:00 from business hours when calculating SLA times
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={excludeLunchBreak}
              onClick={handleToggleLunch}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200
                ${excludeLunchBreak ? 'bg-brand-cyan' : 'bg-white/10'}`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200
                  ${excludeLunchBreak ? 'translate-x-5' : 'translate-x-0'}`}
              />
            </button>
          </div>
        </Card>
      )}
    </div>
  )
}
