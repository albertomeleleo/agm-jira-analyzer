# Implementation Plan: Issue Key Sorting

**Branch**: `010-issue-key-sorting` | **Date**: 2026-02-08 | **Spec**: [specs/010-issue-key-sorting/spec.md](spec.md)
**Input**: Feature specification from `/specs/010-issue-key-sorting/spec.md`

## Summary

This feature implements numerical sorting for Jira Keys in the `SLATable` component. Instead of lexicographical comparison (which puts `PROJ-10` before `PROJ-2`), the logic will extract the sequence number and compare it as an integer. The default sort order for the Issue List will be changed to **Key Descending** to highlight the most recent issues.

## Technical Context

**Language/Version**: TypeScript 5.3  
**Primary Dependencies**: React 18, Electron 28, TailwindCSS 3.4  
**Storage**: N/A (UI-only change using existing `SLAIssue` data)  
**Testing**: Vitest 4.0  
**Target Platform**: Mac/Windows/Linux (Electron Desktop)
**Project Type**: Single project (Electron)  
**Performance Goals**: Instant sorting for up to 1,000 issues.  
**Constraints**: Must handle standard Jira Key formats (Prefix-Number).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First**: N/A (Internal UI feature)
- **CLI Interface**: N/A (GUI-focused)
- **Test-First (NON-NEGOTIABLE)**: PASS. The comparison utility will be unit-tested before UI integration.
- **Integration Testing**: PASS. Focus on `SLATable` default state and header toggling.

## Project Structure

### Documentation (this feature)

```text
specs/010-issue-key-sorting/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── sorting-logic.md
└── tasks.md             # Phase 2 output (to be created)
```

### Source Code (repository root)

```text
src/
├── renderer/
│   ├── src/
│   │   └── design-system/
│   │       └── organisms/
│   │           └── SLATable.tsx # Main UI update
└── shared/
    └── jira-utils.ts        # New: Jira key comparison logic
```

**Structure Decision**: Use `shared/` for the comparison utility to ensure consistency if Jira keys are sorted in other parts of the app (like main process exports).

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |