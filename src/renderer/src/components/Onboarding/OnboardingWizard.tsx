import { useState } from 'react'
import { ArrowRight, ArrowLeft, Rocket } from 'lucide-react'
import { Button, H1, Text } from '@design-system'
import { StorageStep } from './StorageStep'
import { JiraStep } from './JiraStep'
import { ProjectStep } from './ProjectStep'
import { useProject } from '../../contexts/ProjectContext'
import type { JiraConfig } from '../../../../shared/jira-types'
import type { ProjectConfig } from '../../../../shared/project-types'
import { DEFAULT_SLA_GROUPS } from '../../../../shared/project-types'

interface OnboardingWizardProps {
  onComplete: () => void
}

const STEPS = ['Storage', 'Jira', 'Project'] as const

export function OnboardingWizard({ onComplete }: OnboardingWizardProps): JSX.Element {
  const { refreshProjects, setActiveProject } = useProject()
  const [step, setStep] = useState(0)
  const [storagePath, setStoragePath] = useState('')
  const [jiraConfig, setJiraConfig] = useState<JiraConfig>({ host: '', email: '', apiToken: '' })
  const [jiraVerified, setJiraVerified] = useState(false)
  const [projectName, setProjectName] = useState('')
  const [jiraProjectKey, setJiraProjectKey] = useState('')
  const [creating, setCreating] = useState(false)

  const canNext = (): boolean => {
    switch (step) {
      case 0:
        return storagePath.length > 0
      case 1:
        return jiraVerified
      case 2:
        return projectName.length > 0 && jiraProjectKey.length > 0
      default:
        return false
    }
  }

  const handleFinish = async (): Promise<void> => {
    setCreating(true)
    try {
      const config: ProjectConfig = {
        name: projectName,
        jiraProjectKey,
        jira: jiraConfig,
        slaGroups: DEFAULT_SLA_GROUPS,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const project = await window.api.createProject(config)
      await refreshProjects()
      setActiveProject(project)
      onComplete()
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-brand-deep p-8">
      <div className="w-full max-w-xl space-y-8 animate-fade-in-up">
        {/* Header */}
        <div className="text-center space-y-2">
          <H1>
            <span className="text-brand-cyan">AGMS</span> Setup
          </H1>
          <Text>Configure your Release Analyzer in a few simple steps</Text>
        </div>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <div
                className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold
                  ${
                    i <= step
                      ? 'bg-brand-cyan text-brand-deep'
                      : 'bg-brand-card border border-white/10 text-brand-text-sec'
                  }`}
              >
                {i + 1}
              </div>
              <span
                className={`text-sm ${i <= step ? 'text-brand-text-pri' : 'text-brand-text-sec'}`}
              >
                {label}
              </span>
              {i < STEPS.length - 1 && (
                <div
                  className={`w-8 h-px ${i < step ? 'bg-brand-cyan' : 'bg-white/10'}`}
                />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="glass p-6">
          {step === 0 && (
            <StorageStep storagePath={storagePath} onPathSelected={setStoragePath} />
          )}
          {step === 1 && (
            <JiraStep
              config={jiraConfig}
              onConfigChange={setJiraConfig}
              onConnectionVerified={() => setJiraVerified(true)}
            />
          )}
          {step === 2 && (
            <ProjectStep
              projectName={projectName}
              jiraProjectKey={jiraProjectKey}
              onProjectNameChange={setProjectName}
              onJiraKeyChange={setJiraProjectKey}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            icon={<ArrowLeft size={16} />}
          >
            Back
          </Button>

          {step < STEPS.length - 1 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()}>
              Next
              <ArrowRight size={16} />
            </Button>
          ) : (
            <Button
              onClick={handleFinish}
              disabled={!canNext()}
              loading={creating}
              icon={<Rocket size={16} />}
            >
              Finish Setup
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
