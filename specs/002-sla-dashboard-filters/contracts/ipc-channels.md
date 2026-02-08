# IPC Channel Contracts: Filter Presets

**Feature**: 002-sla-dashboard-filters
**Date**: 2026-02-07 (updated 2026-02-08)

## IPC Channels (5 — already implemented, no changes for US5)

The 5 preset IPC channels are already implemented and do not need modification for the Issue List page (US5). The Issue List page is a renderer-only change; it consumes the same preset data via FilterContext which already calls these channels.

### `get-filter-presets`

**Direction**: Renderer → Main → Renderer
**Purpose**: Retrieve all saved filter presets for a project.

| Parameter | Type | Description |
|-----------|------|-------------|
| projectName | `string` | Name of the active project |

**Returns**: `FilterPresetCollection` (the full collection, or `{ presets: [] }` if no file exists)

**Error handling**: Returns `{ presets: [] }` if file doesn't exist or is corrupted.

---

### `save-filter-preset`

**Direction**: Renderer → Main → Renderer
**Purpose**: Save a new filter preset for a project.

| Parameter | Type | Description |
|-----------|------|-------------|
| projectName | `string` | Name of the active project |
| name | `string` | User-defined preset name (trimmed, max 50 chars) |
| filters | `SerializedFilterState` | The filter state to save |

**Returns**: `FilterPresetCollection` (updated full collection after save)

**Validation (Main Process)**:
- Name must be non-empty after trimming
- Name must not exceed 50 characters
- Name must be unique within project (case-insensitive)
- Collection must not exceed 20 presets

**Errors**: Throws with descriptive message if validation fails.

---

### `update-filter-preset`

**Direction**: Renderer → Main → Renderer
**Purpose**: Update an existing preset's name and/or filters.

| Parameter | Type | Description |
|-----------|------|-------------|
| projectName | `string` | Name of the active project |
| presetId | `string` | UUID of the preset to update |
| updates | `{ name?: string, filters?: SerializedFilterState }` | Fields to update |

**Returns**: `FilterPresetCollection` (updated full collection after update)

**Validation (Main Process)**:
- Preset with given ID must exist
- If name is provided: must be non-empty, max 50 chars, unique (excluding self)
- `updatedAt` is automatically set to current ISO timestamp

**Errors**: Throws if preset not found or validation fails.

---

### `delete-filter-preset`

**Direction**: Renderer → Main → Renderer
**Purpose**: Delete a saved filter preset.

| Parameter | Type | Description |
|-----------|------|-------------|
| projectName | `string` | Name of the active project |
| presetId | `string` | UUID of the preset to delete |

**Returns**: `FilterPresetCollection` (updated full collection after deletion)

**Errors**: Throws if preset not found.

---

### `reorder-filter-presets`

**Direction**: Renderer → Main → Renderer
**Purpose**: Reorder presets (for future drag-and-drop support).

| Parameter | Type | Description |
|-----------|------|-------------|
| projectName | `string` | Name of the active project |
| presetIds | `string[]` | Ordered array of all preset UUIDs in desired order |

**Returns**: `FilterPresetCollection` (reordered collection)

**Errors**: Throws if any ID is not found or array length doesn't match.

---

## Preload Bridge Additions (`src/preload/index.ts`) — Already Implemented

```typescript
getFilterPresets: (projectName: string) => ipcRenderer.invoke('get-filter-presets', projectName),
saveFilterPreset: (projectName: string, name: string, filters: SerializedFilterState) =>
  ipcRenderer.invoke('save-filter-preset', projectName, name, filters),
updateFilterPreset: (projectName: string, presetId: string, updates: { name?: string; filters?: SerializedFilterState }) =>
  ipcRenderer.invoke('update-filter-preset', projectName, presetId, updates),
deleteFilterPreset: (projectName: string, presetId: string) =>
  ipcRenderer.invoke('delete-filter-preset', projectName, presetId),
reorderFilterPresets: (projectName: string, presetIds: string[]) =>
  ipcRenderer.invoke('reorder-filter-presets', projectName, presetIds),
```

## US5 Note: No New IPC Channels

The Issue List page (US5) does not require new IPC channels. It uses:
- `get-sla-cache` — to load the cached SLA report (same as Dashboard)
- `get-sla-issues` — to get issue count (same as Dashboard)
- `get-filter-presets` — shared presets (already exists)

All data loading is handled via the existing channels.
