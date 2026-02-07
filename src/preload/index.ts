import { contextBridge, ipcRenderer } from 'electron'
import type { JiraConfig, JiraVersion } from '../shared/jira-types'
import type { ProjectConfig, AppSettings, SLAGroup } from '../shared/project-types'

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

  // Storage
  readJsonFile: (filePath: string) => ipcRenderer.invoke('read-json-file', filePath),
  writeJsonFile: (filePath: string, data: unknown) =>
    ipcRenderer.invoke('write-json-file', filePath, data)
}

export type ElectronAPI = typeof api

contextBridge.exposeInMainWorld('api', api)
