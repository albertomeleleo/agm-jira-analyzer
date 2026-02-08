/** Serialized form of filter state (JSON-safe, no Sets) */
export interface SerializedFilterState {
  issueTypes: string[]
  priorities: string[]
  statuses: string[]
  dateMode: 'all' | 'month' | 'range'
  month: string | null
  dateFrom: string | null
  dateTo: string | null
  search: string
  rejectedMode: 'include' | 'exclude' | 'only'
}

/** In-memory filter state with Set-based multi-select fields */
export interface SLAFilterState {
  issueTypes: Set<string>
  priorities: Set<string>
  statuses: Set<string>
  dateMode: 'all' | 'month' | 'range'
  month: string | null
  dateFrom: string | null
  dateTo: string | null
  search: string
  rejectedMode: 'include' | 'exclude' | 'only'
}

export const DEFAULT_FILTER_STATE: SLAFilterState = {
  issueTypes: new Set(),
  priorities: new Set(),
  statuses: new Set(),
  dateMode: 'all',
  month: null,
  dateFrom: null,
  dateTo: null,
  search: '',
  rejectedMode: 'include'
}

/** A saved filter preset */
export interface FilterPreset {
  id: string
  name: string
  filters: SerializedFilterState
  createdAt: string
  updatedAt: string
}

/** Collection of presets for a project */
export interface FilterPresetCollection {
  presets: FilterPreset[]
}

/** Serialize in-memory SLAFilterState to JSON-safe SerializedFilterState */
export function serializeFilterState(f: SLAFilterState): SerializedFilterState {
  return {
    issueTypes: Array.from(f.issueTypes),
    priorities: Array.from(f.priorities),
    statuses: Array.from(f.statuses),
    dateMode: f.dateMode,
    month: f.month,
    dateFrom: f.dateFrom,
    dateTo: f.dateTo,
    search: f.search,
    rejectedMode: f.rejectedMode
  }
}

/** Deserialize JSON-safe SerializedFilterState to in-memory SLAFilterState */
export function deserializeFilterState(s: SerializedFilterState): SLAFilterState {
  return {
    issueTypes: new Set(s.issueTypes),
    priorities: new Set(s.priorities),
    statuses: new Set(s.statuses),
    dateMode: s.dateMode,
    month: s.month,
    dateFrom: s.dateFrom,
    dateTo: s.dateTo,
    search: s.search ?? '',
    rejectedMode: s.rejectedMode ?? 'include'
  }
}

/** Serialize SLAFilterState to a JSON string for localStorage */
export function serializeFilters(f: SLAFilterState): string {
  return JSON.stringify(serializeFilterState(f))
}

/** Deserialize a JSON string from localStorage to SLAFilterState */
export function deserializeFilters(json: string): SLAFilterState {
  try {
    const parsed = JSON.parse(json) as SerializedFilterState
    return deserializeFilterState(parsed)
  } catch {
    return DEFAULT_FILTER_STATE
  }
}
