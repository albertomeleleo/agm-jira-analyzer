import '@testing-library/jest-dom'
import { vi } from 'vitest'

const mockProject = {
  name: 'test-project',
  path: '/test-project',
  config: {
    name: 'test-project',
    jiraProjectKey: 'TEST',
    jira: { host: '', email: '', apiToken: '' },
    slaGroups: [],
    createdAt: '',
    updatedAt: ''
  }
}

const mockApi = {
  getSettings: () =>
    Promise.resolve({
      storageRoot: '',
      theme: 'dark',
      lastOpenedProject: 'test-project',
      autoRefreshInterval: 1
    }),
  updateSettings: () => Promise.resolve(),
  getProjects: () => Promise.resolve([mockProject]),
  getProject: () => Promise.resolve(mockProject),
  getSLACache: () => Promise.resolve(null),
  getSlaMetrics: () => Promise.resolve(null),
  getSLAIssues: () => Promise.resolve({ issues: [] }),
  getLastJql: () => Promise.resolve('project = "TEST"'),
  getFilterPresets: () => Promise.resolve({ presets: [] }),
  saveFilterPreset: () => Promise.resolve({ presets: [] }),
  deleteFilterPreset: () => Promise.resolve({ presets: [] }),
  updateFilterPreset: () => Promise.resolve({ presets: [] }),
  jiraImportIssues: () => Promise.resolve(),
  generateSLAReport: () => Promise.resolve({ issues: [], summary: {} }),
  selectDirectory: () => Promise.resolve(null),
  setStorageRoot: (dir: string) => Promise.resolve({ storageRoot: dir, theme: 'dark' }),
  updateProjectConfig: () => Promise.resolve()
}

vi.stubGlobal('api', mockApi)
