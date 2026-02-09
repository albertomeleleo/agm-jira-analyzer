# Data Model: Jira Localization and Priority Mapping

## Entities

### SLAIssue (`src/shared/sla-types.ts`)
*Status*: Existing.
Fields used for localization:
- `status`: string (Raw English value from Jira)
- `priority`: string (Raw English value from Jira)

## Shared Logic

### Localization Mapper (`src/shared/localization-utils.ts`)

#### `STATUS_MAPPING`: Record<string, string>
- `Done`: `Completata`
- `In progress`: `In corso`
- `Rejected`: `Rifiutato`

#### `PRIORITY_MAPPING`: Record<string, string>
- `Critical`: `Critico`
- `High`: `Alta`
- `Medium`: `Media`
- `Low`: `Bassa`
- `Lowest`: `Minore`

#### `getLocalizedStatus(status: string): string`
Returns Italian label if mapped, otherwise raw status.

#### `getLocalizedPriority(priority: string): string`
Returns Italian label if mapped, otherwise raw priority.

### Jira Utilities (`src/shared/jira-utils.ts`)

#### `PRIORITY_WEIGHTS`: Record<string, number>
- `Critical`: 5
- `High`: 4
- `Medium`: 3
- `Low`: 2
- `Lowest`: 1

#### `comparePriorities(a: string, b: string): number`
Uses `PRIORITY_WEIGHTS` to compare two English priority strings.
If a priority is unknown, weight defaults to 0.
Used for sorting issues logically.
