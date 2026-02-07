import { useState } from 'react'
import { Wifi, WifiOff, CheckCircle } from 'lucide-react'
import { Button, Input, Card, H3, Text, FormGroup } from '@design-system'
import type { JiraConfig } from '../../../../shared/jira-types'

interface JiraStepProps {
  config: JiraConfig
  onConfigChange: (config: JiraConfig) => void
  onConnectionVerified: () => void
}

export function JiraStep({
  config,
  onConfigChange,
  onConnectionVerified
}: JiraStepProps): JSX.Element {
  const [testing, setTesting] = useState(false)
  const [connectionResult, setConnectionResult] = useState<'idle' | 'success' | 'failed'>('idle')

  const handleTest = async (): Promise<void> => {
    setTesting(true)
    setConnectionResult('idle')
    try {
      const ok = await window.api.jiraTestConnection(config)
      setConnectionResult(ok ? 'success' : 'failed')
      if (ok) onConnectionVerified()
    } catch {
      setConnectionResult('failed')
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <H3>Jira Connectivity</H3>
        <Text className="mt-1">
          Connect to your Jira instance to fetch issue data and release information.
        </Text>
      </div>

      <div className="space-y-4">
        <FormGroup label="Jira Host" description="e.g. company.atlassian.net">
          <Input
            value={config.host}
            onChange={(e) => onConfigChange({ ...config, host: e.target.value })}
            placeholder="company.atlassian.net"
          />
        </FormGroup>

        <FormGroup label="Email">
          <Input
            type="email"
            value={config.email}
            onChange={(e) => onConfigChange({ ...config, email: e.target.value })}
            placeholder="user@company.com"
          />
        </FormGroup>

        <FormGroup label="API Token" description="Generate from Atlassian account settings">
          <Input
            type="password"
            value={config.apiToken}
            onChange={(e) => onConfigChange({ ...config, apiToken: e.target.value })}
            placeholder="API token"
          />
        </FormGroup>
      </div>

      <Card className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {connectionResult === 'success' && (
            <>
              <CheckCircle size={16} className="text-emerald-400" />
              <span className="text-sm text-emerald-400">Connected successfully</span>
            </>
          )}
          {connectionResult === 'failed' && (
            <>
              <WifiOff size={16} className="text-red-400" />
              <span className="text-sm text-red-400">Connection failed</span>
            </>
          )}
          {connectionResult === 'idle' && (
            <span className="text-sm text-brand-text-sec">Not tested yet</span>
          )}
        </div>
        <Button
          variant="glass"
          onClick={handleTest}
          loading={testing}
          disabled={!config.host || !config.email || !config.apiToken}
          icon={<Wifi size={16} />}
        >
          Test Connection
        </Button>
      </Card>
    </div>
  )
}
