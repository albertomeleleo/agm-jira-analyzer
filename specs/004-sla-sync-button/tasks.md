# Tasks: SLA One-Click Sync

**Input**: Design documents from `/specs/004-sla-sync-button/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story. US2 (Last JQL Persistence) is implemented before US1 (One-Click Sync) because the sync button depends on stored JQL being available.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Foundational (Backend + IPC Infrastructure)

**Purpose**: Add the backend methods and IPC channels for JQL persistence that both user stories depend on.

- [x] T001 Add `getLastJql(projectName)` and `saveLastJql(projectName, jql)` methods to src/main/services/ProjectService.ts. `getLastJql` reads `sla-issues.json` and returns the `lastJql` field (or `null` if the file doesn't exist or the field is missing). `saveLastJql` reads the existing `sla-issues.json`, updates only the `lastJql` field, and writes back; if the file doesn't exist, it is a no-op. Also update `saveSLAIssues` to accept an optional `lastJql?: string` parameter and include it in the written JSON when provided
- [x] T002 Register 2 new IPC handlers in src/main/index.ts: `get-last-jql` delegates to `projectService.getLastJql(projectName)`, `save-last-jql` delegates to `projectService.saveLastJql(projectName, jql)` per contracts/ipc-channels.md
- [x] T003 Add 2 new IPC channel bindings to the contextBridge in src/preload/index.ts: `getLastJql(projectName): Promise<string | null>` invoking `get-last-jql`, and `saveLastJql(projectName, jql): Promise<void>` invoking `save-last-jql` per contracts/ipc-channels.md

**Checkpoint**: Backend JQL persistence infrastructure is ready. IPC channels are registered and typed.

---

## Phase 2: User Story 2 - Last JQL Persistence (Priority: P1)

**Goal**: Persist the last successfully used JQL query per project. Update the Import modal to save JQL on success and pre-fill with stored JQL on open.

**Independent Test**: Import issues using a custom JQL. Close and reopen the app. Open the Import modal — the JQL should be pre-filled with the last used query. Verify quickstart scenarios 2, 4, 5, 7, 8.

### Implementation for User Story 2

- [x] T004 [US2] Update IssueImportModal in src/renderer/src/design-system/organisms/IssueImportModal.tsx to save the JQL after a successful import by calling `window.api.saveLastJql(activeProject.name, jql)` inside the `handleImport` function, after the import succeeds and before calling `onImportComplete`. The save must only happen on successful imports (not on failures or cancellations)
- [x] T005 [US2] Update IssueImportModal in src/renderer/src/design-system/organisms/IssueImportModal.tsx to pre-fill the JQL textarea with the stored last JQL on open. Replace the existing `useEffect` that generates a default JQL from the project key: instead, on modal open (when `open` becomes `true` and `activeProject` is set), call `window.api.getLastJql(activeProject.name)` and if a result is returned, use it as the initial JQL value; if `null`, fall back to the current default template `project = "${activeProject.config.jiraProjectKey}" ORDER BY created DESC`
- [x] T006 [US2] Update IssueImportModal props interface in src/renderer/src/design-system/organisms/IssueImportModal.tsx to accept an optional `onJqlSaved?: (jql: string) => void` callback. Call it after successfully saving the JQL (inside `handleImport`, after the `saveLastJql` call). This allows SLADashboard to update its local `lastJql` state when the modal completes an import

**Checkpoint**: User Story 2 is complete. JQL is persisted on successful import, pre-filled on modal open, and survives app restarts.

---

## Phase 3: User Story 1 - One-Click SLA Sync (Priority: P1)

**Goal**: Add a Sync button to the SLA Dashboard that re-imports issues using the stored JQL and automatically generates a new SLA report in a single click.

**Independent Test**: With a previously imported project, click the Sync button. Verify issues are re-imported and report is generated without opening any modal. Verify quickstart scenarios 1, 2, 3, 6.

**Dependencies**: Requires Phase 1 (IPC channels) and Phase 2 (JQL persistence) to be complete.

### Implementation for User Story 1

- [x] T007 [US1] Add `lastJql` state and loading logic to SLADashboard in src/renderer/src/components/SLADashboard.tsx. Add a `useState<string | null>(null)` for `lastJql`. In the existing `loadData` callback (or a new `useEffect`), call `window.api.getLastJql(activeProject.name)` and set the result. This state determines whether the Sync button is enabled
- [x] T008 [US1] Add the `handleSync` function to SLADashboard in src/renderer/src/components/SLADashboard.tsx. The function: (1) sets a `syncing` loading state, (2) calls `window.api.jiraImportIssues(config, lastJql, projectName)` using the stored JQL, (3) if import succeeds, calls `window.api.generateSLAReport(projectName, projectKey, slaGroups, excludeLunchBreak)`, (4) sets the report state with the result, (5) reloads `loadData` to refresh `issueCount`. Handle errors at each step per FR-009 and FR-010: if import fails, show error and do NOT attempt report generation; if report generation fails, show error but import data is preserved. Use a `syncError` state to display error messages
- [x] T009 [US1] Add the Sync button to the SLADashboard header button group in src/renderer/src/components/SLADashboard.tsx. Place it between the existing "Import Issues" and "Generate Report" buttons. Use a `RefreshCw` icon (already imported) with label "Sync". The button is disabled when `lastJql` is null or when `syncing` is true. Show loading state (use existing `Button` component's `loading` prop) during sync operation. Also wire the `onJqlSaved` callback from IssueImportModal to update the local `lastJql` state when the user imports via the modal
- [x] T010 [US1] Add sync error display to SLADashboard in src/renderer/src/components/SLADashboard.tsx. When `syncError` is set, display it near the header area as a dismissible error message using the existing styling patterns (red text with AlertTriangle icon). The error should clear when the user clicks Sync again or dismisses it

**Checkpoint**: User Story 1 is complete. Sync button is functional, disabled when no JQL is stored, shows loading during operation, handles errors gracefully.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup

- [x] T011 Run `npm run typecheck` to verify no type errors in modified files (ProjectService, index.ts, preload, SLADashboard, IssueImportModal)
- [x] T012 Run `npm run test` to verify existing tests still pass after changes
- [x] T013 Run `npm run build` to verify full production build succeeds
- [ ] T014 Run quickstart.md test scenarios 1-8 manually to validate all acceptance criteria

---

## Dependencies & Execution Order

### Phase Dependencies

- **Foundational (Phase 1)**: No dependencies — can start immediately. BLOCKS both user stories.
- **US2 (Phase 2)**: Depends on Phase 1 (needs IPC channels). BLOCKS US1 (Sync button needs JQL saved by Import modal to exist).
- **US1 (Phase 3)**: Depends on Phase 1 (IPC channels) and Phase 2 (JQL persistence via Import modal).
- **Polish (Phase 4)**: Depends on all user stories being complete.

### Within Foundational Phase

- T001 (ProjectService methods) must be done before T002 (IPC handlers that delegate to them)
- T002 (IPC handlers) and T003 (Preload bindings) can be done in parallel after T001
- T003 depends on T002 existing (the channel names must match)

### Within User Story 2

- T004, T005, T006 all modify the same file (IssueImportModal.tsx), so they should be done sequentially
- T004 (save JQL) should be done first (core persistence)
- T005 (pre-fill) depends on T004 (needs the saved JQL to exist)
- T006 (callback prop) depends on T004 (wired in the same handler)

### Within User Story 1

- T007 (lastJql state) must be done before T008 (handleSync uses it) and T009 (button uses it)
- T008 (handleSync) must be done before T009 (button calls it)
- T010 (error display) depends on T008 (error state defined there)

### Parallel Opportunities

- T002 and T003 can run in parallel after T001 (different files: main/index.ts vs preload/index.ts)
- Within US1, T009 and T010 could theoretically be parallelized but they modify the same file

---

## Implementation Strategy

### Execution Order

1. T001 → T002 + T003 (parallel) → Phase 1 complete
2. T004 → T005 → T006 → Phase 2 complete
3. T007 → T008 → T009 → T010 → Phase 3 complete
4. T011 + T012 + T013 (parallel) → T014 → Phase 4 complete

### MVP Scope

The full feature is small enough (14 tasks, 5 files) to implement as a single increment. US2 is a prerequisite for US1, so both must be completed for the feature to deliver value.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No new files are created — all changes modify existing files
- The `saveSLAIssues` signature change in T001 is backward-compatible (optional parameter)
- The `sla-issues.json` schema extension is backward-compatible (optional `lastJql` field)
- Total files modified: 5 (ProjectService.ts, main/index.ts, preload/index.ts, SLADashboard.tsx, IssueImportModal.tsx)
