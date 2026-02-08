# Implementation Plan: Sync Button Always Enabled

**Branch**: `005-sync-never-disable` | **Date**: 2026-02-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/005-sync-never-disable/spec.md`

## Summary

Remove the `!lastJql` disabled condition from the Sync button in the SLA Dashboard. When Sync is clicked without a saved JQL query, open the Import Issues modal as a fallback instead of doing nothing.

## Technical Context

**Language/Version**: TypeScript 5.3 (strict, no `any`)
**Primary Dependencies**: React 18, Electron 28
**Storage**: Project JSON files via electron-store (no changes)
**Testing**: Vitest (no new tests needed — UI-only change)
**Target Platform**: Electron desktop (macOS / Windows)
**Project Type**: Single Electron app with 3-process architecture
**Performance Goals**: N/A (UI state change only)
**Constraints**: Must not break existing Sync behavior for projects with a saved JQL
**Scale/Scope**: 1 file changed, ~5 lines modified

## Constitution Check

The project constitution file is a placeholder template with no project-specific rules defined. No violations to check.

## Project Structure

### Documentation (this feature)

```text
specs/005-sync-never-disable/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── spec.md              # Feature specification
└── checklists/
    └── requirements.md  # Quality checklist
```

### Source Code (repository root)

Only one file changes:

```text
src/renderer/src/components/
└── SLADashboard.tsx     # Remove !lastJql from disabled prop; add modal fallback
```

**Structure Decision**: Single project, single file change in the renderer component layer.

## Implementation Steps

### Step 1 — Remove `!lastJql` from `disabled` prop

**File**: `src/renderer/src/components/SLADashboard.tsx:244`

Change:
```tsx
disabled={!lastJql || syncing}
```
To:
```tsx
disabled={syncing}
```

### Step 2 — Replace early return in `handleSync` with modal fallback

**File**: `src/renderer/src/components/SLADashboard.tsx:155-156`

Change:
```tsx
const handleSync = async (): Promise<void> => {
  if (!activeProject || !lastJql) return
```
To:
```tsx
const handleSync = async (): Promise<void> => {
  if (!activeProject) return
  if (!lastJql) {
    setImportModalOpen(true)
    return
  }
```

### Step 3 — Verify

- Open SLA Dashboard on a project with no saved JQL → Sync button clickable
- Click Sync → Import Issues modal opens
- Import issues → modal closes, data refreshes
- Click Sync again → sync executes normally
- On a project with existing JQL → Sync works exactly as before

## Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| User confusion: clicking Sync opens a modal instead | The modal title "Import Issues" clarifies intent; after first import, Sync works as expected |
| Regression on existing Sync flow | Step 3 verification covers the happy path |
