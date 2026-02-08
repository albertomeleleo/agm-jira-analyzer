# Tasks: SLA Dashboard Metrics

**Input**: Design documents from `/specs/001-sla-dashboard-metrics/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Define data structures and communication channels.

- [x] T001 Update `src/shared/sla-types.ts` to include the new metric data structures: `WeeklyCount`, `SlaCompliance`, `PieChartDataPoint`, and `SlaMetrics`.
- [x] T002 Create the new service file `src/main/services/SlaMetricsService.ts`.
- [x] T003 Register the new IPC handler for `get-sla-metrics` in `src/main/index.ts`, delegating to `SlaMetricsService.getSlaMetrics`.
- [x] T004 Add the new `getSlaMetrics` IPC channel binding to the contextBridge in `src/preload/index.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement the core data aggregation logic.

- [x] T005 Implement the `getSlaMetrics` method in `src/main/services/SlaMetricsService.ts`. This method will fetch Jira issues and aggregate them into the `SlaMetrics` data structure.

---

## Phase 3: Dashboard UI (User Stories 1-6)

**Goal**: Replace the current issue list with a new set of charts.

**Independent Test**: The new dashboard should display all the specified charts, and the data should be verifiable against Jira.

### Implementation for Dashboard UI

- [x] T006 [US1-6] Refactor `src/renderer/src/components/SLADashboard.tsx` to remove the `SLATable` and other issue-related UI elements.
- [x] T007 [US1-6] In `SLADashboard.tsx`, fetch the `SlaMetrics` data using the `window.api.getSlaMetrics` IPC call and pass it to the `SLACharts` component.
- [x] T008 [US1-6] Update `src/renderer/src/design-system/organisms/SLACharts.tsx` to accept the `SlaMetrics` data and render all the new charts.
- [x] T009 [P] [US1] In `SLACharts.tsx`, implement the "Open vs Closed Tasks" chart.
- [x] T010 [P] [US2] In `SLACharts.tsx`, implement the "Open vs Closed Bugs/Service Requests" chart.
- [x] T011 [P] [US3] In `SLACharts.tsx`, implement the "SLA Compliance for Response Time" chart.
- [x] T012 [P] [US4] In `SLACharts.tsx`, implement the "SLA Compliance for Resolution Time" chart.
- [x] T013 [P] [US5] In `SLACharts.tsx`, implement the "Bugs/Service Requests vs Rejected Issues" pie chart.
- [x] T014 [P] [US6] In `SLACharts.tsx`, implement the "Priority Distribution" pie chart.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T015 Write unit tests for `src/main/services/SlaMetricsService.ts`.
- [x] T016 Write component tests for `src/renderer/src/design-system/organisms/SLACharts.tsx`.
- [ ] T017 Run `quickstart.md` validation.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion.
- **Dashboard UI (Phase 3)**: Depends on Foundational completion.
- **Polish (Phase N)**: Depends on all other phases being complete.

### User Story Dependencies

- All user stories are part of the same UI update and can be developed in parallel once the foundational work is done.

### Parallel Opportunities

- Tasks within Phase 1 (T001-T004) can be worked on in parallel.
- Chart implementation tasks within Phase 3 (T009-T014) can be worked on in parallel.
- Testing tasks in the Polish phase (T015-T016) can be done in parallel with development, following a TDD approach if desired.

---

## Implementation Strategy

### MVP First (All Charts)

1.  Complete Phase 1: Setup
2.  Complete Phase 2: Foundational
3.  Complete Phase 3: Dashboard UI
4.  **STOP and VALIDATE**: Test the new dashboard and all its charts.
5.  Deploy/demo if ready.
