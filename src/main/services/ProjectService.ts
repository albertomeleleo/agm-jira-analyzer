import * as path from 'path'
import { randomUUID } from 'crypto'
import { storageService } from './StorageService'
import type { Project, ProjectConfig } from '../../shared/project-types'
import type { SLAReport } from '../../shared/sla-types'
import type { JiraIssue, JiraVersion } from '../../shared/jira-types'
import type { FilterPresetCollection, SerializedFilterState } from '../../shared/filter-types'

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

  saveSLAIssues(projectName: string, issues: JiraIssue[], lastJql?: string): void {
    const data: { fetchedAt: string; issues: JiraIssue[]; lastJql?: string } = {
      fetchedAt: new Date().toISOString(),
      issues
    }
    if (lastJql !== undefined) {
      data.lastJql = lastJql
    }
    storageService.writeJsonFile(this.getSLAIssuesPath(projectName), data)
  }

  getSLAIssues(projectName: string): { fetchedAt: string; issues: JiraIssue[] } | null {
    return storageService.readJsonFile(this.getSLAIssuesPath(projectName))
  }

  getLastJql(projectName: string): string | null {
    const data = storageService.readJsonFile<{ lastJql?: string }>(
      this.getSLAIssuesPath(projectName)
    )
    return data?.lastJql ?? null
  }

  saveLastJql(projectName: string, jql: string): void {
    const filePath = this.getSLAIssuesPath(projectName)
    const existing = storageService.readJsonFile<{
      fetchedAt: string
      issues: JiraIssue[]
      lastJql?: string
    }>(filePath)
    if (!existing) return
    existing.lastJql = jql
    storageService.writeJsonFile(filePath, existing)
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

  // --- Filter Presets ---

  private getFilterPresetsPath(projectName: string): string {
    return path.join(this.getProjectDir(projectName), 'filter-presets.json')
  }

  getFilterPresets(projectName: string): FilterPresetCollection {
    const data = storageService.readJsonFile<FilterPresetCollection>(
      this.getFilterPresetsPath(projectName)
    )
    return data ?? { presets: [] }
  }

  saveFilterPreset(
    projectName: string,
    name: string,
    filters: SerializedFilterState
  ): FilterPresetCollection {
    const trimmedName = name.trim()
    if (!trimmedName) throw new Error('Preset name cannot be empty')
    if (trimmedName.length > 50) throw new Error('Preset name must be 50 characters or less')

    const data = this.getFilterPresets(projectName)
    if (data.presets.length >= 20) throw new Error('Maximum of 20 presets per project reached')

    const duplicate = data.presets.find(
      (p) => p.name.toLowerCase() === trimmedName.toLowerCase()
    )
    if (duplicate) throw new Error(`A preset named "${trimmedName}" already exists`)

    const now = new Date().toISOString()
    data.presets.push({
      id: randomUUID(),
      name: trimmedName,
      filters,
      createdAt: now,
      updatedAt: now
    })

    storageService.writeJsonFile(this.getFilterPresetsPath(projectName), data)
    return data
  }

  updateFilterPreset(
    projectName: string,
    presetId: string,
    updates: { name?: string; filters?: SerializedFilterState }
  ): FilterPresetCollection {
    const data = this.getFilterPresets(projectName)
    const preset = data.presets.find((p) => p.id === presetId)
    if (!preset) throw new Error(`Preset not found: ${presetId}`)

    if (updates.name !== undefined) {
      const trimmedName = updates.name.trim()
      if (!trimmedName) throw new Error('Preset name cannot be empty')
      if (trimmedName.length > 50) throw new Error('Preset name must be 50 characters or less')

      const duplicate = data.presets.find(
        (p) => p.id !== presetId && p.name.toLowerCase() === trimmedName.toLowerCase()
      )
      if (duplicate) throw new Error(`A preset named "${trimmedName}" already exists`)
      preset.name = trimmedName
    }

    if (updates.filters !== undefined) {
      preset.filters = updates.filters
    }

    preset.updatedAt = new Date().toISOString()
    storageService.writeJsonFile(this.getFilterPresetsPath(projectName), data)
    return data
  }

  deleteFilterPreset(projectName: string, presetId: string): FilterPresetCollection {
    const data = this.getFilterPresets(projectName)
    const idx = data.presets.findIndex((p) => p.id === presetId)
    if (idx === -1) throw new Error(`Preset not found: ${presetId}`)

    data.presets.splice(idx, 1)
    storageService.writeJsonFile(this.getFilterPresetsPath(projectName), data)
    return data
  }

  reorderFilterPresets(projectName: string, presetIds: string[]): FilterPresetCollection {
    const data = this.getFilterPresets(projectName)
    if (presetIds.length !== data.presets.length) {
      throw new Error('Preset IDs array length does not match existing presets count')
    }

    const reordered = presetIds.map((id) => {
      const preset = data.presets.find((p) => p.id === id)
      if (!preset) throw new Error(`Preset not found: ${id}`)
      return preset
    })

    data.presets = reordered
    storageService.writeJsonFile(this.getFilterPresetsPath(projectName), data)
    return data
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
