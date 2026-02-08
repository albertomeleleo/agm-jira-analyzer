import { app, shell, BrowserWindow, ipcMain, dialog } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { jiraService } from './services/JiraService'
import { storageService } from './services/StorageService'
import { projectService } from './services/ProjectService'
import { slaMetricsService } from './services/SlaMetricsService'
import { generateSLAReport } from './sla-parser'
import type { JiraConfig } from '../shared/jira-types'
import type { ProjectConfig, AppSettings } from '../shared/project-types'
import type { SerializedFilterState } from '../shared/filter-types'

function createWindow(): BrowserWindow {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return mainWindow
}

// --- IPC Handlers ---
function registerIpcHandlers(): void {
  // -- Settings --
  ipcMain.handle('get-settings', () => {
    return storageService.getSettings()
  })

  ipcMain.handle('update-settings', (_event, partial: Partial<AppSettings>) => {
    return storageService.updateSettings(partial)
  })

  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory', 'createDirectory']
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return result.filePaths[0]
  })

  ipcMain.handle('set-storage-root', (_event, dirPath: string) => {
    storageService.setStorageRoot(dirPath)
    return storageService.getSettings()
  })

  // -- Projects --
  ipcMain.handle('get-projects', () => {
    return projectService.listProjects()
  })

  ipcMain.handle('get-project', (_event, name: string) => {
    return projectService.getProject(name)
  })

  ipcMain.handle('create-project', (_event, config: ProjectConfig) => {
    return projectService.createProject(config)
  })

  ipcMain.handle('update-project-config', (_event, name: string, config: ProjectConfig) => {
    projectService.updateConfig(name, config)
    return projectService.getProject(name)
  })

  ipcMain.handle('set-project-logo', async (_event, projectName: string) => {
    const result = await dialog.showOpenDialog({
      properties: ['openFile'],
      filters: [{ name: 'Images', extensions: ['png', 'jpg', 'jpeg', 'svg'] }]
    })
    if (result.canceled || result.filePaths.length === 0) return null
    return projectService.setLogo(projectName, result.filePaths[0])
  })

  ipcMain.handle('get-project-logo', (_event, projectName: string) => {
    return projectService.getLogoPath(projectName)
  })

  // -- Jira --
  ipcMain.handle('jira-test-connection', async (_event, config: JiraConfig) => {
    jiraService.setConfig(config)
    return jiraService.testConnection()
  })

  ipcMain.handle('jira-get-projects', async (_event, config: JiraConfig) => {
    jiraService.setConfig(config)
    return jiraService.getProjects()
  })

  ipcMain.handle('jira-get-versions', async (_event, config: JiraConfig, projectKey: string) => {
    jiraService.setConfig(config)
    return jiraService.getVersions(projectKey)
  })

  // Fetch issues by JQL (for SLA Dashboard)
  ipcMain.handle(
    'jira-import-issues',
    async (_event, config: JiraConfig, jql: string, projectName: string) => {
      jiraService.setConfig(config)
      const issues = await jiraService.getIssuesByJQL(jql)
      projectService.saveSLAIssues(projectName, issues)
      return issues
    }
  )

  // Fetch issues for a specific release version (for Releases page)
  ipcMain.handle(
    'jira-fetch-release',
    async (_event, config: JiraConfig, projectKey: string, projectName: string, version) => {
      jiraService.setConfig(config)
      const issues = await jiraService.getIssuesByVersion(projectKey, version.name)
      return projectService.saveRelease(projectName, version, issues)
    }
  )

  ipcMain.handle('jira-search-issues', async (_event, config: JiraConfig, jql: string) => {
    jiraService.setConfig(config)
    return jiraService.getIssuesByJQL(jql)
  })

  // -- Last JQL --
  ipcMain.handle('get-last-jql', (_event, projectName: string) => {
    return projectService.getLastJql(projectName)
  })

  ipcMain.handle('save-last-jql', (_event, projectName: string, jql: string) => {
    projectService.saveLastJql(projectName, jql)
  })

  // -- SLA Issues --
  ipcMain.handle('get-sla-issues', (_event, projectName: string) => {
    return projectService.getSLAIssues(projectName)
  })

  ipcMain.handle('get-sla-cache', (_event, projectName: string) => {
    return projectService.getSLACache(projectName)
  })

  ipcMain.handle(
    'generate-sla-report',
    (_event, projectName: string, projectKey: string, slaGroups, excludeLunchBreak: boolean) => {
      const slaData = projectService.getSLAIssues(projectName)
      if (!slaData) throw new Error('No issues imported. Import issues first.')
      const report = generateSLAReport(slaData.issues, slaGroups, projectKey, excludeLunchBreak)
      projectService.saveSLACache(projectName, report)
      return report
    }
  )

  // -- Releases --
  ipcMain.handle('get-releases', (_event, projectName: string) => {
    return projectService.getReleasesData(projectName)
  })

  ipcMain.handle('delete-release', (_event, projectName: string, versionId: string) => {
    projectService.deleteRelease(projectName, versionId)
  })

  // -- Filter Presets --
  ipcMain.handle('get-filter-presets', (_event, projectName: string) => {
    return projectService.getFilterPresets(projectName)
  })

  ipcMain.handle(
    'save-filter-preset',
    (_event, projectName: string, name: string, filters: SerializedFilterState) => {
      return projectService.saveFilterPreset(projectName, name, filters)
    }
  )

  ipcMain.handle(
    'update-filter-preset',
    (
      _event,
      projectName: string,
      presetId: string,
      updates: { name?: string; filters?: SerializedFilterState }
    ) => {
      return projectService.updateFilterPreset(projectName, presetId, updates)
    }
  )

  ipcMain.handle(
    'delete-filter-preset',
    (_event, projectName: string, presetId: string) => {
      return projectService.deleteFilterPreset(projectName, presetId)
    }
  )

  ipcMain.handle(
    'reorder-filter-presets',
    (_event, projectName: string, presetIds: string[]) => {
      return projectService.reorderFilterPresets(projectName, presetIds)
    }
  )

  // -- SLA Metrics --
  ipcMain.handle('get-sla-metrics', (_event, projectName: string) => {
    return slaMetricsService.getSlaMetrics(projectName)
  })

  // -- Storage/Files --
  ipcMain.handle('read-json-file', (_event, filePath: string) => {
    return storageService.readJsonFile(filePath)
  })

  ipcMain.handle('write-json-file', (_event, filePath: string, data: unknown) => {
    storageService.writeJsonFile(filePath, data)
  })
}

// --- App lifecycle ---
app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.agiemme.agms')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
