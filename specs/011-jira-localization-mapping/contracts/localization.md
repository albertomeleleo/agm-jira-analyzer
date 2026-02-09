# Contract: Localization and Priority Logic

## Shared Localization Utilities

### `getLocalizedStatus`
- **Location**: `src/shared/localization-utils.ts`
- **Input**: `status: string` (Raw English Jira status)
- **Output**: `string` (Italian label or original status)

### `getLocalizedPriority`
- **Location**: `src/shared/localization-utils.ts`
- **Input**: `priority: string` (Raw English Jira priority)
- **Output**: `string` (Italian label or original priority)

## Shared Sorting Utilities

### `comparePriorities`
- **Location**: `src/shared/jira-utils.ts`
- **Input**: `a: string`, `b: string` (Raw English Jira priorities)
- **Output**: `number` (Negative if `a < b`, Positive if `a > b`, 0 if equal)
- **Logic**: Critical (5) > High (4) > Medium (3) > Low (2) > Lowest (1)
