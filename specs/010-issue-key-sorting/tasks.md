---

description: "Task list for Issue Key Sorting implementation"
---

# Tasks: Issue Key Sorting

**Input**: Design documents from `/specs/010-issue-key-sorting/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/sorting-logic.md

**Tests**: Unit tests for the Jira key comparison logic are mandatory.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and core utility structure.

- [X] T001 Create `src/shared/jira-utils.ts` and implement the `compareJiraKeys(a: string, b: string): number` logic as defined in the data model.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic verification that MUST be complete before UI integration.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 [P] Create unit tests for `compareJiraKeys` in `tests/jira-utils.test.ts` covering numerical sorting (RAM-1000 > RAM-998), lexicographical prefix matching, and fallbacks.

**Checkpoint**: Foundation ready - numerical comparison is verified.

---

## Phase 3: User Story 1 - Default Descending Sort by Key (Priority: P1) 🎯 MVP

**Goal**: Ensure the Issue List is automatically sorted by Key in descending order on load.

**Independent Test**: Open the Issue List and verify that the issue with the highest sequence number is at the top.

### Implementation for User Story 1

- [X] T003 Update the default state of `sortDir` from `'asc'` to `'desc'` in `src/renderer/src/design-system/organisms/SLATable.tsx`.
- [X] T004 Integrate `compareJiraKeys` into the `useMemo` sorting block for the `'key'` case in `src/renderer/src/design-system/organisms/SLATable.tsx`.

**Checkpoint**: At this point, User Story 1 is functional. The list sorts correctly on load and uses numerical logic.

---

## Phase 4: User Story 2 - Toggle Sort Direction (Priority: P2)

**Goal**: Allow users to toggle between ascending and descending order by clicking the Key header.

**Independent Test**: Click the "Key" header and verify the list reverses its order correctly (Ascending: RAM-1, RAM-2, RAM-10; Descending: RAM-10, RAM-2, RAM-1).

### Implementation for User Story 2

- [X] T005 Verify the header click handler and visual arrow indicator in `src/renderer/src/design-system/organisms/SLATable.tsx` correctly toggle and represent the new default state.

**Checkpoint**: User Story 2 is complete. Full sorting flexibility is available to the user.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and documentation.

- [X] T006 Run `npm run typecheck` to ensure no regressions in `SLATable.tsx` or shared utilities.
- [X] T007 [P] Update `specs/010-issue-key-sorting/quickstart.md` with final verification notes.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Defines the comparison logic. BLOCKS everything.
- **Foundational (Phase 2)**: Verifies logic. BLOCKS UI integration.
- **User Story 1 (Phase 3)**: MVP feature. MUST be complete before US2.
- **Polish (Final Phase)**: Final validation.

### Parallel Opportunities

- T002 (Tests) can start in parallel with T001 (Logic) once the function signature is defined.
- Documentation (T007) can be done anytime after Phase 3 is functional.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Implement the utility and verify with tests.
2. Update the default state and comparison logic in the table.
3. **STOP and VALIDATE**: Ensure the list loads in descending numerical order.

### Incremental Delivery

1. Foundation ready.
2. US1 delivered (Numerical sorting + Descending default).
3. US2 verified (Toggle functionality).
4. Final Polish.
