# Research: Sync Button Always Enabled

**Branch**: `005-sync-never-disable` | **Phase**: 0 | **Date**: 2026-02-08

## Findings

### Current disabled logic

**File**: `src/renderer/src/components/SLADashboard.tsx:244`

```tsx
disabled={!lastJql || syncing}
```

Two conditions disable the button:
1. `!lastJql` — no JQL query saved yet for the active project
2. `syncing` — sync operation in progress

**Decision**: Remove `!lastJql` from the disabled condition. Keep `syncing` to prevent duplicate clicks.

**Rationale**: The user should always be able to click Sync. When no JQL exists, the click should open the Import Issues modal as a fallback. Condition #2 (loading guard) is correct and must stay.

### `handleSync` guard

**File**: `src/renderer/src/components/SLADashboard.tsx:156`

```tsx
const handleSync = async (): Promise<void> => {
  if (!activeProject || !lastJql) return  // ← early return when no JQL
  ...
```

The early return on `!lastJql` must be replaced with fallback behavior: open the import modal.

### `importModalOpen` state

Already exists at line 118:
```tsx
const [importModalOpen, setImportModalOpen] = useState(false)
```

And `IssueImportModal` already has `onJqlSaved` callback at line 367:
```tsx
onJqlSaved={(jql) => setLastJql(jql)}
```

**Decision**: When `handleSync` is called without `lastJql`, set `importModalOpen(true)` and return. After the modal saves a JQL (via `onJqlSaved`), the user can click Sync again — or we can trigger sync automatically after import completes.

### Auto-sync after modal import

The `onImportComplete` callback on IssueImportModal (line 363) already calls `loadData()`. We can extend this to also trigger `handleSync` if the sync was initiated from the button. However, to keep it simple and avoid state complexity, we will use a simpler approach: after the user imports via the modal (regardless of how it was opened), Sync is now enabled so they can click it. This satisfies FR-003 and FR-004 from the spec.

**Alternative considered**: Track "sync-initiated-open" with a ref/state flag. **Rejected** as over-engineering for this small feature.

**Rationale**: The `onImportComplete` already calls `loadData()` which refreshes cached data. The user can immediately click Sync after the modal closes. This is consistent with existing UX patterns.

---

## Summary of Changes

| Location | Change |
|----------|--------|
| `SLADashboard.tsx:244` | `disabled={syncing}` (remove `!lastJql ||`) |
| `SLADashboard.tsx:156` | Replace `if (!activeProject \|\| !lastJql) return` with fallback: open modal when no JQL |

**Total files changed**: 1 (`SLADashboard.tsx`)
**No new IPC channels, no new components, no new types needed.**
