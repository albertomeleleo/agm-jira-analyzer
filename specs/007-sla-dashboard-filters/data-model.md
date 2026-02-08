# Data Model

## Entities

### SLAFilterState
*Location*: `src/shared/filter-types.ts`
*Description*: Represents the state of user-applied filters on the dashboard and issue list.

| Field | Type | Description | New/Existing |
|-------|------|-------------|--------------|
| `issueTypes` | `Set<string>` | Selected issue types (e.g., 'Bug', 'Task') | Existing |
| `priorities` | `Set<string>` | Selected priorities (e.g., 'High', 'Low') | Existing |
| `statuses` | `Set<string>` | Selected pseudo-statuses ('open', 'resolved') | Existing |
| `dateMode` | `'all' \| 'month' \| 'range'` | Time filtering mode | Existing |
| `month` | `string \| null` | Selected month (YYYY-MM) | Existing |
| `dateFrom` | `string \| null` | Start date (YYYY-MM-DD) | Existing |
| `dateTo` | `string \| null` | End date (YYYY-MM-DD) | Existing |
| `search` | `string` | Free text search term (matches key or summary) | **New** |
| `rejectedMode` | `'include' \| 'exclude' \| 'only'` | Filter mode for rejected issues | **New** |

### SLAIssue
*Location*: `src/shared/sla-types.ts`
*Description*: Represents a single issue with calculated SLA data.
*Key Fields for Filtering*:
- `key`: string (matched by search)
- `summary`: string (matched by search)
- `status`: string (used by rejected filter, e.g., "Rejected", "Won't Fix")
- `issueType`: string
- `priority`: string
- `created`: string
- `resolved`: string | null

### SlaMetrics
*Location*: `src/shared/sla-types.ts`
*Description*: Aggregated metrics for charts.
*Note*: This structure remains the same, but it will now be calculated client-side using filtered data.

## Shared Logic

### `calculateSlaMetrics(issues: SLAIssue[]): SlaMetrics`
*New Location*: `src/shared/sla-calculations.ts`
*Origin*: Extracted from `src/main/services/SlaMetricsService.ts`
*Purpose*: To allow both backend (legacy/API) and frontend (interactive dashboard) to calculate metrics from a list of issues.

### `applyFilters(issues: SLAIssue[], filters: SLAFilterState): SLAIssue[]`
*Location*: `src/shared/filter-utils.ts`
*Updates*:
- Add logic to filter by `search` (case-insensitive substring match on `key` and `summary`).
- Add logic to filter by `rejectedMode`:
    - `exclude`: Remove issues where `status` contains "reject" (case-insensitive).
    - `only`: Keep ONLY issues where `status` contains "reject".
    - `include`: Do nothing (keep all).
