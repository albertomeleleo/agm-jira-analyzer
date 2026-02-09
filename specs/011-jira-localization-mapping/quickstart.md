# Quickstart: Jira Localization and Priority Mapping

## Overview
This feature provides Italian translations for Jira statuses and priorities and enforces logical sorting for priorities.

## Key Files
- `src/shared/localization-utils.ts`: Localization mapping and logic.
- `src/shared/jira-utils.ts`: Logical priority sorting.
- `src/renderer/src/design-system/organisms/SLATable.tsx`: UI integration.
- `src/renderer/src/design-system/molecules/SLAFilters.tsx`: Filter localization.

## Verification Steps

1. **Check Status Labels**:
   - Navigate to the **Issue List**.
   - Verify that "Done" issues show the "Completata" tag.
   - Verify that "In progress" issues show the "In corso" tag.
   - Verify that "Rejected" issues show the "Rifiutato" tag.

2. **Check Priority Labels**:
   - Verify that "Critical" priority appears as "Critico".
   - Verify that "High" priority appears as "Alta".
   - Verify that "Medium" priority appears as "Media".
   - Verify that "Low" priority appears as "Bassa".
   - Verify that "Lowest" priority appears as "Minore".

3. **Verify Logical Sorting**:
   - Click the **Priority** header in the table.
   - Verify that sorting follows the hierarchy: **Critico > Alta > Media > Bassa > Minore** (and vice-versa).
   - Alphabetical sorting (Alta, Bassa, Critico...) MUST NOT be used.

4. **Verify Filters**:
   - Open the filter sidebar.
   - Verify that priority chips and status chips use the Italian labels.
   - Apply a filter (e.g., "Critico") and verify that the correct issues are displayed.
