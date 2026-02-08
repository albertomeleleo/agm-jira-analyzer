# Quickstart: SLA Dashboard Advanced Filters

**Feature**: 002-sla-dashboard-filters
**Date**: 2026-02-07 (updated 2026-02-08)

## Prerequisites

- Node.js installed
- Project dependencies installed (`npm install`)
- At least one project configured with SLA data imported

## How to Test

### Start the app

```bash
npm run dev
```

### Test Scenario 1: Filter by Category (US1)

1. Navigate to the SLA Dashboard
2. Verify filters are displayed in visually separated groups: Issue Type, Priority, Status, Date/Period
3. Click an issue type chip (e.g., "Bug") → verify only bugs appear in the table
4. Click a priority chip (e.g., "High") → verify only high-priority bugs appear (AND logic)
5. Click the same priority chip again → verify it deselects and shows all bugs again
6. Verify the "Showing X of Y issues" indicator appears when filters are active
7. Click "Reset Filters" → verify all filters are cleared

**Pass criteria**: Filters apply correctly with AND between categories and OR within categories. Issue count indicator is accurate.

### Test Scenario 2: Filter Persistence Across Navigation (US2)

1. Apply filters: select "Bug" issue type + "High" priority
2. Navigate to Settings page
3. Navigate back to SLA Dashboard
4. Verify "Bug" and "High" are still selected and data is filtered

5. Close the app completely
6. Reopen the app
7. Verify the same filters are still active

**Pass criteria**: Filters survive both in-app navigation and app restart.

### Test Scenario 3: Save Named Filter Preset (US3)

1. Apply filters: select "Bug" + "Critical" priority + current month
2. Click "Save Filter" button
3. Enter name: "Critical Bugs This Month"
4. Confirm save
5. Verify a new chip appears in the preset bar with the name "Critical Bugs This Month"
6. Click "Reset Filters" to clear all active filters
7. Click the "Critical Bugs This Month" preset chip
8. Verify all three filters (Bug, Critical, current month) are restored
9. Verify data refreshes to match the saved configuration

**Pass criteria**: Preset saves and loads correctly. Single-click activation.

### Test Scenario 4: Manage Presets (US4)

1. Create a preset named "Test Preset" with some filters
2. Right-click (or use menu) on the preset chip → choose "Rename"
3. Enter new name: "Renamed Preset"
4. Verify the chip now shows "Renamed Preset"
5. Apply different filters
6. Right-click the preset → choose "Update"
7. Confirm the update
8. Reset filters, then load the preset → verify it contains the updated filters
9. Right-click the preset → choose "Delete"
10. Confirm deletion
11. Verify the preset chip is removed

**Pass criteria**: All CRUD operations work correctly on presets.

### Test Scenario 5: Edge Cases

1. Try saving a preset with an empty name → verify validation error
2. Try saving a preset with a name > 50 characters → verify validation error
3. Try saving a preset with a duplicate name → verify validation error
4. Create 20 presets → try saving a 21st → verify limit message
5. Clear localStorage from browser dev tools → reload → verify app works with default filters (no crash)

**Pass criteria**: All edge cases handled gracefully with user-friendly messages.

### Test Scenario 6: Issue List Page (US5)

1. Click the "Issue List" entry in the sidebar (right after Dashboard)
2. Verify the page shows only the SLA issue table with filters — no stat cards, no charts
3. Verify the filter bar (Issue Type, Priority, Status, Date/Period) and preset bar are present
4. Apply a filter (e.g., "Bug" issue type) → verify only bugs appear in the table
5. Verify the "Showing X of Y issues" indicator appears
6. Load a preset saved from the Dashboard → verify it applies correctly
7. Navigate to the SLA Dashboard → verify the Dashboard has its **own** independent filter state (not affected by Issue List filters)
8. Navigate back to Issue List → verify the Issue List filters are still active

**Pass criteria**: Issue List page shows only the table with filters. Presets are shared. Active filters are independent per page.

### Test Scenario 7: Independent Filter Persistence (US5 + US2)

1. On the SLA Dashboard, apply filters: "Bug" + "High"
2. Navigate to Issue List page
3. On Issue List, apply filters: "Task" + "Low"
4. Navigate to Settings, then back to SLA Dashboard → verify "Bug" + "High" still active
5. Navigate to Issue List → verify "Task" + "Low" still active
6. Close and reopen the app
7. Verify Dashboard has "Bug" + "High" and Issue List has "Task" + "Low" (independent persistence)

**Pass criteria**: Each page persists its own filter state independently across navigation and app restarts.

### Test Scenario 8: Issue List Empty State (US5)

1. Switch to a project with no SLA data imported (or remove the SLA cache)
2. Navigate to Issue List page
3. Verify an empty state is shown with a message directing the user to the SLA Dashboard
4. Verify no "Import Issues" or "Generate Report" buttons are displayed on the Issue List page

**Pass criteria**: Empty state shows informative message, no duplicate action buttons.

## Key Files to Inspect

| File | Purpose |
|------|---------|
| `src/shared/filter-types.ts` | FilterPreset, SerializedFilterState types |
| `src/shared/filter-utils.ts` | Shared `applyFilters` function (new) |
| `src/renderer/src/contexts/FilterContext.tsx` | Page-scoped filter state + shared presets |
| `src/renderer/src/components/IssueListPage.tsx` | New Issue List page (new) |
| `src/renderer/src/components/MainLayout.tsx` | Route for 'issues' page |
| `src/renderer/src/design-system/organisms/Sidebar.tsx` | "Issue List" nav entry |
| `src/renderer/src/design-system/molecules/SLAFilters.tsx` | Filter group UI |
| `src/renderer/src/design-system/molecules/FilterPresetBar.tsx` | Preset chips + management |
| `src/main/services/ProjectService.ts` | Preset file I/O |
| `src/preload/index.ts` | IPC channel definitions |
