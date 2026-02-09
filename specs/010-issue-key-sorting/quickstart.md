# Quickstart: Issue Key Sorting

## Overview
This feature ensures Jira issues are sorted numerically by their sequence number (e.g., RAM-1000 > RAM-998) instead of lexicographically. It also sets the default sort order to Descending.

## Verification Steps

1.  **Open the Application**.
2.  **Navigate to Issue List or Dashboard**.
3.  **Verify Default Order**:
    -   Observe the "Key" column.
    -   The issue with the highest number (e.g., `PROJ-100`) should be at the top.
    -   The issue with the lowest number (e.g., `PROJ-1`) should be at the bottom.
4.  **Test Numerical Accuracy**:
    -   Ensure `RAM-1000` appears *above* `RAM-998` when sorted Descending.
    -   Ensure `RAM-10` appears *below* `RAM-2` when sorted Ascending (lexicographical sorting would put `RAM-10` above `RAM-2`).
5.  **Test Toggling**:
    -   Click the "Key" header.
    -   The list should reverse its order immediately.

## Technical Notes
-   Logic resides in `src/shared/jira-utils.ts`.
-   UI update in `src/renderer/src/design-system/organisms/SLATable.tsx`.
-   Unit tests in `tests/jira-utils.test.ts` (17 test cases, all passing).

## Implementation Summary
-   ✅ Created `compareJiraKeys()` utility with numerical comparison logic
-   ✅ Comprehensive test coverage including edge cases (leading zeros, multiple hyphens, large numbers)
-   ✅ Updated default `sortDir` to `'desc'` in SLATable component
-   ✅ Integrated numerical sorting into table's sorting logic
-   ✅ Updated sort field switching to default to descending order
-   ✅ All 103 tests passing (17 new jira-utils tests + 86 existing tests)
-   ✅ No TypeScript regressions
