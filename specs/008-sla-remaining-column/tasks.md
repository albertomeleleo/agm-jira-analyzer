---

description: "Task list for SLA Remaining Column implementation"
---

# Tasks: SLA Remaining Column

**Input**: Design documents from `/specs/008-sla-remaining-column/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Unit tests for business hour logic are mandatory (TDD).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Update shared types and extract core logic for cross-process use.

- [X] T001 Update `SLAIssue` interface in `src/shared/sla-types.ts` to include `resolutionStart: string | null` and `reactionStart: string | null`.
- [X] T002 Update `SLAReport` interface in `src/shared/sla-types.ts` to include `excludeLunchBreak: boolean`.
- [X] T003 Create `src/shared/business-hours.ts` by extracting `getBusinessMinutesBetween`, `isBusinessDay`, and holiday logic from `src/main/sla-parser.ts`.
- [X] T004 [P] Implement unit tests for the extracted logic in `tests/business-hours.test.ts` to ensure parity with original implementation.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Update the backend engine to provide the necessary data for real-time calculations.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T005 Update `src/main/sla-parser.ts` to use the shared `src/shared/business-hours.ts` utility and remove duplicated logic.
- [X] T006 Update `parseSLAForIssue` in `src/main/sla-parser.ts` to populate `reactionStart` (from `createdDate`) and `resolutionStart` (from first work status transition).
- [X] T007 Update `generateSLAReport` in `src/main/sla-parser.ts` to include the `excludeLunchBreak` flag in the returned `SLAReport`.
- [X] T008 [P] Implement `useRemainingTime` hook in `src/renderer/src/hooks/useRemainingTime.ts` that provides a `now` ticker updating every 60 seconds.

**Checkpoint**: Foundation ready - user story implementation can now begin.

---

## Phase 3: User Story 1 - View Real-Time SLA Remaining for Open Issues (Priority: P1) 🎯 MVP

**Goal**: Populate the "SLA REMAINING" column in the Item List with real-time countdown values.

**Independent Test**: Open the Item List with open issues. Observe the "SLA REMAINING" values. Wait 1 minute and verify the values decrease (if during business hours).

### Implementation for User Story 1

- [X] T009 [US1] Implement `calculateRemainingMinutes` utility in `src/renderer/src/utils/sla-utils.ts` using the shared business hours logic and current `now` timestamp.
- [X] T010 [US1] Update `RemainingBadge` in `src/renderer/src/design-system/organisms/SLATable.tsx` to use the `useRemainingTime` hook for real-time updates.
- [X] T011 [US1] Refactor `SLATable` sorting logic in `src/renderer/src/design-system/organisms/SLATable.tsx` to use the computed real-time remaining value for the 'remaining' field.
- [X] T012 [US1] Add a visual state for breached SLAs (negative remaining time) in `src/renderer/src/design-system/organisms/SLATable.tsx` showing "Overdue" or negative duration.

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Accurate Calculation across Weekends and Holidays (Priority: P2)

**Goal**: Ensure the real-time countdown correctly respects non-working periods.

**Independent Test**: Observe an issue's remaining time at 17:59 on a Friday. Verify it remains unchanged at 18:01 and throughout the weekend.

### Implementation for User Story 2

- [X] T013 [US2] Ensure `useRemainingTime` (or the component using it) has access to the `excludeLunchBreak` setting from the active project config or the `SLAReport` metadata.
- [X] T014 [US2] Pass the `excludeLunchBreak` flag to the business hour calculation in `RemainingBadge` to ensure consistency with the backend report.

**Checkpoint**: User Story 2 is complete, providing high-precision real-time metrics.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Performance and documentation.

- [X] T015 Perform a performance audit of `SLATable` with 500+ open issues to ensure the minute ticker doesn't cause UI lag.
- [X] T016 [P] Update `specs/008-sla-remaining-column/quickstart.md` with verified manual test steps.
- [X] T017 Final review of the "SLA Remaining" column alignment and visual feedback in `src/renderer/src/design-system/organisms/SLATable.tsx`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Core types and logic extraction. BLOCKS everything.
- **Foundational (Phase 2)**: Backend updates and renderer hook. BLOCKS User Story 1.
- **User Story 1 (Phase 3)**: Core UI implementation.
- **User Story 2 (Phase 4)**: Refinement of calculation parameters (lunch break).

### Parallel Opportunities

- T004 (Tests) can run in parallel with T003 (Extraction).
- T008 (Hook implementation) can start as soon as T001 is done.
- T016 (Quickstart) can be done anytime after US1 is functional.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Setup and Foundational phases.
2. Implement US1 with hardcoded lunch break setting (or ignoring it initially) to verify the countdown mechanism.
3. **VALIDATE**: Ensure the ticker works and values decrease correctly.

### Incremental Delivery

1. Add US2 refinements to ensure 100% accuracy with project settings.
2. Polish UI and verify performance.
