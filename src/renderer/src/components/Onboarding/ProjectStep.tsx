import { Input, H3, Text, FormGroup } from '@design-system'

interface ProjectStepProps {
  projectName: string
  jiraProjectKey: string
  onProjectNameChange: (name: string) => void
  onJiraKeyChange: (key: string) => void
}

export function ProjectStep({
  projectName,
  jiraProjectKey,
  onProjectNameChange,
  onJiraKeyChange
}: ProjectStepProps): JSX.Element {
  return (
    <div className="space-y-6">
      <div>
        <H3>Create First Project</H3>
        <Text className="mt-1">
          Set up your first project to start analyzing releases and tracking SLA compliance.
        </Text>
      </div>

      <div className="space-y-4">
        <FormGroup label="Project Name" description="A display name for this project">
          <Input
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            placeholder="My Project"
          />
        </FormGroup>

        <FormGroup label="Jira Project Key" description="The key used in Jira (e.g. PROJ, DEV)">
          <Input
            value={jiraProjectKey}
            onChange={(e) => onJiraKeyChange(e.target.value.toUpperCase())}
            placeholder="PROJ"
          />
        </FormGroup>
      </div>
    </div>
  )
}
