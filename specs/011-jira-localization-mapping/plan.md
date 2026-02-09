# Implementation Plan: Jira Localization and Priority Mapping

**Branch**: `011-jira-localization-mapping` | **Date**: 2026-02-08 | **Spec**: [specs/011-jira-localization-mapping/spec.md](spec.md)
**Input**: Feature specification from `/specs/011-jira-localization-mapping/spec.md`

## Summary

This feature implements Italian localization for Jira statuses and priorities and enforces logical priority sorting. We will extract mapping logic into a shared utility and update UI components (`SLATable`, `SLAFilters`) to display localized labels while maintaining the raw English values for data integrity and filtering logic. A new comparison utility will ensure priorities are sorted by urgency rather than alphabetically.

## Technical Context

**Language/Version**: TypeScript 5.3  
**Primary Dependencies**: React 18, Electron 28, TailwindCSS 3.4  
**Storage**: N/A (Static mappings in code)  
**Testing**: Vitest 4.0  
**Target Platform**: Electron Desktop
**Project Type**: Single project
**Performance Goals**: Instant UI mapping (< 1ms per item)
**Constraints**: Zero-dependency on external i18n libraries; Case-insensitive mapping.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First**: N/A (Internal feature)
- **CLI Interface**: N/A (GUI feature)
- **Test-First (NON-NEGOTIABLE)**: PASS. Localization and sorting utilities will be unit-tested.
- **Integration Testing**: PASS. Focus on correct label rendering in `SLATable`.

## Project Structure

### Documentation (this feature)

```text
specs/011-jira-localization-mapping/
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
├── renderer/
│   ├── src/
│   │   ├── components/
│   │   │   └── SLADashboard.tsx
│   │   └── design-system/
│   │       ├── molecules/
│   │       │   └── SLAFilters.tsx
│   │       └── organisms/
│   │           └── SLATable.tsx
└── shared/
    ├── localization-utils.ts # NEW: Mapping logic
    ├── jira-utils.ts         # UPDATE: Logical sorting
    └── status-utils.ts       # UPDATE: Logic consistency
```

**Structure Decision**: Shared logic for mapping and sorting to ensure consistency across main/renderer if needed.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Custom weights for sorting | Business requirement | Alphabetical sorting is logically incorrect for priorities. |