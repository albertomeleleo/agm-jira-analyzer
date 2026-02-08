# Tasks: Dashboard Auto-Refresh

**Input**: Design documents from `/specs/006-dashboard-auto-refresh/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- **Web app**: `backend/src/`, `frontend/src/`
- **Mobile**: `api/src/`, `ios/src/` or `android/src/`
- Paths shown below assume single project - adjust based on plan.md structure

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Modify `src/shared/project-types.ts` to add `autoRefreshInterval: number;` to `AppSettings` interface.
- [x] T002 Update `src/main/services/StorageService.ts` to handle saving and loading the new `autoRefreshInterval` setting.
- [ ] T003 ~~Update `src/renderer/src/contexts/ProjectContext.tsx` to provide the `autoRefreshInterval` from `AppSettings` to the application.~~ (Cancelled: This will be handled by `RefreshContext` in T005)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 [P] Create `src/renderer/src/hooks/useInterval.ts` custom hook to safely manage `setInterval`.
- [x] T005 [P] Create `src/renderer/src/contexts/RefreshContext.tsx` context with `RefreshProvider` to manage `autoRefreshInterval` state and provide a setter.
- [x] T006 Wrap the main `App` component in `src/renderer/src/main.tsx` with the `RefreshProvider`.

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Automatic Periodic Dashboard Refresh (Priority: P1) 🎯 MVP

**Goal**: Enable automatic refresh of issues and charts at a configurable interval using the last JQL.

**Independent Test**: Open SLA Dashboard on a project with a saved JQL, wait for the configured interval to elapse, and verify that the issue list and charts update automatically.

### Implementation for User Story 1

- [x] T007 [US1] Create `src/renderer/src/hooks/useAutoRefresh.ts` hook, using `useInterval` and consuming `RefreshContext` and `ProjectContext`.
- [x] T008 [US1] Integrate `useAutoRefresh` into `src/renderer/src/components/SLADashboard.tsx` to trigger data synchronization.
- [x] T009 [US1] Implement a subtle visual indicator for the last refresh time in `src/renderer/src/components/SLADashboard.tsx`.
- [x] T010 [US1] Add logic within `useAutoRefresh` to prevent refresh if `ProjectContext.currentProject.lastJQL` is undefined.
- [x] T011 [US1] Implement non-intrusive error handling and retry logic for failed refreshes in `SLADashboard.tsx` or `useAutoRefresh.ts`.
- [x] T012 [US1] Ensure `SLADashboard.tsx` remains interactive (filterable, scrollable) during a background refresh.
- [x] T013 [US1] Implement logic to skip the next refresh cycle if the current one takes longer than the interval, within `useAutoRefresh.ts`.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Global Refresh Interval Configuration (Priority: P1)

**Goal**: Allow users to configure the auto-refresh interval (in minutes) from global application settings.

**Independent Test**: Open Settings, change the refresh interval, return to the dashboard, and verify that the new interval takes effect.

### Implementation for User Story 2

- [x] T014 [US2] Add a new input field to `src/renderer/src/components/SettingsPage.tsx` for configuring `autoRefreshInterval`.
- [x] T015 [US2] Connect `SettingsPage.tsx` to `RefreshContext` to read and update the `autoRefreshInterval`.
- [x] T016 [US2] Implement logic to immediately reset the refresh timer in `useAutoRefresh.ts` when the `autoRefreshInterval` from `RefreshContext` changes.

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - JQL Stability (Priority: P2)

**Goal**: Ensure the auto-refresh always uses the last explicitly set JQL, and does not change it automatically.

**Independent Test**: Set a JQL, trigger multiple auto-refreshes, and verify that each refresh uses the same JQL. Then change the JQL via the modal and verify the new one is used going forward.

### Implementation for User Story 3

- [x] T017 [US3] Verify that `useAutoRefresh.ts` exclusively uses `ProjectContext.currentProject.lastJQL` and does not attempt to modify it. (This is a verification task during implementation).

**Checkpoint**: All user stories should now be independently functional

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T018 [P] Write unit tests for `src/renderer/src/hooks/useInterval.ts`.
- [x] T019 [P] Write unit tests for `src/renderer/src/contexts/RefreshContext.tsx`.
- [x] T020 [P] Write unit tests for `src/renderer/src/hooks/useAutoRefresh.ts`.
- [ ] T021 ~~Write integration tests for `src/renderer/src/components/SLADashboard.tsx` covering auto-refresh behavior.~~ (Cancelled: Test environment issues)
- [ ] T022 ~~Write integration tests for `src/renderer/src/components/SettingsPage.tsx` covering interval configuration.~~ (Cancelled: Test environment issues)
- [x] T023 Run quickstart.md validation.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Integrates with US1 by updating the interval.
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - Verification of US1's behavior.

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks (T001-T003) can be initiated in parallel if different files are handled by different developers.
- All Foundational tasks (T004-T006) can run in parallel.
- Once Foundational phase completes, User Story 1 (T007-T013) and User Story 2 (T014-T016) can be worked on by different developers in parallel, with careful coordination on `RefreshContext` usage.
- User Story 3 (T017) is a verification task and can be done during/after US1.
- All test writing tasks in the Polish phase (T018-T020) can run in parallel.

---

## Parallel Example: User Story 1

```bash
# Example of parallel tasks within User Story 1
# Assuming T007 (useAutoRefresh hook creation) is done, T008 (integration) can start.
Task: "T008 [US1] Integrate useAutoRefresh into src/renderer/src/components/SLADashboard.tsx to trigger data synchronization."
Task: "T009 [US1] Implement a subtle visual indicator for the last refresh time in src/renderer/src/components/SLADashboard.tsx."
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3 (verification task, potentially assisting A/B)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
