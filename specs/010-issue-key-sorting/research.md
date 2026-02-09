# Phase 0: Research & Findings

## 1. Technical Context & Unknowns

**Unknown 1: Current Sorting Implementation**
- **Finding**: Sorting is implemented in `src/renderer/src/design-system/organisms/SLATable.tsx` using `useMemo` and a `sortField`/`sortDir` state.
- **Key Sorting**: The current implementation uses `a.key.localeCompare(b.key)`, which results in lexicographical sorting (e.g., "PROJ-10" comes before "PROJ-2").
- **Default State**: Currently defaults to `sortField: 'key'` and `sortDir: 'asc'`.

**Unknown 2: Jira Key Parsing**
- **Finding**: Jira Keys follow the pattern `PROJECTKEY-NUMBER`.
- **Resolution**: To sort numerically, we need to extract the number part. A regex like `/([A-Z0-9]+)-(\d+)/` can be used to split the key into its project prefix and numerical sequence.

## 2. Technology Choices

- **Sorting Logic**: Client-side sorting using a custom comparison function in `SLATable.tsx` or a shared utility.
- **Comparison Function**: 
    1. Split key by hyphen `-`.
    2. Compare project prefixes lexicographically.
    3. If prefixes are equal, compare numerical parts as numbers (`parseInt`).

## 3. Implementation Plan Refinement

1.  **Shared Utility**: Create `src/shared/jira-utils.ts` with a `compareJiraKeys(a: string, b: string): number` function.
2.  **Table Update**:
    -   Update `SLATable` default state to `sortDir: 'desc'`.
    -   Replace `localeCompare` with `compareJiraKeys` in the `useMemo` sorting block.
3.  **TDD**: Write unit tests for the comparison function to handle edge cases like different project keys and large numbers.

## 4. Alternatives Considered

-   **Natural Sort Library**: Using a library like `javascript-natural-sort`.
    -   *Verdict*: Rejected. The Jira key format is simple and specific enough that a small custom function is more efficient and avoids a new dependency.
-   **Backend Sorting**: Sorting in the main process.
    -   *Verdict*: Rejected. The app already uses client-side filtering and sorting for instant feedback. Consistency with existing patterns is preferred.
