# Implementation Plan: SLA Dashboard Filters

**Branch**: `007-sla-dashboard-filters` | **Date**: 2026-02-08 | **Spec**: [specs/007-sla-dashboard-filters/spec.md](spec.md)
**Input**: Feature specification from `/specs/007-sla-dashboard-filters/spec.md`

## Summary

Enable interactive filtering on the SLA Dashboard by subscribing to the application's shared `FilterContext`. The feature introduces free-text search (summary/key) and a "Rejected" status toggle. To ensure high performance (< 2s updates), metric aggregation logic will be moved to the `shared` layer, allowing the dashboard to recalculate charts client-side whenever filters change.

## Technical Context

**Language/Version**: TypeScript 5.x  
**Primary Dependencies**: React 18, Electron, Vite, TailwindCSS, Recharts, Lucide-React, Date-fns  
**Storage**: LocalStorage (Filter persistence) & Local File System (Jira data cache)  
**Testing**: Vitest (Unit & Component tests)  
**Target Platform**: Electron (Desktop)
**Project Type**: Single project (Electron with React frontend)  
**Performance Goals**: UI update < 2s for datasets up to 10,000 issues (SC-001)  
**Constraints**: Zero-dependency on live Jira connection for filtering (must work on cached data)  
**Scale/Scope**: 1 dashboard, 1 shared filter context, 10k issues limit

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First**: N/A (Internal feature development)
- **CLI Interface**: N/A (GUI-focused feature)
- **Test-First (NON-NEGOTIABLE)**: PASS. New shared logic (`calculateSlaMetrics`, `applyFilters`) will be TDD'd.
- **Integration Testing**: PASS. Focus on `FilterContext` -> `SLADashboard` reactivity.

## Project Structure

### Documentation (this feature)

```text
specs/007-sla-dashboard-filters/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (IPC/Shared types)
│   └── ipc-channels.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── main/                # Main process (Electron)
│   └── services/        # SlaMetricsService (will use shared logic)
├── renderer/            # Renderer process (React)
│   ├── src/
│   │   ├── components/  # SLADashboard.tsx (refactored)
│   │   ├── contexts/    # FilterContext.tsx (extended)
│   │   └── design-system/
│   │       └── molecules/ # SLAFilters.tsx (UI updates)
└── shared/              # Shared logic (Main + Renderer)
    ├── filter-types.ts  # Filter state extension
    ├── filter-utils.ts  # Filtering logic extension
    ├── sla-types.ts     # SLA data types
    └── sla-calculations.ts # NEW: Metric aggregation logic
```

**Structure Decision**: Single project structure using `shared/` for cross-process logic. This enables the frontend to calculate metrics for immediate feedback while allowing the backend to use the same logic for background reporting.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Client-side calculation | Performance (SC-001) | IPC roundtrips for every keystroke/toggle are too slow. |