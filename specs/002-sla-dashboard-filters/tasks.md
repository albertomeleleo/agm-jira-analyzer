# Tasks: SLA Dashboard Advanced Filters + Issue List Page

**Input**: Design documents from `/specs/002-sla-dashboard-filters/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Status**: US1-US4 are fully implemented (T001-T021 complete). US5 (Issue List page) is new and requires FilterContext refactoring for page-scoped filter state.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure) — COMPLETE

**Purpose**: Create shared types and foundational infrastructure needed by all user stories

- [x] T001 Create shared filter types (SerializedFilterState, FilterPreset, FilterPresetCollection) in src/shared/filter-types.ts per data-model.md type definitions
- [x] T002 Move SLAFilterState interface and DEFAULT_FILTER_STATE from src/renderer/src/design-system/molecules/SLAFilters.tsx to src/shared/filter-types.ts, keeping the in-memory Set-based SLAFilterState alongside the new SerializedFilterState. Update the import in SLAFilters.tsx and src/renderer/src/design-system/index.ts to re-export from shared
- [x] T003 Add serialization helpers (serializeFilters, deserializeFilters) to src/shared/filter-types.ts, extracted from the existing functions in src/renderer/src/components/SLADashboard.tsx (lines 143-165). Update SLADashboard.tsx to import from shared

---

## Phase 2: Foundational (Blocking Prerequisites) — COMPLETE

**Purpose**: Backend preset CRUD service + IPC channels that MUST be complete before preset UI stories can be implemented

- [x] T004 Add preset CRUD methods to src/main/services/ProjectService.ts: getFilterPresets(projectName), saveFilterPreset(projectName, name, filters), updateFilterPreset(projectName, presetId, updates), deleteFilterPreset(projectName, presetId), reorderFilterPresets(projectName, presetIds). Store presets in `<storage-root>/<ProjectName>/filter-presets.json`. Include validation: unique names (case-insensitive), max 20 presets, name max 50 chars, non-empty name. Use crypto.randomUUID() for preset IDs
- [x] T005 Register 5 new IPC handlers in src/main/index.ts for channels: get-filter-presets, save-filter-preset, update-filter-preset, delete-filter-preset, reorder-filter-presets. Each handler delegates to the corresponding ProjectService method from T004
- [x] T006 Add 5 preset IPC channel bindings to the contextBridge in src/preload/index.ts: getFilterPresets, saveFilterPreset, updateFilterPreset, deleteFilterPreset, reorderFilterPresets. Each invokes the corresponding ipcRenderer.invoke() call per contracts/ipc-channels.md
- [x] T007 Add the ElectronAPI type extensions for the 5 new preset channels in src/preload/index.d.ts per contracts/ipc-channels.md Window API Type Extension section

**Checkpoint**: Preset backend is ready. IPC channels are registered and typed.

---

## Phase 3: User Story 1 - Filter SLA Issues by Category (Priority: P1) — COMPLETE

**Goal**: Improve filter UX with visually separated filter groups, clear reset action, and filtered count indicator

**Independent Test**: Open SLA Dashboard, apply filters from each category, verify table and charts update. Verify "Showing X of Y" indicator. Verify Reset clears all filters.

### Implementation for User Story 1

- [x] T008 [US1] Refactor SLAFilters component in src/renderer/src/design-system/molecules/SLAFilters.tsx to add visual separation between filter groups. Add section headers (e.g., "Issue Type", "Priority", "Status", "Period") with distinct visual boundaries using TailwindCSS (e.g., border-b, bg-brand-card/50 sections, or spacing dividers). Add a "Reset Filters" button (using Lucide RotateCcw icon) that calls onChange(DEFAULT_FILTER_STATE)
- [x] T009 [US1] Update filtered count indicator in src/renderer/src/components/SLADashboard.tsx to always show when filters are active. Ensure the "Showing X of Y issues" text uses the existing isFiltered useMemo logic and is prominently displayed near the filter area

**Checkpoint**: User Story 1 is complete.

---

## Phase 4: User Story 2 - Filter Persistence Across Navigation (Priority: P1) — COMPLETE

**Goal**: Lift filter state into a React Context so filters survive page navigation without flashing unfiltered data

**Independent Test**: Apply filters, navigate to Settings, return to Dashboard — filters still active. Close and reopen app — filters restored.

### Implementation for User Story 2

- [x] T010 [US2] Create FilterContext in src/renderer/src/contexts/FilterContext.tsx. Provide: filters (SLAFilterState), setFilters, resetFilters, plus preset-related state/methods (presets, savePreset, deletePreset, updatePreset, loadPreset). On mount, load filters from localStorage. On filter change, sync to localStorage. On project change, reload filters for the new project
- [x] T011 [US2] Wrap MainLayout content with FilterProvider in src/renderer/src/components/MainLayout.tsx
- [x] T012 [US2] Refactor SLADashboard in src/renderer/src/components/SLADashboard.tsx to consume FilterContext instead of local filter state
- [x] T013 [US2] Export FilterContext, FilterProvider, and useFilter from src/renderer/src/design-system/index.ts

**Checkpoint**: User Story 2 is complete.

---

## Phase 5: User Story 3 - Save Named Filter Presets (Priority: P2) — COMPLETE

**Goal**: Allow users to save, load, and delete named filter presets (Quick Filters)

**Independent Test**: Apply filters, save as "Critical Bugs", reset, click preset chip, verify filters restored. Delete preset, verify removed.

### Implementation for User Story 3

- [x] T014 [US3] Implement preset methods in FilterContext (src/renderer/src/contexts/FilterContext.tsx): real IPC calls for loadPresets, savePreset, deletePreset, loadPreset
- [x] T015 [P] [US3] Create FilterPresetBar component in src/renderer/src/design-system/molecules/FilterPresetBar.tsx with preset chips, save form, and delete confirmation
- [x] T016 [US3] Integrate FilterPresetBar into SLADashboard in src/renderer/src/components/SLADashboard.tsx
- [x] T017 [US3] Export FilterPresetBar component from src/renderer/src/design-system/index.ts

**Checkpoint**: User Story 3 is complete.

---

## Phase 6: User Story 4 - Rename and Manage Filter Presets (Priority: P3) — COMPLETE

**Goal**: Allow users to rename presets and update preset filters with current configuration

**Independent Test**: Create a preset, rename it, verify new name displays. Update preset with new filters, reload and verify updated configuration.

### Implementation for User Story 4

- [x] T018 [US4] Add updatePreset(presetId, updates) method to FilterContext in src/renderer/src/contexts/FilterContext.tsx
- [x] T019 [US4] Add preset management actions to FilterPresetBar in src/renderer/src/design-system/molecules/FilterPresetBar.tsx with kebab menu (rename, update with current filters, delete)

**Checkpoint**: User Story 4 is complete.

---

## Phase 7: User Story 5 - Dedicated Issue List Page (Priority: P1)

**Goal**: Add a new sidebar menu entry "Issue List" that shows only the SLA issue table with filters and SLA calculations. Refactor FilterContext to support independent per-page filter states while sharing presets.

**Independent Test**: Click "Issue List" in sidebar, verify issue table displays with filters. Apply filters on Issue List, navigate to Dashboard, verify Dashboard has its own independent filters. Load a preset saved from Dashboard on Issue List, verify it works. Navigate to Issue List with no SLA data, verify empty state message.

**Dependencies**: Requires all prior phases to be complete (US1-US4 implemented, FilterContext and FilterPresetBar exist).

### Implementation for User Story 5

- [x] T023 [US5] Extract the `applyFilters` function from src/renderer/src/components/SLADashboard.tsx into a new file src/shared/filter-utils.ts. The function takes `(issues: SLAIssue[], filters: SLAFilterState)` and returns `SLAIssue[]`. It uses `parseISO` and `format` from date-fns. Update SLADashboard.tsx to import `applyFilters` from the new shared location instead of using the local function

- [x] T024 [US5] Refactor FilterContext in src/renderer/src/contexts/FilterContext.tsx to support page-scoped filter state. Changes:
  1. Replace the single `filters` state (`useState<SLAFilterState>`) with a page-keyed state: `useState<Record<string, SLAFilterState>>({})`
  2. Add a new exported hook `usePageFilter(pageId: string)` that returns `{ filters, setFilters, resetFilters, presets, savePreset, deletePreset, updatePreset, loadPreset }` scoped to that page's filter state
  3. On project change, load each page's filters from page-scoped localStorage keys: `sla_filters_dashboard_${projectName}` and `sla_filters_issues_${projectName}`
  4. Add one-time migration: if old key `sla_filters_${projectName}` exists, copy to `sla_filters_dashboard_${projectName}` and remove old key
  5. On filter change for any page, sync that page's state to its page-scoped localStorage key
  6. Keep `useFilter()` as an alias for `usePageFilter('dashboard')` for backward compatibility (so existing SLADashboard code continues to work without changes)
  7. Presets remain shared (single `presets` array, single `savePreset`/`deletePreset`/`updatePreset`/`loadPreset` — but `loadPreset` must accept a `pageId` parameter to know which page's filters to update)

- [x] T025 [US5] Update SLADashboard in src/renderer/src/components/SLADashboard.tsx to use `usePageFilter('dashboard')` instead of `useFilter()`. This ensures the Dashboard uses page-scoped filter state. Also update to use `loadPreset` with the pageId if the signature changed in T024

- [x] T026 [US5] Add 'issues' to the NavPage union type and add the Issue List nav entry in src/renderer/src/design-system/organisms/Sidebar.tsx. Import `Table` from lucide-react. Add `{ id: 'issues', label: 'Issue List', icon: Table }` to the `navItems` array at index 1 (right after 'dashboard'). Update the `NavPage` type to: `'dashboard' | 'issues' | 'releases' | 'settings' | 'help'`

- [x] T027 [US5] Create the IssueListPage component in src/renderer/src/components/IssueListPage.tsx. The page:
  1. Uses `useProject()` to get activeProject
  2. Uses `usePageFilter('issues')` to get page-scoped filters, setFilters, resetFilters, presets, savePreset, deletePreset, updatePreset, loadPreset
  3. Loads SLA report from cache via `window.api.getSLACache(activeProject.name)` on mount/project change
  4. Applies filters using the shared `applyFilters` from src/shared/filter-utils.ts
  5. Renders: Header ("Issue List - {jiraProjectKey}"), FilterPresetBar, SLAFilters, filtered count indicator, SLATable
  6. Does NOT render: stat cards, charts, Import Issues button, Generate Report button
  7. Shows "No Project Selected" empty state if no activeProject
  8. Shows empty state with Table icon and message "No SLA data available. Generate a report from the SLA Dashboard." if no report exists (no action buttons — per FR-019)

- [x] T028 [US5] Add the 'issues' route to MainLayout in src/renderer/src/components/MainLayout.tsx. Import IssueListPage and add `case 'issues': return <IssueListPage />` to the renderPage switch statement

- [x] T029 [US5] Export `usePageFilter` from src/renderer/src/design-system/index.ts alongside the existing `useFilter` export. Also export `applyFilters` from the new shared filter-utils if needed by other components

**Checkpoint**: User Story 5 is complete. Issue List page is accessible from sidebar, shows only table with filters, shares presets with Dashboard, maintains independent filter state.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and cleanup across all user stories including US5

- [x] T020 Run typecheck across all configs: `npm run typecheck` to verify no type errors introduced in shared types, preload declarations, or context usage
- [x] T021 Verify edge cases: empty preset name validation, 50-char limit, 20-preset limit, duplicate name rejection, corrupted localStorage fallback, missing filter-presets.json fallback
- [x] T030 Run `npm run typecheck` again after US5 changes to verify no type errors in new/modified files (FilterContext, IssueListPage, Sidebar, MainLayout, filter-utils, SLADashboard)
- [x] T031 Run `npm run test` to verify existing tests still pass after refactoring
- [x] T032 Run `npm run build` to verify full production build succeeds
- [ ] T033 Run quickstart.md test scenarios 1-8 manually to validate all acceptance criteria from spec.md are met, including new scenarios 6-8 for Issue List page, independent filter persistence, and empty state

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: COMPLETE
- **Foundational (Phase 2)**: COMPLETE
- **US1 (Phase 3)**: COMPLETE
- **US2 (Phase 4)**: COMPLETE
- **US3 (Phase 5)**: COMPLETE
- **US4 (Phase 6)**: COMPLETE
- **US5 (Phase 7)**: Depends on all prior phases — FilterContext, FilterPresetBar, SLATable, SLAFilters all must exist
- **Polish (Phase 8)**: Depends on US5 being complete

### User Story Dependencies

- **US1 (P1)**: COMPLETE — filters visually grouped with reset
- **US2 (P1)**: COMPLETE — filter persistence via context + localStorage
- **US3 (P2)**: COMPLETE — named presets with save/load/delete
- **US4 (P3)**: COMPLETE — preset rename/update management
- **US5 (P1)**: New — depends on all above. Refactors FilterContext for page-scoped state, adds Issue List page and sidebar entry

### Within User Story 5

- T023 (extract applyFilters) must be done before T027 (IssueListPage needs it)
- T024 (refactor FilterContext) must be done before T025 (SLADashboard uses it) and T027 (IssueListPage uses it)
- T026 (Sidebar NavPage type) must be done before T028 (MainLayout route)
- T027 (IssueListPage) depends on T023 + T024 + T026
- T028 (MainLayout route) depends on T026 + T027
- T029 (exports) depends on T024

### Parallel Opportunities

- T023 (extract applyFilters) and T024 (refactor FilterContext) can run in parallel (different files)
- T026 (Sidebar) can run in parallel with T023 and T024 (different files)
- T025 (update SLADashboard) depends on T024
- T027 (IssueListPage) depends on T023 + T024 + T026
- T028 (MainLayout) depends on T026 + T027

---

## Parallel Example: US5 Implementation

```text
# These can run in parallel (different files):
Stream A: T023 (extract applyFilters to filter-utils.ts)
Stream B: T024 (refactor FilterContext for page-scoped state)
Stream C: T026 (add 'issues' to Sidebar NavPage)

# After Streams A + B complete:
T025 (update SLADashboard to use usePageFilter)

# After Streams A + B + C complete:
T027 (create IssueListPage)

# After T026 + T027 complete:
T028 (add 'issues' route to MainLayout)

# After T024 complete:
T029 (export usePageFilter from design-system index)
```

---

## Implementation Strategy

### Current State (US1-US4 Complete)

All filter UX, persistence, and preset management are implemented and working. The build passes, tests pass, and typechecks are clean.

### US5 Increment

1. T023 + T024 + T026 in parallel — shared utility extraction, context refactoring, sidebar update
2. T025 — update SLADashboard to use new page-scoped hook
3. T027 — create IssueListPage
4. T028 + T029 — routing and exports
5. T030-T032 — typecheck, tests, build validation
6. T033 — manual quickstart validation (scenarios 1-8)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1-US4 tasks (T001-T019) are already implemented and marked [x]
- US5 tasks (T023-T029) are the new increment
- T020-T021 were previously completed; T022 is superseded by T033
- The key refactoring challenge is T024 (FilterContext page-scoped state) — this changes the internal state model from a single SLAFilterState to a Record<string, SLAFilterState> while preserving backward compatibility via `useFilter()` alias
- No backend or IPC changes are needed for US5 — all changes are renderer-side
