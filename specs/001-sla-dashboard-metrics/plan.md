# Implementation Plan: SLA Dashboard Metrics

**Branch**: `001-sla-dashboard-metrics` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-sla-dashboard-metrics/spec.md`

## Summary

The feature is to replace the current issue-focused SLA Dashboard with a metrics-only view. This will involve removing the issue list and replacing it with a series of charts that visualize team productivity and SLA compliance. The new charts will display weekly open vs. closed tasks and bugs/service requests, SLA compliance for response and resolution times, and pie charts for issue type distribution and priority breakdown.

## Technical Context

**Language/Version**: TypeScript
**Primary Dependencies**: React, Electron, Vite, TailwindCSS
**Storage**: N/A (Data is read from Jira, not stored locally for this feature)
**Testing**: Vitest
**Target Platform**: Electron Application (macOS, Windows, Linux)
**Project Type**: Web Application (React frontend in an Electron container)
**Performance Goals**: All charts must render in under 3 seconds.
**Constraints**: The dashboard must not display a list of individual issues.
**Scale/Scope**: The feature is a replacement of the existing SLA Dashboard view.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Clarity**: Is the feature's purpose clear and well-documented? (Yes, in `spec.md`)
- **Simplicity**: Does the implementation avoid unnecessary complexity? (NEEDS CLARIFICATION: What is the best library for charting? Is `recharts` already in use or should another be considered?)
- **Testability**: Is the logic independently testable? (NEEDS CLARIFICATION: How to aggregate the metrics from the raw Jira data in a testable way?)

## Project Structure

### Documentation (this feature)

```text
specs/001-sla-dashboard-metrics/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
src/
├── main/
│   └── services/
│       └── SlaMetricsService.ts # NEW - to aggregate metrics
├── renderer/
│   └── src/
│       ├── components/
│       │   └── SLADashboard.tsx      # Will be replaced with the new metrics view
│       └── design-system/
│           └── organisms/
│               ├── SLACharts.tsx         # NEW - will contain the new charts
│               └── SLATable.tsx          # To be removed
└── shared/
    └── sla-types.ts            # May need to be updated with new metric types
```

**Structure Decision**: A new service will be created in the main process to handle the aggregation of metrics. The existing `SLADashboard.tsx` will be replaced with a new version that uses the new `SLACharts.tsx` component. The `SLATable.tsx` component will be removed.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| -         | -          | -                                   |
