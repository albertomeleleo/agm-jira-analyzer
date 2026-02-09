# Research: SLA Remaining Column

## Decision 1: Shared Logic for Business Hours
**Decision**: Extract business hour logic from `src/main/sla-parser.ts` to `src/shared/business-hours.ts`.
**Rationale**: FR-006 requires "real-time" calculation in the renderer. To ensure the countdown in the UI perfectly matches the values in the generated report, both must use the same calculation engine. `date-fns` is already a shared dependency.

## Decision 2: Renderer-side Minute Ticker
**Decision**: Implement a custom hook `useRemainingTime` in the renderer that triggers a re-render every 60 seconds.
**Rationale**: This fulfills the real-time requirement without the overhead of re-generating the entire SLA report from Jira data. The "remaining" value is a function of `(target, elapsedNet, now)`.

## Decision 3: SLA Target Duration Source
**Decision**: Use `reactionTargetMinutes` and `resolutionTargetMinutes` already present in `SLAIssue`.
**Rationale**: These targets are determined by the backend during report generation based on the project's `slaGroups` mapping (Priority to Minutes). Storing them in the issue object avoids duplicating the priority mapping logic in the frontend.

## Decision 4: Handling Edge Cases (Holidays)
**Decision**: Use the existing Italian holiday calculation in `sla-parser.ts`.
**Rationale**: The user specifically mentioned "giorni festivi" (holidays). The current implementation covers Italian national holidays including Easter Monday.

## Alternatives Considered
- **Web Workers for Calculation**: Overkill for 500 issues. Modern JS engines handle the business hour calculation for hundreds of issues in milliseconds.
- **Background Refresh**: Too heavy (requires Jira IPC and file I/O).
