import { H2, H3, Card, Text, Badge } from '@design-system'
import { RELEASE_NOTES } from '../data/release-notes'

export function HelpPage(): JSX.Element {
  const latestRelease = RELEASE_NOTES[0]

  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <H2>Help & Documentation</H2>

      {/* Release Notes Section */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <H3>Release Notes</H3>
          <Badge variant="success">v{latestRelease.version}</Badge>
        </div>

        <div className="space-y-4">
          {/* Version Info */}
          <div className="flex gap-4 text-sm text-brand-text-sec">
            <span>
              <strong className="text-brand-text-pri">Data:</strong> {latestRelease.date}
            </span>
            <span>
              <strong className="text-brand-text-pri">Tipo:</strong> {latestRelease.type}
            </span>
          </div>

          {/* Summary */}
          <p className="text-sm text-brand-text-sec leading-relaxed">{latestRelease.summary}</p>

          {/* Features */}
          {latestRelease.features.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-brand-cyan">✨ Nuove Funzionalità</h4>
              {latestRelease.features.map((feature) => (
                <div key={feature.id} className="pl-4 border-l-2 border-brand-cyan/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="info">{feature.id}</Badge>
                    <span className="text-sm font-medium text-brand-text-pri">{feature.title}</span>
                  </div>
                  <p className="text-sm text-brand-text-sec mb-1">{feature.description}</p>
                  <p className="text-xs text-brand-text-sec italic">
                    <strong>Impatto:</strong> {feature.impact}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Bugfixes */}
          {latestRelease.bugfixes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-red-400">🐛 Bugfix</h4>
              {latestRelease.bugfixes.map((bug) => (
                <div key={bug.id} className="pl-4 border-l-2 border-red-400/30">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="danger">{bug.id}</Badge>
                    <span className="text-sm font-medium text-brand-text-pri">{bug.title}</span>
                  </div>
                  <p className="text-sm text-brand-text-sec mb-1">
                    <strong>Problema:</strong> {bug.problem}
                  </p>
                  <p className="text-sm text-brand-text-sec mb-1">
                    <strong>Soluzione:</strong> {bug.solution}
                  </p>
                  <p className="text-xs text-brand-text-sec italic">
                    <strong>Impatto:</strong> {bug.impact}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Improvements */}
          {latestRelease.improvements.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-brand-purple">🔧 Miglioramenti Tecnici</h4>
              {latestRelease.improvements.map((improvement, idx) => (
                <div key={idx} className="pl-4 border-l-2 border-brand-purple/30">
                  <p className="text-sm font-medium text-brand-text-pri mb-1">
                    {improvement.title}
                  </p>
                  <p className="text-sm text-brand-text-sec">{improvement.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card>
        <H3 className="mb-3">Getting Started</H3>
        <div className="space-y-2 text-sm text-brand-text-sec">
          <p>
            1. <strong className="text-brand-text-pri">Configure Storage</strong> - Set a local
            directory to store project data.
          </p>
          <p>
            2. <strong className="text-brand-text-pri">Connect Jira</strong> - Enter your Jira host,
            email, and API token to enable data fetching.
          </p>
          <p>
            3. <strong className="text-brand-text-pri">Fetch Issues</strong> - From the SLA
            Dashboard, fetch issues by release version.
          </p>
          <p>
            4. <strong className="text-brand-text-pri">Generate Report</strong> - Click "Generate
            Report" to compute SLA metrics.
          </p>
        </div>
      </Card>

      <Card>
        <H3 className="mb-3">SLA Tiers</H3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-3 py-2 text-left text-xs uppercase text-brand-text-sec">
                  Priority
                </th>
                <th className="px-3 py-2 text-left text-xs uppercase text-brand-text-sec">Tier</th>
                <th className="px-3 py-2 text-left text-xs uppercase text-brand-text-sec">
                  Resolution
                </th>
                <th className="px-3 py-2 text-left text-xs uppercase text-brand-text-sec">
                  Reaction
                </th>
              </tr>
            </thead>
            <tbody className="text-brand-text-sec">
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Highest/Critical</td>
                <td className="px-3 py-2">Expedite</td>
                <td className="px-3 py-2">4h</td>
                <td className="px-3 py-2">15min</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">High</td>
                <td className="px-3 py-2">Critical</td>
                <td className="px-3 py-2">8h</td>
                <td className="px-3 py-2">15min</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Medium</td>
                <td className="px-3 py-2">Major</td>
                <td className="px-3 py-2">16h</td>
                <td className="px-3 py-2">15min</td>
              </tr>
              <tr className="border-b border-white/5">
                <td className="px-3 py-2">Low</td>
                <td className="px-3 py-2">Minor</td>
                <td className="px-3 py-2">32h</td>
                <td className="px-3 py-2">15min</td>
              </tr>
              <tr>
                <td className="px-3 py-2">Lowest</td>
                <td className="px-3 py-2">Trivial</td>
                <td className="px-3 py-2">40h</td>
                <td className="px-3 py-2">15min</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <H3 className="mb-3">Business Hours</H3>
        <Text>
          SLA calculations follow business hours: Monday-Friday, 09:00-18:00 (CET). Italian national
          holidays are excluded. Issues with Highest/Critical priority created after Feb 1, 2026
          follow 24x7 schedule.
        </Text>
      </Card>

      <Card>
        <H3 className="mb-3">Pause Statuses</H3>
        <Text>
          Time spent in the following statuses is deducted from resolution time: Waiting for support,
          In pausa, Sospeso, Pausa, Dipendenza Adesso.it, Dipendenza GNV.
        </Text>
      </Card>
    </div>
  )
}
