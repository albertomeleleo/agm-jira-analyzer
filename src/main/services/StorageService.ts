import { app } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import Store from 'electron-store'
import type { AppSettings } from '../../shared/project-types'

const DEFAULT_SETTINGS: AppSettings = {
  storageRoot: '',
  theme: 'dark'
}

export class StorageService {
  private store: Store<AppSettings>

  constructor() {
    this.store = new Store<AppSettings>({
      name: 'agms-settings',
      defaults: DEFAULT_SETTINGS
    })
  }

  getSettings(): AppSettings {
    return {
      storageRoot: this.store.get('storageRoot', ''),
      theme: this.store.get('theme', 'dark'),
      lastOpenedProject: this.store.get('lastOpenedProject')
    }
  }

  updateSettings(partial: Partial<AppSettings>): AppSettings {
    if (partial.storageRoot !== undefined) this.store.set('storageRoot', partial.storageRoot)
    if (partial.theme !== undefined) this.store.set('theme', partial.theme)
    if (partial.lastOpenedProject !== undefined)
      this.store.set('lastOpenedProject', partial.lastOpenedProject)
    return this.getSettings()
  }

  getStorageRoot(): string {
    const root = this.store.get('storageRoot', '')
    if (!root) {
      return path.join(app.getPath('userData'), 'projects')
    }
    return root
  }

  setStorageRoot(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
    this.store.set('storageRoot', dirPath)
  }

  ensureDir(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  }

  readJsonFile<T>(filePath: string): T | null {
    try {
      if (!fs.existsSync(filePath)) return null
      const content = fs.readFileSync(filePath, 'utf-8')
      return JSON.parse(content) as T
    } catch {
      return null
    }
  }

  writeJsonFile<T>(filePath: string, data: T): void {
    const dir = path.dirname(filePath)
    this.ensureDir(dir)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  }

  fileExists(filePath: string): boolean {
    return fs.existsSync(filePath)
  }

  readFile(filePath: string): string | null {
    try {
      return fs.readFileSync(filePath, 'utf-8')
    } catch {
      return null
    }
  }

  writeFile(filePath: string, content: string): void {
    const dir = path.dirname(filePath)
    this.ensureDir(dir)
    fs.writeFileSync(filePath, content, 'utf-8')
  }

  listDirectories(dirPath: string): string[] {
    if (!fs.existsSync(dirPath)) return []
    return fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
  }

  copyFile(src: string, dest: string): void {
    const dir = path.dirname(dest)
    this.ensureDir(dir)
    fs.copyFileSync(src, dest)
  }

  deleteFile(filePath: string): void {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  }
}

export const storageService = new StorageService()
