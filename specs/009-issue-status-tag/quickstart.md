# Quickstart: Issue Status Tags

## Overview
This feature adds visual status indicators to the Issue List table.

## Verification Steps

1.  **Open the Application**.
2.  **Navigate to Issue List**: Click on the "Issue List" sidebar entry.
3.  **Verify Status Column**:
    -   Observe the new "Status" column in the table.
    -   Ensure every issue has a tag (Badge).
4.  **Verify Colors**:
    -   Check that "Done" or "Released" issues are Green.
    -   Check that "Rejected" issues are Red.
    -   Check that "In Progress" issues are Orange.
    -   Check that "Backlog" or "Open" issues are Blue.
5.  **Verify Responsiveness**: Ensure the table still scrolls and sorts smoothly.

## Technical Notes
-   Logic resides in `src/shared/status-utils.ts`.
-   UI update in `src/renderer/src/design-system/organisms/SLATable.tsx`.
