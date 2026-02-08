# IPC Channel Contracts: SLA One-Click Sync

**Feature**: 004-sla-sync-button
**Date**: 2026-02-07

## New Channels

### `get-last-jql`

Retrieves the last successfully used JQL query for a project.

**Direction**: Renderer → Main → Renderer
**Handler**: `ProjectService.getLastJql(projectName)`

| Parameter   | Type   | Description               |
|-------------|--------|---------------------------|
| projectName | string | Name of the project       |

**Returns**: `string | null`
- Returns the stored JQL string if the project has a previous successful import with `lastJql` recorded.
- Returns `null` if no `sla-issues.json` exists or the file lacks a `lastJql` field (backward compatibility).

**Preload binding**:
```typescript
getLastJql: (projectName: string): Promise<string | null> =>
  ipcRenderer.invoke('get-last-jql', projectName)
```

---

### `save-last-jql`

Saves the last used JQL query for a project. Called after a successful import.

**Direction**: Renderer → Main
**Handler**: `ProjectService.saveLastJql(projectName, jql)`

| Parameter   | Type   | Description                              |
|-------------|--------|------------------------------------------|
| projectName | string | Name of the project                      |
| jql         | string | The JQL query that was successfully used |

**Returns**: `void`

**Behavior**: Reads the existing `sla-issues.json`, updates the `lastJql` field, and writes back. If `sla-issues.json` doesn't exist, this is a no-op (the JQL will be saved on the next import via `saveSLAIssues`).

**Preload binding**:
```typescript
saveLastJql: (projectName: string, jql: string): Promise<void> =>
  ipcRenderer.invoke('save-last-jql', projectName, jql)
```

---

## Modified Channels

### `jira-import-issues` (existing — no signature change)

The channel signature remains unchanged. The JQL saving is handled separately by the Renderer calling `save-last-jql` after a successful import. This keeps the existing channel's contract stable.

## Channel Summary

| Channel        | Type | Direction              | Purpose                             |
|----------------|------|------------------------|-------------------------------------|
| get-last-jql   | NEW  | Renderer → Main → Ret  | Retrieve stored JQL for a project   |
| save-last-jql  | NEW  | Renderer → Main        | Persist JQL after successful import |

**Total new channels**: 2
**Modified channels**: 0
**Total channels after**: 25 (23 existing + 2 new)

## Window API Type Extension

The `ElectronAPI` type (derived from `typeof api` in `src/preload/index.ts`) is automatically extended when new bindings are added. No separate type declaration changes needed in `index.d.ts`.
