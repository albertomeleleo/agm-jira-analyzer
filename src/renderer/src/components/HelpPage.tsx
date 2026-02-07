import { H2, H3, Card, Text } from '@design-system'

export function HelpPage(): JSX.Element {
  return (
    <div className="space-y-6 p-6 max-w-3xl">
      <H2>Help & Documentation</H2>

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
