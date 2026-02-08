# Quickstart: SLA One-Click Sync

**Feature**: 004-sla-sync-button
**Date**: 2026-02-07

## Prerequisites

1. A configured project with valid Jira credentials (Settings page)
2. Jira instance reachable from the machine

## Test Scenarios

### Scenario 1: First-time use — Sync button disabled

1. Open the app and select a project that has **never** imported SLA issues
2. Navigate to the SLA Dashboard
3. **Expected**: The Sync button is disabled (or not visible). Only "Import Issues" and "Generate Report" buttons are available.

### Scenario 2: Import issues and verify JQL is saved

1. On the SLA Dashboard, click "Import Issues"
2. Enter or modify the JQL query (e.g., `project = "MYPROJ" AND created >= -30d ORDER BY created DESC`)
3. Click "Import Issues" in the modal
4. Wait for import to complete successfully
5. Close the modal
6. **Expected**: The Sync button is now enabled (it knows a JQL was saved)

### Scenario 3: One-click Sync

1. After Scenario 2, click the Sync button
2. **Expected**:
   - Button shows loading state (spinner/disabled)
   - Issues are re-imported using the same JQL from Scenario 2
   - SLA report is automatically generated
   - Dashboard updates with refreshed data (stats, charts, table)
   - No modal or intermediate dialog appears

### Scenario 4: Import modal pre-fills last JQL

1. After Scenario 2 or 3, click "Import Issues" to open the modal
2. **Expected**: The JQL textarea is pre-filled with the JQL from the last successful import (not the default template)

### Scenario 5: JQL persistence across app restart

1. After a successful import, close the application completely
2. Reopen the application, select the same project
3. Navigate to the SLA Dashboard
4. **Expected**: The Sync button is enabled (last JQL was persisted to disk)
5. Click "Import Issues" — **Expected**: JQL textarea shows the previously used JQL

### Scenario 6: Sync with network error

1. Disconnect from the network (or use an invalid Jira URL)
2. Click the Sync button
3. **Expected**:
   - Error message is displayed (e.g., "Failed to import: connection error")
   - Report generation is NOT attempted
   - Previously existing data on the dashboard remains unchanged

### Scenario 7: Import modal cancel does NOT update stored JQL

1. Start with a stored JQL (from a previous successful import)
2. Open the Import modal
3. Modify the JQL to something different
4. Click "Cancel" (do NOT import)
5. Click the Sync button
6. **Expected**: The sync uses the **original** stored JQL, not the modified one from the cancelled modal

### Scenario 8: Updated JQL via Import modal

1. Open the Import modal
2. Change the JQL to a different query
3. Click "Import Issues" — wait for success
4. Close the modal
5. Click the Sync button
6. **Expected**: The sync now uses the **new** JQL from the latest successful import
