# Tasks: Sync Button Always Enabled

**Input**: Design documents from `/specs/005-sync-never-disable/`
**Prerequisites**: plan.md, spec.md, research.md

**Organization**: Tasks are grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: No project initialization needed — single file change in an existing component.

- [x] T001 Read and understand current `handleSync` and Sync button in `src/renderer/src/components/SLADashboard.tsx`

---

## Phase 2: User Story 1 - Sync Button Always Clickable (Priority: P1) 🎯 MVP

**Goal**: Remove the `!lastJql` condition from the Sync button's `disabled` prop so it is always enabled when no sync is running.

**Independent Test**: Open SLA Dashboard on a project with no saved JQL — Sync button must be enabled and clickable.

### Implementation for User Story 1

- [x] T002 [US1] Remove `!lastJql ||` from `disabled` prop on Sync button in `src/renderer/src/components/SLADashboard.tsx:244`

**Checkpoint**: Sync button is now always enabled when not syncing. Visually verify in the app.

---

## Phase 3: User Story 2 - Graceful Handling When No JQL Exists (Priority: P1)

**Goal**: When Sync is clicked without a saved JQL query, open the Import Issues modal instead of silently doing nothing.

**Independent Test**: Click Sync on a project with no saved JQL — Import Issues modal opens.

### Implementation for User Story 2

- [x] T003 [US2] Replace `if (!activeProject || !lastJql) return` guard in `handleSync` with fallback that calls `setImportModalOpen(true)` when `!lastJql` in `src/renderer/src/components/SLADashboard.tsx:155-157`

**Checkpoint**: Clicking Sync without a JQL opens the Import Issues modal. After importing, Sync works normally.

---

## Phase 4: Polish & Cross-Cutting Concerns

**Purpose**: Verify no regressions on the existing happy path.

- [x] T004 Manually test existing Sync flow on a project with a saved JQL query to confirm behavior is unchanged in `src/renderer/src/components/SLADashboard.tsx`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (T001)**: No dependencies — read the file first
- **Phase 2 (T002)**: Depends on T001
- **Phase 3 (T003)**: Depends on T001, can be done alongside T002 (different lines)
- **Phase 4 (T004)**: Depends on T002 and T003 being complete

### User Story Dependencies

- **User Story 1 (P1)**: Single prop change — no dependencies on other stories
- **User Story 2 (P1)**: Single logic change — can be done in parallel with US1 (different lines in same file)

### Parallel Opportunities

- T002 and T003 touch different lines in the same file — apply both changes together in one edit pass.

---

## Implementation Strategy

### MVP First (Both Stories — Single File Edit)

1. Read `SLADashboard.tsx` (T001)
2. Apply both changes in one pass (T002 + T003)
3. Manually verify (T004)
4. Done

---

## Notes

- Total tasks: 4
- Total files changed: 1 (`SLADashboard.tsx`)
- No new types, IPC channels, or components needed
- No tests added (not requested in spec)
