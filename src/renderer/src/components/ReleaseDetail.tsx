import { useState, useEffect, useCallback, useMemo } from 'react'
import { Package, FileText, Download, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip
} from 'recharts'
import { H2, H3, Card, Text, Button, Badge, ReleaseFetchModal, ReleaseCharts } from '@design-system'
import { useProject } from '../contexts/ProjectContext'
import type { JiraIssue, JiraVersion } from '../../../shared/jira-types'

interface ReleaseEntry {
  version: JiraVersion
  issues: JiraIssue[]
  fetchedAt: string
}

const TYPE_COLORS: Record<string, string> = {
  Bug: '#ef4444',
  Story: '#3b82f6',
  Task: '#f59e0b',
  'Sub-task': '#8b5cf6',
  Epic: '#10b981'
}

function ReleaseCard({
  release,
  onDelete
}: {
  release: ReleaseEntry
  onDelete: () => void
}): JSX.Element {
  const [expanded, setExpanded] = useState(false)

  const typeCount: Record<string, number> = {}
  for (const issue of release.issues) {
    const t = issue.fields.issuetype.name
    typeCount[t] = (typeCount[t] ?? 0) + 1
  }
  const typeData = Object.entries(typeCount).map(([name, value]) => ({ name, value }))

  const priorityCount: Record<string, number> = {}
  for (const issue of release.issues) {
    const p = issue.fields.priority.name
    priorityCount[p] = (priorityCount[p] ?? 0) + 1
  }

  return (
    <Card className="animate-fade-in-up">
      {/* Release header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          {expanded ? (
            <ChevronDown size={18} className="text-brand-text-sec" />
          ) : (
            <ChevronRight size={18} className="text-brand-text-sec" />
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-brand-text-pri">
                {release.version.name}
              </span>
              <Badge variant={release.version.released ? 'success' : 'warning'}>
                {release.version.released ? 'Released' : 'Unreleased'}
              </Badge>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs text-brand-text-sec">
              <span>{release.issues.length} issues</span>
              {release.version.releaseDate && <span>{release.version.releaseDate}</span>}
              <span>Fetched: {new Date(release.fetchedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          className="p-1.5 rounded-lg text-brand-text-sec hover:text-red-400 hover:bg-red-500/10 transition-all"
          title="Remove release"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/5 space-y-4">
          {/* Composition row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Type pie chart */}
            <div>
              <H3 className="mb-3">Issue Type Distribution</H3>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {typeData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={TYPE_COLORS[entry.name] ?? '#6b7280'}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(22,22,31,0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Priority bars */}
            <div>
              <H3 className="mb-3">Priority Breakdown</H3>
              <div className="space-y-2">
                {Object.entries(priorityCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([priority, count]) => (
                    <div key={priority} className="flex items-center gap-3">
                      <span className="text-sm text-brand-text-sec w-20">{priority}</span>
                      <div className="flex-1 h-2 bg-brand-deep rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-cyan rounded-full transition-all"
                          style={{
                            width: `${(count / release.issues.length) * 100}%`
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium text-brand-text-pri w-8 text-right">
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Issue table */}
          <div>
            <H3 className="mb-3">Issues ({release.issues.length})</H3>
            <div className="overflow-x-auto max-h-80 overflow-y-auto rounded-lg border border-white/5">
              <table className="w-full">
                <thead className="sticky top-0 bg-brand-card">
                  <tr className="border-b border-white/10">
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-brand-text-sec">
                      Key
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-brand-text-sec">
                      Summary
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-brand-text-sec">
                      Type
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-brand-text-sec">
                      Priority
                    </th>
                    <th className="px-3 py-2 text-left text-xs font-medium uppercase text-brand-text-sec">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {release.issues.map((issue) => (
                    <tr
                      key={issue.key}
                      className="border-b border-white/5 hover:bg-brand-card/40"
                    >
                      <td className="px-3 py-2 text-sm text-brand-cyan font-medium">
                        {issue.key}
                      </td>
                      <td className="px-3 py-2 text-sm text-brand-text-pri max-w-xs truncate">
                        {issue.fields.summary}
                      </td>
                      <td className="px-3 py-2 text-sm text-brand-text-sec">
                        {issue.fields.issuetype.name}
                      </td>
                      <td className="px-3 py-2 text-sm text-brand-text-sec">
                        {issue.fields.priority.name}
                      </td>
                      <td className="px-3 py-2 text-sm text-brand-text-sec">
                        {issue.fields.status.name}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

export function ReleaseDetail(): JSX.Element {
  const { activeProject } = useProject()
  const [releases, setReleases] = useState<ReleaseEntry[]>([])
  const [fetchModalOpen, setFetchModalOpen] = useState(false)

  const loadReleases = useCallback(async () => {
    if (!activeProject) return
    const data = await window.api.getReleases(activeProject.name)
    setReleases(data.releases ?? [])
  }, [activeProject])

  useEffect(() => {
    loadReleases()
  }, [loadReleases])

  const handleDelete = async (versionId: string): Promise<void> => {
    if (!activeProject) return
    await window.api.deleteRelease(activeProject.name, versionId)
    loadReleases()
  }

  if (!activeProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <Text>Select a project to view releases</Text>
      </div>
    )
  }

  const importedVersionIds = useMemo(
    () => new Set(releases.map((r) => r.version.id)),
    [releases]
  )

  // Aggregate stats
  const totalIssues = releases.reduce((sum, r) => sum + r.issues.length, 0)

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <H2>Releases - {activeProject.config.jiraProjectKey}</H2>
          <p className="text-sm text-brand-text-sec mt-1">
            {releases.length} releases, {totalIssues} total issues
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={() => setFetchModalOpen(true)}
          icon={<Download size={16} />}
        >
          Import Releases
        </Button>
      </div>

      {releases.length > 0 ? (
        <div className="space-y-4">
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-cyan/10 text-brand-cyan">
                  <Package size={20} />
                </div>
                <div>
                  <span className="text-2xl font-bold text-brand-text-pri">
                    {releases.length}
                  </span>
                  <p className="text-xs text-brand-text-sec">Releases</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-purple/10 text-brand-purple">
                  <FileText size={20} />
                </div>
                <div>
                  <span className="text-2xl font-bold text-brand-text-pri">{totalIssues}</span>
                  <p className="text-xs text-brand-text-sec">Total Issues</p>
                </div>
              </div>
            </Card>
            <Card>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Package size={20} />
                </div>
                <div>
                  <span className="text-2xl font-bold text-brand-text-pri">
                    {releases.filter((r) => r.version.released).length}
                  </span>
                  <p className="text-xs text-brand-text-sec">Released</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Release charts */}
          <ReleaseCharts releases={releases} />

          {/* Release cards */}
          {releases.map((release) => (
            <ReleaseCard
              key={release.version.id}
              release={release}
              onDelete={() => handleDelete(release.version.id)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <Package size={48} className="text-brand-text-sec/30" />
          <Text>No releases imported. Import versions from Jira to see their composition.</Text>
          <Button
            variant="glass"
            onClick={() => setFetchModalOpen(true)}
            icon={<Download size={16} />}
          >
            Import Releases
          </Button>
        </div>
      )}

      <ReleaseFetchModal
        open={fetchModalOpen}
        onClose={() => setFetchModalOpen(false)}
        onImportComplete={() => {
          setFetchModalOpen(false)
          loadReleases()
        }}
        importedVersionIds={importedVersionIds}
      />
    </div>
  )
}
