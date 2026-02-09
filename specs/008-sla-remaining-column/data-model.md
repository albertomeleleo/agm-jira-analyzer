# Data Model: SLA Remaining Column

## Entities

### SLAIssue (`src/shared/sla-types.ts`)
Update the interface to include necessary fields for client-side real-time calculation.

| Field | Type | Description |
|-------|------|-------------|
| `resolutionStart` | `string \| null` | ISO timestamp when resolution work started. |
| `reactionStart` | `string \| null` | ISO timestamp when reaction time started (usually `created`). |

### SLAReport (`src/shared/sla-types.ts`)
Add metadata to the report to ensure client-side calculation matches the policy used during report generation.

| Field | Type | Description |
|-------|------|-------------|
| `excludeLunchBreak` | `boolean` | Whether lunch break was excluded during generation. |

## Shared Logic

### Business Hours Utility (`src/shared/business-hours.ts`)
Extract pure calculation logic from `src/main/sla-parser.ts` to allow reuse in the renderer.

- `getBusinessMinutesBetween(start: Date, end: Date, excludeLunch: boolean): number`
- `getCalendarMinutesBetween(start: Date, end: Date): number`
- `isBusinessDay(date: Date): boolean`
- `isHoliday(date: Date): boolean`
- `getItalianHolidays(year: number): Date[]`
- `getEasterMonday(year: number): Date[]`

## State Transitions
No new state transitions. The feature adds a computed field displayed in the UI.
