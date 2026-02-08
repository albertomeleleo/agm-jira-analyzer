# Research: SLA One-Click Sync

**Feature**: 004-sla-sync-button
**Date**: 2026-02-07

## Research Tasks

### 1. JQL Persistence Location

**Question**: Where should the last used JQL be stored to survive app restarts?

**Decision**: Store `lastJql` as a field inside the existing `sla-issues.json` file per project.

**Rationale**: The SLA issues file (`<storage-root>/<ProjectName>/sla-issues.json`) already contains `{ fetchedAt, issues }`. Adding a `lastJql` string field is the minimal change — no new files, no schema migrations, and the data is semantically co-located (the JQL describes how the issues were fetched).

**Alternatives considered**:
- **Separate `last-jql.json` file**: Unnecessary file proliferation for a single string.
- **ProjectConfig (`config.json`)**: The JQL is operational/ephemeral data, not configuration. Config changes trigger project reload in the UI, which is not desired for JQL updates.
- **electron-store (app-level settings)**: Per-project data should be in per-project files, not global settings.
- **localStorage (Renderer)**: Not accessible from Main Process; doesn't survive reinstalls.

### 2. IPC Channel Strategy

**Question**: Should the Sync operation be a single IPC channel or orchestrated in the Renderer?

**Decision**: Renderer-side orchestration with two sequential IPC calls to existing channels (`jira-import-issues` + `generate-sla-report`), plus 2 new lightweight channels for JQL persistence (`get-last-jql` + `save-last-jql`).

**Rationale**: The current architecture delegates all infrastructure to Main but keeps UI orchestration in Renderer. A combined "sync" IPC channel would duplicate logic already in separate handlers. Sequential awaits in the Renderer give precise error control (FR-009 vs FR-010) and reuse existing, tested code paths.

**Alternatives considered**:
- **Single `sync-sla` IPC channel**: Would require combining import + report generation in one handler, duplicating existing logic and making error reporting coarser.
- **Embedding lastJql in existing channels**: Would couple unrelated concerns (import execution vs. JQL persistence).

### 3. Existing `saveSLAIssues` Method Behavior

**Question**: How does the current `saveSLAIssues` handle the file write, and can we extend it safely?

**Decision**: Extend `saveSLAIssues` to accept an optional `lastJql` parameter. When provided, include it in the written JSON. Also add a `getLastJql` method that reads only the `lastJql` field from `sla-issues.json`.

**Rationale**: The existing method writes `{ fetchedAt, issues }` atomically via `writeJsonFile`. Adding `lastJql` to the same write is safe — it's a single atomic file write. For reading, a dedicated `getLastJql` avoids loading the entire (potentially large) issues array just to check if JQL exists.

**Alternatives considered**:
- **Separate read/write for lastJql in a different file**: Adds file management overhead.
- **Always reading full sla-issues.json**: The `issues` array can be large (thousands of entries). A lightweight read of just the `lastJql` field is more efficient for the UI's needs (checking button availability on page load).

### 4. Import Modal Pre-fill Behavior

**Question**: How should the Import modal interact with the stored JQL?

**Decision**: On modal open, load the last JQL from the backend via `getLastJql` IPC channel. If available, pre-fill the textarea. The current default template (`project = "KEY" ORDER BY created DESC`) remains as the fallback when no stored JQL exists.

**Rationale**: The modal currently generates a default JQL from the project key (via `useEffect`). The change replaces this with a backend lookup that either returns the stored JQL (from a previous import) or `null` (falling back to the default template). This aligns with FR-008.

**Alternatives considered**:
- **Pass lastJql via props from SLADashboard**: Would couple the modal to the Dashboard's state and wouldn't work when the modal is opened from other locations.
- **Store in React state/context**: Wouldn't persist across sessions.

### 5. Sync Button State Management

**Question**: How should the Sync button determine its enabled/disabled state?

**Decision**: The `SLADashboard` component loads the last JQL via `getLastJql` on mount and when `activeProject` changes. The Sync button is disabled when `lastJql` is null/empty. After a successful import (via Import modal or Sync), the local `lastJql` state is updated.

**Rationale**: The lastJql needs to be available synchronously for button state. Loading it once on mount and keeping it in component state is the simplest approach. It's updated in two places: (1) after Sync completes, (2) after Import modal closes with `onImportComplete`.

**Alternatives considered**:
- **Context-based JQL state**: Over-engineering for a single value used by one component and one modal.
- **Derive from sla-issues.json presence**: Doesn't tell us if a JQL was used (issues could have been imported differently in a future version).
