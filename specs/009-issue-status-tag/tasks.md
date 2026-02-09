---

description: "Task list for Issue Status Tags implementation"
---

# Tasks: Issue Status Tags

**Input**: Design documents from `/specs/009-issue-status-tag/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/status-mapping.md

**Tests**: Unit tests for the status mapping utility are mandatory.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic utility structure.

- [ ] T001 Define `StatusBadgeVariant` type in `src/shared/status-utils.ts` to match `Badge` component variants.
- [ ] T002 Create shell for `getStatusVariant` function in `src/shared/status-utils.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core logic that MUST be complete before ANY UI integration.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T003 Implement `getStatusVariant` logic in `src/shared/status-utils.ts` with case-insensitive keyword matching.
- [ ] T004 [P] Create unit tests for `getStatusVariant` in `tests/status-utils.test.ts` covering all defined categories (Success, Danger, Warning, Info, Default).

**Checkpoint**: Foundation ready - status mapping is verified and ready for UI use.

---

## Phase 3: User Story 1 - View Status Tags in Issue List (Priority: P1) 🎯 MVP

**Goal**: Display issue status as a visual tag in the Issue List table.

**Independent Test**: Navigate to the Issue List and verify that a new "Status" column appears after "Type" and before "Priority", showing the raw status text from Jira inside a styled Badge.

### Implementation for User Story 1

- [ ] T005 Update `SLATable` header definition in `src/renderer/src/design-system/organisms/SLATable.tsx` to include "Status" column (non-sortable).
- [ ] T006 Update `IssueRow` in `src/renderer/src/design-system/organisms/SLATable.tsx` to render a `Badge` component in the new Status column using `getStatusVariant`.
- [ ] T007 Adjust `colSpan` values in `expanded` row of `src/renderer/src/design-system/organisms/SLATable.tsx` to account for the new column.

**Checkpoint**: At this point, User Story 1 is functional. The tags are visible and use the basic mapping from the foundational utility.

---

## Phase 4: User Story 2 - Color-Coded Status Categories (Priority: P2)

**Goal**: Refine the color mapping to ensure logical groupings (Todo, In Progress, Done, Rejected) are visually distinct.

**Independent Test**: Verify that "Rejected" status is Red, "Done" is Green, "In Progress" is Orange, and "Backlog" is Blue.

### Implementation for User Story 2

- [ ] T008 [P] Extend keyword list in `src/shared/status-utils.ts` to cover additional Jira variants (e.g., `Released`, `Resolved`, `Closed` for Success; `Won't Fix`, `Cancelled` for Danger).
- [ ] T009 [P] Update unit tests in `tests/status-utils.test.ts` to include these new edge cases.

**Checkpoint**: User Story 2 is complete. Statuses are logically categorized by color.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Final UI refinements and verification.

- [ ] T010 Perform visual review of the "Status" column width and alignment in `src/renderer/src/design-system/organisms/SLATable.tsx`.
- [ ] T011 Verify table responsiveness with 10+ columns on smaller screens.
- [ ] T012 [P] Update `specs/009-issue-status-tag/quickstart.md` with final verification steps.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Defines the core contract. BLOCKS foundational implementation.
- **Foundational (Phase 2)**: Provides the mapping logic. BLOCKS User Story 1 integration.
- **User Story 1 (Phase 3)**: Core UI feature. MUST be complete before US2 refinements.
- **Polish (Final Phase)**: Depends on all user stories being functional.

### Parallel Opportunities

- T004 (Tests) can run in parallel with T003 (Logic) if the signature is agreed.
- T008 and T009 can be worked on together during US2.
- Documentation (T012) can be done anytime after US1 is functional.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Define the utility and its basic mapping.
2. Integrate into the table.
3. **STOP and VALIDATE**: Ensure the column is visible and data is correct.

### Incremental Delivery

1. Start with standard statuses (Open, In Progress, Done).
2. Add specialized statuses (Rejected, Released) in Phase 4.
3. Final polish for UI/UX.
