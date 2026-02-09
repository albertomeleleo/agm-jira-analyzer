# Implementation Plan: SLA Remaining Column

**Branch**: `008-sla-remaining-column` | **Date**: 2026-02-08 | **Spec**: [specs/008-sla-remaining-column/spec.md](spec.md)
**Input**: Feature specification from `/specs/008-sla-remaining-column/spec.md`

## Summary

This feature adds a real-time "SLA REMAINING" column to the SLA Issue List. The column will display the working time left until the resolution deadline for all open issues. The calculation will respect business hours (09:00-18:00), skip weekends and holidays, and optionally exclude lunch breaks (13:00-14:00). The implementation will leverage the existing SLA engine in `sla-parser.ts` and update the `SLATable` component.

## Technical Context

**Language/Version**: TypeScript 5.3  
**Primary Dependencies**: React 18, Electron 28, date-fns 4.1, Lucide React  
**Storage**: File system (Jira issues and SLA cache in project-specific JSON files)  
**Testing**: Vitest 4.0  
**Target Platform**: Mac/Windows/Linux (Electron Desktop)
**Project Type**: Single project (Electron)  
**Performance Goals**: Responsive Item List (< 2s loading for 500 issues)  
**Constraints**: Calculation must be purely local (offline-capable using cached data)  
**Scale/Scope**: Updating the `SLATable` and the shared SLA calculation engine.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First**: N/A (Internal feature development)
- **CLI Interface**: N/A (GUI-focused feature)
- **Test-First (NON-NEGOTIABLE)**: PASS. New business hour calculation logic will be unit-tested.
- **Integration Testing**: PASS. Focus on `SLATable` rendering with calculated remaining time.

## Project Structure

### Documentation (this feature)

```text
specs/008-sla-remaining-column/
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
│   └── sla-parser.ts    # Update calculation logic
├── renderer/
│   ├── src/
│   │   ├── components/
│   │   │   └── IssueListPage.tsx
│   │   └── design-system/
│   │       └── organisms/
│   │           └── SLATable.tsx # Add column
└── shared/
    └── sla-types.ts     # Update SLAIssue interface
```

**Structure Decision**: Standard project structure. The core logic change happens in `main` (calculation engine) and `shared` (types), while the UI changes are in `renderer`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |