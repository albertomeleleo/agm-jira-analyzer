# Implementation Plan: Issue Status Tags

**Branch**: `009-issue-status-tag` | **Date**: 2026-02-08 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-issue-status-tag/spec.md`

## Summary

This feature enhances the `SLATable` by adding a "Status" column that displays Jira issue statuses as color-coded tags (Badges). We will implement a shared utility `getStatusVariant` to categorize statuses into semantic UI themes (Success, Danger, Warning, Info). This improves the scannability of work items in the Issue List.

## Technical Context

**Language/Version**: TypeScript 5.3  
**Primary Dependencies**: React 18, Electron 28, TailwindCSS 3.4  
**Storage**: N/A (UI-only change using existing `SLAIssue` data)  
**Testing**: Vitest 4.0  
**Target Platform**: Mac/Windows/Linux (Electron Desktop)
**Project Type**: Single project (Electron)  
**Performance Goals**: Zero impact on table rendering performance for up to 1,000 issues.  
**Constraints**: The column must not be sortable (per user preference).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Library-First**: N/A (Internal UI feature)
- **CLI Interface**: N/A (GUI-focused)
- **Test-First (NON-NEGOTIABLE)**: PASS. The mapping utility will be unit-tested before integration.
- **Integration Testing**: PASS. Focus on `SLATable` rendering correct Badge variants.

## Project Structure

### Documentation (this feature)

```text
specs/009-issue-status-tag/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── status-mapping.md
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
    └── status-utils.ts      # New: Status mapping logic
```

**Structure Decision**: Single project structure. Use `shared/` for the status mapping utility to ensure it can be reused in both the main process (if needed for exports) and the renderer.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |