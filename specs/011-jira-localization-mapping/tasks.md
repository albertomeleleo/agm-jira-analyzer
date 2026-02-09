# Tasks: Jira Localization and Priority Mapping

**Input**: Design documents from `/specs/011-jira-localization-mapping/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Unit tests will be written following the Test-First approach per project constitution.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths assume Electron project with `src/main/`, `src/renderer/`, `src/shared/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared utilities for localization and priority sorting

- [X] T001 [P] Create localization utilities file at src/shared/localization-utils.ts
- [X] T002 [P] Create unit test file for localization at tests/localization-utils.test.ts
- [X] T003 [P] Create unit test file for priority sorting at tests/jira-utils-priority.test.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core localization and sorting logic that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Localization Mapping Logic

- [X] T004 [P] Implement STATUS_MAPPING constant in src/shared/localization-utils.ts
- [X] T005 [P] Implement PRIORITY_MAPPING constant in src/shared/localization-utils.ts
- [X] T006 Write failing tests for getLocalizedStatus() in tests/localization-utils.test.ts
- [X] T007 Implement getLocalizedStatus(status: string): string in src/shared/localization-utils.ts
- [X] T008 Write failing tests for getLocalizedPriority() in tests/localization-utils.test.ts
- [X] T009 Implement getLocalizedPriority(priority: string): string in src/shared/localization-utils.ts

### Priority Sorting Logic

- [X] T010 [P] Implement PRIORITY_WEIGHTS constant in src/shared/jira-utils.ts
- [X] T011 Write failing tests for comparePriorities() in tests/jira-utils-priority.test.ts
- [X] T012 Implement comparePriorities(a: string, b: string): number in src/shared/jira-utils.ts

**Checkpoint**: Foundation ready - localization and sorting utilities complete and tested

---

## Phase 3: User Story 1 - Localized Status and Priority Display (Priority: P1) 🎯 MVP

**Goal**: Display Jira statuses and priorities in Italian in the issue table

**Independent Test**: Open Issue List and SLA Dashboard, verify "Done" shows as "Completata", "High" as "Alta", etc.

### Implementation for User Story 1

- [ ] T013 [US1] Update SLATable to use getLocalizedStatus() for status badges in src/renderer/src/design-system/organisms/SLATable.tsx
- [ ] T014 [US1] Update SLATable to use getLocalizedPriority() for priority badges in src/renderer/src/design-system/organisms/SLATable.tsx
- [ ] T015 [US1] Update IssueListPage to display localized labels in src/renderer/src/components/IssueListPage.tsx
- [ ] T016 [US1] Update SLADashboard to display localized labels in src/renderer/src/components/SLADashboard.tsx

**Checkpoint**: Status and priority labels are displayed in Italian in all issue views

---

## Phase 4: User Story 2 - Logical Priority Sorting (Priority: P1)

**Goal**: Sort issues by logical priority order (Critical > High > Medium > Low > Lowest) regardless of localized names

**Independent Test**: Click Priority header in Issue List, verify sorting follows Critical > High > Medium > Low > Lowest hierarchy

### Implementation for User Story 2

- [ ] T017 [US2] Update SLATable handleSort logic to use comparePriorities() for priority column in src/renderer/src/design-system/organisms/SLATable.tsx
- [ ] T018 [US2] Update IssueListPage sorting logic to use comparePriorities() if applicable in src/renderer/src/components/IssueListPage.tsx
- [ ] T019 [US2] Test sorting with mixed priority issues to verify logical order

**Checkpoint**: Priority sorting uses logical hierarchy, not alphabetical order

---

## Phase 5: User Story 3 - Localized Filter Options (Priority: P2)

**Goal**: Display localized names in filter sidebar for status and priority

**Independent Test**: Open filter sidebar, verify chips show "Critico", "Alta", etc. instead of English names

### Implementation for User Story 3

- [ ] T020 [US3] Update SLAFilters to use getLocalizedPriority() for priority chips in src/renderer/src/design-system/molecules/SLAFilters.tsx
- [ ] T021 [US3] Update SLAFilters to use getLocalizedStatus() for status chips in src/renderer/src/design-system/molecules/SLAFilters.tsx
- [ ] T022 [US3] Ensure filter logic still works with raw English values in src/shared/filter-utils.ts
- [ ] T023 [US3] Verify filters correctly match issues after localization changes

**Checkpoint**: Filters display Italian labels while maintaining correct filtering logic

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T024 [P] Add edge case handling for unmapped statuses in src/shared/localization-utils.ts
- [ ] T025 [P] Add edge case handling for unmapped priorities in src/shared/localization-utils.ts
- [ ] T026 [P] Add unit tests for case-insensitive mapping in tests/localization-utils.test.ts
- [ ] T027 [P] Add unit tests for trimming whitespace in input values in tests/localization-utils.test.ts
- [ ] T028 Verify all edge cases from spec.md (unmapped values, partial matches, sorting unmapped values)
- [ ] T029 Run quickstart.md validation steps
- [ ] T030 Run full test suite and ensure all 107+ tests still pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed sequentially in priority order (US1 → US2 → US3)
  - US1 and US2 are both P1, should be completed before US3 (P2)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (but benefits from US1 for visual verification)
- **User Story 3 (P2)**: Can start after Foundational (Phase 2) - No dependencies on other stories (but requires US1 for complete testing)

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Core utilities before UI integration
- Localization before sorting (for readability during testing)
- Each story should be independently completable and testable

### Parallel Opportunities

- All Setup tasks (T001-T003) can run in parallel
- Within Foundational phase:
  - T004-T005 (mapping constants) can run in parallel
  - T006-T009 (localization tests and implementation) sequential per function
  - T010-T012 (priority sorting) can run in parallel with T004-T009
- Within User Story 1 (T013-T016): All UI updates can run in parallel if different developers work on different files
- Within User Story 2 (T017-T019): Sequential (sorting logic affects multiple components)
- Within User Story 3 (T020-T023): T020-T021 can run in parallel, T022-T023 sequential
- All Polish tasks (T024-T027) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch mapping constants together:
Task T004: "Implement STATUS_MAPPING constant in src/shared/localization-utils.ts"
Task T005: "Implement PRIORITY_MAPPING constant in src/shared/localization-utils.ts"

# While working on localization, priority sorting can proceed in parallel:
Task T010: "Implement PRIORITY_WEIGHTS constant in src/shared/jira-utils.ts"
Task T011: "Write failing tests for comparePriorities() in tests/jira-utils-priority.test.ts"
```

---

## Parallel Example: User Story 1

```bash
# Launch all UI updates together (if different developers):
Task T013: "Update SLATable status badges in src/renderer/src/design-system/organisms/SLATable.tsx"
Task T014: "Update SLATable priority badges in src/renderer/src/design-system/organisms/SLATable.tsx"
Task T015: "Update IssueListPage in src/renderer/src/components/IssueListPage.tsx"
Task T016: "Update SLADashboard in src/renderer/src/components/SLADashboard.tsx"
```

---

## Implementation Strategy

### MVP First (User Stories 1 & 2 - Both P1)

1. Complete Phase 1: Setup (T001-T003)
2. Complete Phase 2: Foundational (T004-T012) - CRITICAL
3. Complete Phase 3: User Story 1 (T013-T016)
4. Complete Phase 4: User Story 2 (T017-T019)
5. **STOP and VALIDATE**: Test both P1 stories independently
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Core utilities ready
2. Add User Story 1 → Test independently → Italian labels visible
3. Add User Story 2 → Test independently → Logical sorting works
4. Add User Story 3 → Test independently → Filters localized
5. Polish → Edge cases handled
6. Each story adds value without breaking previous stories

### Single Developer Strategy

1. Complete Setup + Foundational together (T001-T012)
2. Implement User Story 1 completely (T013-T016)
3. Validate US1 independently
4. Implement User Story 2 completely (T017-T019)
5. Validate US1 + US2 together
6. Implement User Story 3 completely (T020-T023)
7. Validate all stories together
8. Polish and finalize (T024-T030)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently testable
- Verify tests fail before implementing (TDD approach per constitution)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All localization uses case-insensitive mapping per spec
- Raw English values remain in data structures for filtering and exports
- Italian labels are display-only in UI components
