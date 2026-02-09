# Data Model: Issue Key Sorting

## Entities

### SLAIssue (`src/shared/sla-types.ts`)
*Status*: Existing.
This entity contains the `key` field (e.g., "RAM-1000") used for sorting. No structural changes are needed.

## Shared Logic

### Jira Utilities (`src/shared/jira-utils.ts`)
A new shared utility file to handle Jira-specific data operations.

#### `compareJiraKeys(a: string, b: string): number`
A comparison function for sorting Jira keys numerically.

**Logic:**
1.  **Split**: Split both keys by the first hyphen `-`.
    *   Example: `"RAM-1000"` → `prefix: "RAM"`, `num: "1000"`
2.  **Compare Prefix**: Compare the project prefixes lexicographically.
    *   If `prefixA !== prefixB`, return `prefixA.localeCompare(prefixB)`.
3.  **Compare Number**: If prefixes are identical, parse the number parts as integers.
    *   Return `parseInt(numA, 10) - parseInt(numB, 10)`.
4.  **Fallback**: If parsing fails or keys don't match the expected format, fall back to `localeCompare` on the full strings.

## UI State

### Default Sort State (`SLATable.tsx`)
The initial state of the table component:
- `sortField`: `'key'`
- `sortDir`: `'desc'` (New default)
