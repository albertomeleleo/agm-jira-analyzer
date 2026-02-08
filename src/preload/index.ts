import { contextBridge, ipcRenderer } from 'electron'
import type { JiraConfig, JiraVersion } from '../shared/jira-types'
import type { ProjectConfig, AppSettings, SLAGroup } from '../shared/project-types'
import type { SerializedFilterState, FilterPresetCollection } from '../shared/filter-types'
import type { SlaMetrics } from '../shared/sla-types'

const api = {
  // Settings
  getSettings: (): Promise<AppSettings> => ipcRenderer.invoke('get-settings'),
  updateSettings: (partial: Partial<AppSettings>): Promise<AppSettings> =>
    ipcRenderer.invoke('update-settings', partial),
  selectDirectory: (): Promise<string | null> => ipcRenderer.invoke('select-directory'),
  setStorageRoot: (dirPath: string): Promise<AppSettings> =>
    ipcRenderer.invoke('set-storage-root', dirPath),

  // Projects
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getProject: (name: string) => ipcRenderer.invoke('get-project', name),
  createProject: (config: ProjectConfig) => ipcRenderer.invoke('create-project', config),
  updateProjectConfig: (name: string, config: ProjectConfig) =>
    ipcRenderer.invoke('update-project-config', name, config),
  setProjectLogo: (projectName: string) => ipcRenderer.invoke('set-project-logo', projectName),
  getProjectLogo: (projectName: string) => ipcRenderer.invoke('get-project-logo', projectName),

  // Jira
  jiraTestConnection: (config: JiraConfig): Promise<boolean> =>
    ipcRenderer.invoke('jira-test-connection', config),
  jiraGetProjects: (config: JiraConfig) => ipcRenderer.invoke('jira-get-projects', config),
  jiraGetVersions: (config: JiraConfig, projectKey: string) =>
    ipcRenderer.invoke('jira-get-versions', config, projectKey),
  jiraSearchIssues: (config: JiraConfig, jql: string) =>
    ipcRenderer.invoke('jira-search-issues', config, jql),

  // Last JQL
  getLastJql: (projectName: string): Promise<string | null> =>
    ipcRenderer.invoke('get-last-jql', projectName),
  saveLastJql: (projectName: string, jql: string): Promise<void> =>
    ipcRenderer.invoke('save-last-jql', projectName, jql),

  // SLA — import issues by JQL
  jiraImportIssues: (config: JiraConfig, jql: string, projectName: string) =>
    ipcRenderer.invoke('jira-import-issues', config, jql, projectName),
  getSLAIssues: (projectName: string) => ipcRenderer.invoke('get-sla-issues', projectName),
  getSLACache: (projectName: string) => ipcRenderer.invoke('get-sla-cache', projectName),
  generateSLAReport: (projectName: string, projectKey: string, slaGroups: SLAGroup[], excludeLunchBreak: boolean) =>
    ipcRenderer.invoke('generate-sla-report', projectName, projectKey, slaGroups, excludeLunchBreak),

  // Releases — import by version
  jiraFetchRelease: (config: JiraConfig, projectKey: string, projectName: string, version: JiraVersion) =>
    ipcRenderer.invoke('jira-fetch-release', config, projectKey, projectName, version),
  getReleases: (projectName: string) => ipcRenderer.invoke('get-releases', projectName),
  deleteRelease: (projectName: string, versionId: string) =>
    ipcRenderer.invoke('delete-release', projectName, versionId),

  // Filter Presets
  getFilterPresets: (projectName: string): Promise<FilterPresetCollection> =>
    ipcRenderer.invoke('get-filter-presets', projectName),
  saveFilterPreset: (
    projectName: string,
    name: string,
    filters: SerializedFilterState
  ): Promise<FilterPresetCollection> =>
    ipcRenderer.invoke('save-filter-preset', projectName, name, filters),
  updateFilterPreset: (
    projectName: string,
    presetId: string,
    updates: { name?: string; filters?: SerializedFilterState }
  ): Promise<FilterPresetCollection> =>
    ipcRenderer.invoke('update-filter-preset', projectName, presetId, updates),
  deleteFilterPreset: (projectName: string, presetId: string): Promise<FilterPresetCollection> =>
    ipcRenderer.invoke('delete-filter-preset', projectName, presetId),
  reorderFilterPresets: (
    projectName: string,
    presetIds: string[]
  ): Promise<FilterPresetCollection> =>
    ipcRenderer.invoke('reorder-filter-presets', projectName, presetIds),

  // SLA Metrics
  getSlaMetrics: (projectName: string): Promise<SlaMetrics | null> =>
    ipcRenderer.invoke('get-sla-metrics', projectName),

  // Storage
  readJsonFile: (filePath: string) => ipcRenderer.invoke('read-json-file', filePath),
  writeJsonFile: (filePath: string, data: unknown) =>
    ipcRenderer.invoke('write-json-file', filePath, data)
}

export type ElectronAPI = typeof api

contextBridge.exposeInMainWorld('api', api)
