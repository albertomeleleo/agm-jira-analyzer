# Data Model: SLA Dashboard Advanced Filters

**Feature**: 002-sla-dashboard-filters
**Date**: 2026-02-07 (updated 2026-02-08)

## Entities

### FilterState (existing, in `src/shared/filter-types.ts`)

Represents the current active filter configuration. Used on both the SLA Dashboard and the Issue List page.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| issueTypes | `string[]` | Yes | Selected issue type values (serialized form; in-memory uses `Set<string>`) |
| priorities | `string[]` | Yes | Selected priority values (serialized form; in-memory uses `Set<string>`) |
| statuses | `string[]` | Yes | Selected status values: `'open'` and/or `'resolved'` (serialized form; in-memory uses `Set<string>`) |
| dateMode | `'all' \| 'month' \| 'range'` | Yes | Active date filtering mode |
| month | `string \| null` | No | Selected month in `yyyy-MM` format (used when dateMode is `'month'`) |
| dateFrom | `string \| null` | No | Range start date in `yyyy-MM-dd` format (used when dateMode is `'range'`) |
| dateTo | `string \| null` | No | Range end date in `yyyy-MM-dd` format (used when dateMode is `'range'`) |

**Notes**:
- In-memory representation uses `Set<string>` for issueTypes, priorities, statuses.
- Serialized (JSON/localStorage/file) representation uses `string[]` arrays.
- Empty arrays/sets mean "no filter applied" (show all values for that category).

### FilterPreset (existing, in `src/shared/filter-types.ts`)

A named, saved snapshot of a FilterState. Belongs to a project. Shared across pages.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | `string` | Yes | Unique identifier (UUID v4 via `crypto.randomUUID()`) |
| name | `string` | Yes | User-defined display name. Max 50 characters. Must be unique within the project. |
| filters | `SerializedFilterState` | Yes | Complete filter state snapshot (serialized form with arrays, not Sets) |
| createdAt | `string` | Yes | ISO 8601 timestamp of creation |
| updatedAt | `string` | Yes | ISO 8601 timestamp of last update |

**Validation rules**:
- `name`: non-empty, trimmed, max 50 characters, unique per project (case-insensitive comparison)
- `id`: auto-generated, immutable after creation
- `filters`: must be a valid SerializedFilterState object

### FilterPresetCollection (existing, in `src/shared/filter-types.ts`)

The collection of all presets for a project. Stored as a JSON file. Shared across all pages.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| presets | `FilterPreset[]` | Yes | Ordered list of presets. Max 20 items. Order reflects creation order. |

**File location**: `<storage-root>/<ProjectName>/filter-presets.json`

**Validation rules**:
- Maximum 20 presets per collection
- All preset names must be unique (case-insensitive) within the collection

### PageFilterState (new concept, in FilterContext)

Internal to the FilterContext. Represents the per-page filter state map.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| key | `string` | Yes | Page identifier: `'dashboard'` or `'issues'` |
| value | `SLAFilterState` | Yes | The active filter state for that page |

**localStorage keys**:
- Dashboard: `sla_filters_dashboard_${projectName}`
- Issue List: `sla_filters_issues_${projectName}`
- Legacy (migrated on first load): `sla_filters_${projectName}` → copies to dashboard key

## Relationships

```
Project (1) ──── (1) FilterPresetCollection (shared across pages)
                          │
                          ├── FilterPreset (0..20)
                          │       │
                          │       └── SerializedFilterState (1)
                          │
SLADashboard ──── FilterState (page-scoped, pageId='dashboard')
                          │
                          └── persisted to localStorage: sla_filters_dashboard_${projectName}

IssueListPage ──── FilterState (page-scoped, pageId='issues')
                          │
                          └── persisted to localStorage: sla_filters_issues_${projectName}
```

## Type Definitions (for `src/shared/filter-types.ts`)

```typescript
/** Serialized form of filter state (JSON-safe, no Sets) */
export interface SerializedFilterState {
  issueTypes: string[]
  priorities: string[]
  statuses: string[]
  dateMode: 'all' | 'month' | 'range'
  month: string | null
  dateFrom: string | null
  dateTo: string | null
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
```

## State Transitions

### FilterPreset Lifecycle

```
[Not Exists] ──save──> [Created]
[Created] ──rename──> [Created] (name updated, updatedAt refreshed)
[Created] ──update──> [Created] (filters overwritten, updatedAt refreshed)
[Created] ──delete──> [Not Exists]
```

### Active Filter State Flow (per page, independent)

```
[Default] ──user interaction──> [Modified]
[Modified] ──reset──> [Default]
[Modified] ──load preset──> [Preset Applied]
[Preset Applied] ──user interaction──> [Modified]
[Any State] ──navigate away──> [Preserved in Context]
[Preserved in Context] ──navigate back──> [Restored]
[Any State] ──app close──> [Persisted to page-scoped localStorage key]
[App Start] ──load──> [Restored from page-scoped localStorage key]
```

### Preset Sharing Flow (cross-page)

```
[Dashboard] ──save preset──> [PresetCollection updated]
[Issue List] ──reads preset list──> [Same presets available]
[Issue List] ──load preset──> [Issues page filters updated, Dashboard unaffected]
[Dashboard] ──delete preset──> [PresetCollection updated, Issue List sees removal]
```
