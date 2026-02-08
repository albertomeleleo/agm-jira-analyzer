import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode
} from 'react'
import { useProject } from './ProjectContext'
import {
  DEFAULT_FILTER_STATE,
  serializeFilters,
  deserializeFilters,
  serializeFilterState,
  deserializeFilterState
} from '../../../shared/filter-types'
import type {
  SLAFilterState,
  FilterPreset,
  FilterPresetCollection
} from '../../../shared/filter-types'

interface PageFilterValue {
  filters: SLAFilterState
  setFilters: (filters: SLAFilterState) => void
  resetFilters: () => void
  presets: FilterPreset[]
  savePreset: (name: string) => Promise<void>
  deletePreset: (presetId: string) => Promise<void>
  updatePreset: (
    presetId: string,
    updates: { name?: string; filters?: SLAFilterState }
  ) => Promise<void>
  loadPreset: (presetId: string) => void
}

interface FilterContextValue {
  pageFilters: Record<string, SLAFilterState>
  setPageFilters: (pageId: string, filters: SLAFilterState) => void
  resetPageFilters: (pageId: string) => void
  presets: FilterPreset[]
  savePreset: (name: string, pageId: string) => Promise<void>
  deletePreset: (presetId: string) => Promise<void>
  updatePreset: (
    presetId: string,
    updates: { name?: string; filters?: SLAFilterState }
  ) => Promise<void>
  loadPreset: (presetId: string, pageId: string) => void
}

const FilterContext = createContext<FilterContextValue | null>(null)

const PAGE_IDS = ['dashboard', 'issues'] as const

function getPageStorageKey(pageId: string, projectName: string): string {
  return `sla_filters_${pageId}_${projectName}`
}

export function FilterProvider({ children }: { children: ReactNode }): JSX.Element {
  const { activeProject } = useProject()
  const [pageFilters, setPageFiltersState] = useState<Record<string, SLAFilterState>>({})
  const [presets, setPresets] = useState<FilterPreset[]>([])
  const migrationDone = useRef<Set<string>>(new Set())

  // Load page-scoped filters from localStorage when project changes
  useEffect(() => {
    if (!activeProject) return
    const projectName = activeProject.name
    const loaded: Record<string, SLAFilterState> = {}

    // One-time migration: old key -> dashboard key
    if (!migrationDone.current.has(projectName)) {
      const oldKey = `sla_filters_${projectName}`
      const oldValue = localStorage.getItem(oldKey)
      if (oldValue) {
        const dashboardKey = getPageStorageKey('dashboard', projectName)
        if (!localStorage.getItem(dashboardKey)) {
          localStorage.setItem(dashboardKey, oldValue)
        }
        localStorage.removeItem(oldKey)
      }
      migrationDone.current.add(projectName)
    }

    for (const pageId of PAGE_IDS) {
      const key = getPageStorageKey(pageId, projectName)
      const saved = localStorage.getItem(key)
      loaded[pageId] = saved ? deserializeFilters(saved) : DEFAULT_FILTER_STATE
    }

    setPageFiltersState(loaded)
  }, [activeProject?.name])

  // Sync page filters to localStorage when they change
  useEffect(() => {
    if (!activeProject) return
    const projectName = activeProject.name
    for (const pageId of PAGE_IDS) {
      const filters = pageFilters[pageId]
      if (filters) {
        const key = getPageStorageKey(pageId, projectName)
        localStorage.setItem(key, serializeFilters(filters))
      }
    }
  }, [pageFilters, activeProject?.name])

  // Load presets from filesystem when project changes
  useEffect(() => {
    if (!activeProject) return
    window.api
      .getFilterPresets(activeProject.name)
      .then((collection: FilterPresetCollection) => setPresets(collection.presets))
      .catch(() => setPresets([]))
  }, [activeProject?.name])

  const setPageFilters = useCallback((pageId: string, filters: SLAFilterState) => {
    setPageFiltersState((prev) => ({ ...prev, [pageId]: filters }))
  }, [])

  const resetPageFilters = useCallback((pageId: string) => {
    setPageFiltersState((prev) => ({ ...prev, [pageId]: DEFAULT_FILTER_STATE }))
  }, [])

  const savePreset = useCallback(
    async (name: string, pageId: string) => {
      if (!activeProject) return
      const filters = pageFilters[pageId] ?? DEFAULT_FILTER_STATE
      const serialized = serializeFilterState(filters)
      const collection = await window.api.saveFilterPreset(
        activeProject.name,
        name,
        serialized
      )
      setPresets(collection.presets)
    },
    [activeProject, pageFilters]
  )

  const deletePreset = useCallback(
    async (presetId: string) => {
      if (!activeProject) return
      const collection = await window.api.deleteFilterPreset(activeProject.name, presetId)
      setPresets(collection.presets)
    },
    [activeProject]
  )

  const updatePreset = useCallback(
    async (
      presetId: string,
      updates: { name?: string; filters?: SLAFilterState }
    ) => {
      if (!activeProject) return
      const ipcUpdates: { name?: string; filters?: ReturnType<typeof serializeFilterState> } = {}
      if (updates.name !== undefined) ipcUpdates.name = updates.name
      if (updates.filters !== undefined) ipcUpdates.filters = serializeFilterState(updates.filters)
      const collection = await window.api.updateFilterPreset(
        activeProject.name,
        presetId,
        ipcUpdates
      )
      setPresets(collection.presets)
    },
    [activeProject]
  )

  const loadPreset = useCallback(
    (presetId: string, pageId: string) => {
      const preset = presets.find((p) => p.id === presetId)
      if (preset) {
        setPageFiltersState((prev) => ({
          ...prev,
          [pageId]: deserializeFilterState(preset.filters)
        }))
      }
    },
    [presets]
  )

  return (
    <FilterContext.Provider
      value={{
        pageFilters,
        setPageFilters,
        resetPageFilters,
        presets,
        savePreset,
        deletePreset,
        updatePreset,
        loadPreset
      }}
    >
      {children}
    </FilterContext.Provider>
  )
}

/** Hook for page-scoped filter state. Each page gets independent filters but shared presets. */
export function usePageFilter(pageId: string): PageFilterValue {
  const context = useContext(FilterContext)
  if (!context) throw new Error('usePageFilter must be used within FilterProvider')

  const filters = context.pageFilters[pageId] ?? DEFAULT_FILTER_STATE

  const setFilters = useCallback(
    (newFilters: SLAFilterState) => context.setPageFilters(pageId, newFilters),
    [context, pageId]
  )

  const resetFilters = useCallback(
    () => context.resetPageFilters(pageId),
    [context, pageId]
  )

  const savePreset = useCallback(
    (name: string) => context.savePreset(name, pageId),
    [context, pageId]
  )

  const loadPreset = useCallback(
    (presetId: string) => context.loadPreset(presetId, pageId),
    [context, pageId]
  )

  return {
    filters,
    setFilters,
    resetFilters,
    presets: context.presets,
    savePreset,
    deletePreset: context.deletePreset,
    updatePreset: context.updatePreset,
    loadPreset
  }
}

/** Backward-compatible hook — alias for usePageFilter('dashboard') */
export function useFilter(): PageFilterValue {
  return usePageFilter('dashboard')
}
