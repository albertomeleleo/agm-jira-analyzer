# Phase 0: Research & Findings

## 1. Technical Context & Unknowns

**Unknown 1: Standard Status List**
- **Finding**: Jira statuses are dynamic and vary by project. Common ones mentioned in the spec are: "Rejected", "Released", "Done", "Backlog", "In Progress", "Review", "Testing", "Open", "New".
- **Resolution**: We will implement a robust mapping utility that handles these common keywords (case-insensitive) and provides a default for unknown ones.

**Unknown 2: Component Capabilities**
- **Finding**: The existing `Badge` component (`src/renderer/src/design-system/atoms/Badge.tsx`) already supports the required variants: `success` (green), `danger` (red), `warning` (orange), `info` (blue), and `default` (gray).
- **Resolution**: Use the `Badge` component for rendering status tags.

**Unknown 3: Table Layout**
- **Finding**: `SLATable.tsx` currently has 9 columns. Adding a "Status" column will make it 10.
- **Resolution**: Insert the "Status" column after "Type" and before "Priority" or "Reaction" to maintain logical flow. The spec requested it to be visible on every issue.

## 2. Technology Choices

- **UI Component**: `Badge` (existing).
- **Mapping Logic**: Shared utility function `getStatusVariant(status: string): BadgeVariant`.
- **Location**: `src/shared/status-utils.ts` (to allow potential use in other parts of the app).

## 3. Implementation Plan Refinement

1.  **Shared Utility**: Create `src/shared/status-utils.ts` with logic to categorize statuses into color variants.
2.  **Table Update**:
    -   Update `SLATable` header to include "Status".
    -   Update `IssueRow` to render the `Badge` with the mapped variant.
3.  **No sorting**: Per user choice, the column will not be sortable.

## 4. Alternatives Considered

-   **Configurable Mapping**: Allowing users to define status-to-color mapping in settings.
    -   *Verdict*: Rejected for now to keep implementation simple (MVP). Standard keyword matching covers 90% of use cases.
-   **Direct string comparison**: Using `if (status === 'Done') ...` in the component.
    -   *Verdict*: Rejected. A shared utility is cleaner and more maintainable.
