---

description: "Task list for SLA Dashboard Filters implementation"
---

# Tasks: SLA Dashboard Filters

**Input**: Design documents from `/specs/007-sla-dashboard-filters/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: TDD approach requested in plan.md. Unit tests for shared logic must be written first.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Extend `SLAFilterState` and `SerializedFilterState` with `search` and `rejectedMode` in `src/shared/filter-types.ts`
- [X] T002 Update `DEFAULT_FILTER_STATE`, `serializeFilterState`, and `deserializeFilterState` in `src/shared/filter-types.ts`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Create `src/shared/sla-calculations.ts` and extract metric aggregation logic from `src/main/services/SlaMetricsService.ts`
- [X] T004 [P] Create unit tests for `calculateSlaMetrics` in `tests/sla-calculations.test.ts`
- [X] T005 Update `src/main/services/SlaMetricsService.ts` to use shared logic from `src/shared/sla-calculations.ts`
- [X] T006 [P] Create unit tests for extended `applyFilters` (search and rejected logic) in `tests/filter-utils.test.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Apply Existing Filters to Dashboard (Priority: P1) 🎯 MVP

**Goal**: Apply existing filters (issue types, priorities, etc.) and new search filter to the SLA Dashboard.

**Independent Test**: Apply a filter on the Issue List, navigate to Dashboard, and verify charts reflect the same filtered dataset. Enter a search term and verify instant dashboard updates.

### Tests for User Story 1

- [X] T007 [P] [US1] Add test cases for `search` logic in `tests/filter-utils.test.ts`

### Implementation for User Story 1

- [X] T008 [P] [US1] Implement `search` filter logic in `applyFilters` in `src/shared/filter-utils.ts`
- [X] T009 [US1] Refactor `SLADashboard.tsx` to fetch raw issues via `window.api.getSLACache` instead of pre-calculated metrics
- [X] T010 [US1] Implement client-side metric calculation in `SLADashboard.tsx` using `useFilter`, `applyFilters`, and `calculateSlaMetrics`
- [X] T011 [US1] Add search input field to `SLAFilters.tsx` in `src/renderer/src/design-system/molecules/SLAFilters.tsx`
- [X] T012 [US1] Ensure filter state consistency between Dashboard and Issue List in `src/renderer/src/contexts/FilterContext.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently.

---

## Phase 4: User Story 2 - Filter by Rejected Status (Priority: P2)

**Goal**: Introduce a filter to include, exclude, or show only rejected issues.

**Independent Test**: Toggle the "Rejected" filter and verify that issues with "Rejected" status are correctly included/excluded from all charts.

### Tests for User Story 2

- [X] T013 [P] [US2] Add test cases for `rejectedMode` logic in `tests/filter-utils.test.ts`

### Implementation for User Story 2

- [X] T014 [P] [US2] Implement `rejectedMode` filter logic in `applyFilters` in `src/shared/filter-utils.ts`
- [X] T015 [US2] Add "Rejected" status filter controls (Include, Exclude, Only) to `SLAFilters.tsx` in `src/renderer/src/design-system/molecules/SLAFilters.tsx`
- [X] T016 [US2] Update `SLACharts.tsx` in `src/renderer/src/design-system/organisms/SLACharts.tsx` to handle empty states gracefully (No Data)

**Checkpoint**: User Story 2 should be functional and integrated with US1.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Performance verification and documentation

- [X] T017 Verify performance SC-001: Dashboard updates < 2s for 10,000 issues
- [X] T018 [P] Update `quickstart.md` with new filter verification steps
- [X] T019 Final UI/UX review of filter bar alignment and responsiveness

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Updates shared types. BLOCKS everything else.
- **Foundational (Phase 2)**: Extracts shared calculation logic. BLOCKS US1 dashboard refactor.
- **User Stories (Phase 3+)**: Depend on Foundational completion. US1 (MVP) is prioritized.
- **Polish (Final Phase)**: Final validation after all features are implemented.

### Parallel Opportunities

- T003 (Logic Extraction) and T004 (Tests) can start in parallel.
- T007 (US1 logic tests) and T008 (US1 logic implementation) can start in parallel with UI tasks if types are ready.
- US1 (Phase 3) and US2 (Phase 4) can proceed in parallel once the Foundational phase (Phase 2) is complete, as they touch different parts of the filtering logic and UI.

---

## Parallel Example: User Story 1

```bash
# Developer A: Logic & Tests
Task T007: Add test cases for search logic
Task T008: Implement search filter logic

# Developer B: Dashboard Refactor
Task T009: Refactor SLADashboard.tsx data fetching
Task T010: Implement client-side metric calculation

# Developer C: UI
Task T011: Add search input field to SLAFilters.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 & 2 (Setup & Shared Foundation).
2. Complete Phase 3 (US1 - Existing filters + Search on Dashboard).
3. **VALIDATE**: Ensure Dashboard reacts to filters and search instantly.

### Incremental Delivery

1. Foundation ready (Phase 2).
2. US1 delivered (Dashboard parity with Issues list + Search).
3. US2 delivered (Rejected filter refinement).
4. Final Polish.
