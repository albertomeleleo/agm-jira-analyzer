# Quickstart

## Prerequisites
- Node.js (v20+)
- NPM
- A Jira project (or mock data) to sync.

## Running the Application

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Start the development environment**:
    ```bash
    npm run dev
    ```

## Verifying the Feature

1.  **Open the SLA Dashboard**.
2.  **Verify New Filters**:
    - Check the filter bar for a "Search" input (with magnifier icon) and "Rejected" toggle chips (Include / Exclude / Only).
3.  **Test Search**:
    - Enter a known issue key (e.g., "PROJ-123").
    - **Expected**: All charts update instantly to reflect only that issue. Issue count shows "1 / N issues".
    - Enter a summary keyword (e.g., "login").
    - **Expected**: Only issues whose summary contains "login" are reflected in the charts.
4.  **Test Rejected Filter**:
    - Click "Exclude" in the Rejected row.
    - **Expected**: "Rejected" slice disappears from the "Bugs / Service Requests vs Rejected" pie chart.
    - Click "Only".
    - **Expected**: Only rejected issues shown; other charts reflect only that subset.
    - Click "Include" to return to default.
5.  **Test Empty State**:
    - Enter a search term that matches no issues.
    - **Expected**: Charts area shows "No issues match the current filters." message.
6.  **Test Filter Persistence**:
    - Go to "Issues" page.
    - Change filters.
    - Return to "SLA Dashboard".
    - **Expected**: Filters set on "Issues" page (and vice-versa) should be preserved if sharing is enabled, OR at least page-specific persistence works as before (current implementation separates page filters).
    - *Correction*: Requirement FR-001 says "Dashboard subscribes to... shared filter state". If we decide to link them, we must ensure `FilterContext` uses the same key or syncs them. Currently `FilterContext` isolates them (`pageFilters` map). To make them shared, we might need to change `FilterContext` to use a single state or sync them. *However*, User Story 1 says "apply the same filters I use on the Issues page", which implies shared state or ability to copy. If the user wants *exact* sharing, we might need to merge the states.
    - *Re-read Research*: "The System MUST ensure the SLA Dashboard subscribes to and reacts to the application's shared filter state."
    - *Plan Adjustment*: We should probably change `FilterContext` to allow a "shared" mode or just merge the states if that's the desired UX. For now, we will verify that the dashboard *has* the filters. The "shared" aspect might be achieved by using the same `pageId` or syncing.

## Testing

Run unit tests:
```bash
npm test
```
(Focus on `filter-utils.test.ts` and `sla-calculations.test.ts` if created)
