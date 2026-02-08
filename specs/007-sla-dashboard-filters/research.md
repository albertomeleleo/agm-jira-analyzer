# Phase 0: Research & Findings

## 1. Technical Context & Unknowns

**Unknown 1: "Shared Filter State" Location**
- **Finding**: The application uses `FilterContext.tsx` to manage filter state (`SLAFilterState`) for 'dashboard' and 'issues' pages. It syncs to `localStorage` and supports presets via `window.api`.
- **Resolution**: We will leverage `FilterContext` to share filters. We need to extend `SLAFilterState` to support the new requirements (search, rejected filter).

**Unknown 2: "Rejected" Filter Implementation**
- **Finding**: Current `SLAFilterState` has `statuses: Set<string>`, but the UI only exposes "Open" vs "Resolved" pseudo-statuses. The backend/shared `filter-utils.ts` interprets these specific strings.
- **Resolution**:
    - Add `rejectedMode: 'include' | 'exclude' | 'only'` to `SLAFilterState`. Default should likely be `'include'` (show all) or `'exclude'` (hide rejected) depending on PM preference. Requirement says "filter out rejected" so `'exclude'` might be a good default or we keep current behavior (include) and user opts-in. *Decision: Default to 'include' (backward compatible) but allow user to switch.*
    - Add `search: string` to `SLAFilterState`.

**Unknown 3: Implementation Strategy (Backend vs Frontend)**
- **Finding**:
    - `SLADashboard.tsx` currently fetches pre-calculated metrics via `window.api.getSlaMetrics`.
    - `SlaMetricsService` (backend) calculates these metrics from cached issues.
    - `IssueListPage.tsx` fetches raw issues via `window.api.getSLACache` (which returns `SLAReport` containing `issues`) and filters them client-side.
    - `window.api.getSLAIssues` also exists and returns `issues`.
    - `filter-utils.ts` exists in `shared` and is used by `IssueListPage`.
- **Decision**: **Frontend Filtering**.
    - **Rationale**:
        - Consistency with `IssueListPage`.
        - Instant UI feedback (SC-001 < 2s).
        - Avoids sending complex filter state to backend for every change.
        - Data size is manageable (electron app, local Jira cache).
    - **Plan**:
        - Extract metric calculation logic from `SlaMetricsService.ts` to `shared/sla-metrics-calculator.ts` (or similar).
        - Update `SLADashboard.tsx` to fetch raw issues (using `getSlaMetrics` is no longer sufficient if we filter client-side, unless we send filters. But fetching raw issues allows flexible filtering).
        - Actually, `getSlaMetrics` returns *metrics*. `getSLAIssues` returns *issues*. We should switch `SLADashboard` to use `getSLACache` (returns report with issues) or `getSLAIssues`. `IssueListPage` uses `getSLACache`.
        - Use `applyFilters` (updated) and `calculateMetrics` (new shared function) in `SLADashboard`.

## 2. Technology Choices

- **State Management**: `FilterContext` (existing).
- **Filtering Logic**: `shared/filter-utils.ts` (extended).
- **Metric Logic**: `shared/sla-calculations.ts` (extracted from `SlaMetricsService`).
- **UI**: `SLAFilters.tsx` (extended with search and rejected toggle).

## 3. Implementation Plan Refinement

1.  **Shared Logic Extraction**: Move `calculateMetrics` from `SlaMetricsService` to `shared`.
2.  **Type Updates**: Add `search` and `rejectedMode` to `SLAFilterState`.
3.  **Logic Updates**: Update `applyFilters` to handle search (summary/key) and rejected status.
4.  **UI Updates**: Add controls to `SLAFilters`.
5.  **Dashboard Integration**: Refactor `SLADashboard` to fetch issues -> filter -> calculate.

## 4. Alternatives Considered

-   **Backend Filtering**: Modify `getSlaMetrics` to accept filters.
    -   *Pros*: Less processing on frontend.
    -   *Cons*: Slower interaction (IPC overhead), inconsistent with `IssueListPage`, requires duplicating filter logic in backend or sharing it anyway.
    -   *Verdict*: Rejected. Frontend filtering is more responsive and consistent.

-   **New IPC Channel for Filtered Metrics**: `getFilteredSlaMetrics(...)`.
    -   *Cons*: Same as above.
