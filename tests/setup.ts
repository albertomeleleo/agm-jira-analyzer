import '@testing-library/jest-dom'
import { vi } from 'vitest'

const mockApi = {
  getSettings: () =>
    Promise.resolve({
      storageRoot: '',
      theme: 'dark',
      lastOpenedProject: 'test-project',
      autoRefreshInterval: 1
    }),
  updateSettings: () => Promise.resolve(),
  getProjects: () => Promise.resolve([{ name: 'test-project', path: '/test-project' }]),
  getProject: () =>
    Promise.resolve({
      name: 'test-project',
      path: '/test-project',
      config: { jira: { host: '', email: '', apiToken: '' } }
    }),
  getSLACache: () => Promise.resolve(null),
  getSLAIssues: () => Promise.resolve({ issues: [] }),
  getLastJql: () => Promise.resolve('project = "TEST"'),
  jiraImportIssues: () => Promise.resolve(),
  generateSLAReport: () => Promise.resolve({ issues: [], summary: {} }),
  selectDirectory: () => Promise.resolve(null),
  setStorageRoot: (dir: string) => Promise.resolve({ storageRoot: dir, theme: 'dark' }),
  updateProjectConfig: () => Promise.resolve()
}

vi.stubGlobal('window', {
  api: mockApi
})

