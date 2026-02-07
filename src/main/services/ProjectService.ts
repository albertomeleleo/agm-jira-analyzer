import * as path from 'path'
import { storageService } from './StorageService'
import type { Project, ProjectConfig } from '../../shared/project-types'
import type { SLAReport } from '../../shared/sla-types'
import type { JiraIssue, JiraVersion } from '../../shared/jira-types'

export interface ReleaseEntry {
  version: JiraVersion
  issues: JiraIssue[]
  fetchedAt: string
}

export interface ReleasesData {
  releases: ReleaseEntry[]
}

export class ProjectService {
  private getProjectDir(projectName: string): string {
    return path.join(storageService.getStorageRoot(), projectName)
  }

  private getConfigPath(projectName: string): string {
    return path.join(this.getProjectDir(projectName), 'config.json')
  }

  private getSLAIssuesPath(projectName: string): string {
    return path.join(this.getProjectDir(projectName), 'sla-issues.json')
  }

  private getSLACachePath(projectName: string): string {
    return path.join(this.getProjectDir(projectName), 'sla-cache.json')
  }

  private getReleasesPath(projectName: string): string {
    return path.join(this.getProjectDir(projectName), 'releases.json')
  }

  // --- Projects ---

  listProjects(): Project[] {
    const root = storageService.getStorageRoot()
    const dirs = storageService.listDirectories(root)

    return dirs
      .map((name) => {
        const config = storageService.readJsonFile<ProjectConfig>(this.getConfigPath(name))
        if (!config) return null
        return {
          name,
          path: this.getProjectDir(name),
          config
        }
      })
      .filter((p): p is Project => p !== null)
  }

  getProject(name: string): Project | null {
    const config = storageService.readJsonFile<ProjectConfig>(this.getConfigPath(name))
    if (!config) return null
    return {
      name,
      path: this.getProjectDir(name),
      config
    }
  }

  createProject(config: ProjectConfig): Project {
    const dir = this.getProjectDir(config.name)
    storageService.ensureDir(dir)
    storageService.writeJsonFile(this.getConfigPath(config.name), config)
    return {
      name: config.name,
      path: dir,
      config
    }
  }

  updateConfig(projectName: string, config: ProjectConfig): void {
    storageService.writeJsonFile(this.getConfigPath(projectName), {
      ...config,
      updatedAt: new Date().toISOString()
    })
  }

  // --- SLA Issues (imported from SLA Dashboard) ---

  saveSLAIssues(projectName: string, issues: JiraIssue[]): void {
    storageService.writeJsonFile(this.getSLAIssuesPath(projectName), {
      fetchedAt: new Date().toISOString(),
      issues
    })
  }

  getSLAIssues(projectName: string): { fetchedAt: string; issues: JiraIssue[] } | null {
    return storageService.readJsonFile(this.getSLAIssuesPath(projectName))
  }

  saveSLACache(projectName: string, report: SLAReport): void {
    storageService.writeJsonFile(this.getSLACachePath(projectName), report)
  }

  getSLACache(projectName: string): SLAReport | null {
    return storageService.readJsonFile(this.getSLACachePath(projectName))
  }

  // --- Releases (imported from Releases page) ---

  getReleasesData(projectName: string): ReleasesData {
    const data = storageService.readJsonFile<ReleasesData>(this.getReleasesPath(projectName))
    return data ?? { releases: [] }
  }

  saveRelease(projectName: string, version: JiraVersion, issues: JiraIssue[]): ReleaseEntry {
    const data = this.getReleasesData(projectName)
    const entry: ReleaseEntry = {
      version,
      issues,
      fetchedAt: new Date().toISOString()
    }

    // Replace if same version already exists, otherwise append
    const idx = data.releases.findIndex((r) => r.version.id === version.id)
    if (idx >= 0) {
      data.releases[idx] = entry
    } else {
      data.releases.push(entry)
    }

    storageService.writeJsonFile(this.getReleasesPath(projectName), data)
    return entry
  }

  deleteRelease(projectName: string, versionId: string): void {
    const data = this.getReleasesData(projectName)
    data.releases = data.releases.filter((r) => r.version.id !== versionId)
    storageService.writeJsonFile(this.getReleasesPath(projectName), data)
  }

  // --- Logo ---

  setLogo(projectName: string, logoSourcePath: string): string {
    const destPath = path.join(this.getProjectDir(projectName), 'logo.png')
    storageService.copyFile(logoSourcePath, destPath)
    return destPath
  }

  getLogoPath(projectName: string): string | null {
    const logoPath = path.join(this.getProjectDir(projectName), 'logo.png')
    return storageService.fileExists(logoPath) ? logoPath : null
  }
}

export const projectService = new ProjectService()
