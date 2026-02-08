# Implementation Plan: Dashboard Auto-Refresh

**Branch**: `006-dashboard-auto-refresh` | **Date**: 2026-02-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/006-dashboard-auto-refresh/spec.md`

## Summary

This feature will introduce an automatic refresh mechanism for the SLA Dashboard. The dashboard will update its issues and charts at a globally configurable interval, using the last saved JQL query for the active project. This provides users with up-to-date information without manual intervention. The core of the work involves creating a timer that triggers the existing data sync process, adding a settings UI for interval configuration, and ensuring the JQL query remains stable.

## Technical Context

**Language/Version**: TypeScript (as per `tsconfig.json`)
**Primary Dependencies**: React, Electron, Vite, TailwindCSS
**Storage**: Local file system via `StorageService` (for settings)
**Testing**: Vitest
**Target Platform**: Electron Application (macOS, Windows, Linux)
**Project Type**: Web Application (React frontend in an Electron container)
**Performance Goals**: The dashboard UI must remain responsive (>30 fps) during background refresh operations. A refresh cycle should not block user interactions with filters or charts.
**Constraints**: The auto-refresh interval should be managed by a single, clear timer to avoid race conditions. If a sync process takes longer than the interval, the next cycle must be skipped.
**Scale/Scope**: The feature adds a background process and a new setting to the existing SLA Dashboard. The impact is localized to the renderer process and global settings management.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Clarity**: Is the feature's purpose clear and well-documented? (Yes, in `spec.md`)
- **Simplicity**: Does the implementation avoid unnecessary complexity? (NEEDS CLARIFICATION: How to manage the timer lifecycle cleanly across React components and app states.)
- **Testability**: Is the logic independently testable? (NEEDS CLARIFICATION: How to test a time-based feature like auto-refresh effectively with Vitest.)

## Project Structure

### Documentation (this feature)

```text
specs/006-dashboard-auto-refresh/
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
│       └── StorageService.ts   # For saving the global refresh interval
├── renderer/
│   └── src/
│       ├── components/
│       │   ├── SettingsPage.tsx      # Add interval configuration UI
│       │   └── SLADashboard.tsx      # Implement refresh logic
│       ├── contexts/               # NEEDS CLARIFICATION: Should a new context be created for managing refresh state?
│       └── hooks/                  # NEEDS CLARIFICATION: Is a custom hook the right pattern for the timer?
└── shared/
    └── project-types.ts        # Add refresh interval to AppSettings
```

**Structure Decision**: The implementation will follow the existing project structure. New logic will be integrated into the `SLADashboard.tsx` component, settings will be added to `SettingsPage.tsx`, and shared types will be updated. The primary areas of investigation are the state management and timer implementation patterns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| -         | -          | -                                   |
