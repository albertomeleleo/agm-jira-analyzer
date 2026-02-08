# Implementation Plan: SLA One-Click Sync

**Branch**: `004-sla-sync-button` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-sla-sync-button/spec.md`

## Summary

Add a one-click "Sync" button to the SLA Dashboard that re-imports issues using the last successfully used JQL query and automatically regenerates the SLA report — reducing the current 4-5 click workflow to a single action. The last JQL is persisted per-project on disk (inside the existing `sla-issues.json` file) and also pre-fills the Import modal on subsequent opens.

## Technical Context

**Language/Version**: TypeScript 5.3 (strict, no `any`)
**Primary Dependencies**: Electron 28, React 18, Vite 5, TailwindCSS 3.4, Lucide React
**Storage**: File system via `electron-store` + JSON files in `<storage-root>/<ProjectName>/`
**Testing**: Vitest 4
**Target Platform**: Desktop (macOS + Windows via Electron)
**Project Type**: Electron three-process app (Main + Preload + Renderer)
**Performance Goals**: Sync operation responsiveness bounded by Jira API latency (typically 2-10s)
**Constraints**: All Jira API calls must go through Main Process via IPC; Renderer never uses `require()` directly
**Scale/Scope**: Single-user desktop app, per-project data isolation

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution is a blank template — no project-specific gates defined. PASS (no violations possible).

## Project Structure

### Documentation (this feature)

```text
specs/004-sla-sync-button/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── ipc-channels.md  # New/modified IPC channels
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── main/
│   ├── index.ts                    # MODIFY — register new IPC handler(s)
│   └── services/
│       └── ProjectService.ts       # MODIFY — add lastJql save/get methods
├── preload/
│   └── index.ts                    # MODIFY — add new IPC channel binding(s)
├── renderer/src/
│   ├── components/
│   │   └── SLADashboard.tsx        # MODIFY — add Sync button + handler
│   └── design-system/
│       └── organisms/
│           └── IssueImportModal.tsx # MODIFY — pre-fill JQL from stored value, save JQL on success
└── shared/
    # No new shared types needed — lastJql is a plain string

tests/
└── sla-parser.test.ts              # EXISTING — verify no regressions
```

**Structure Decision**: This feature touches existing files only. No new files or directories are needed. The last JQL is stored inside the existing `sla-issues.json` file by extending its schema to include a `lastJql` field, keeping all SLA-related data co-located.

## Architecture Decisions

### Decision 1: Where to store the last JQL

**Chosen**: Extend the existing `sla-issues.json` file to include a `lastJql` field alongside the existing `fetchedAt` and `issues` fields.

**Rationale**: The JQL is intimately tied to the SLA issue import — it defines which issues were fetched. Co-locating it with the imported data in the same file is the most natural location. No new files, no new IPC channels for storage.

**Alternatives rejected**:
- Separate `last-jql.json` file: Unnecessary file proliferation for a single string value.
- `config.json` (ProjectConfig): The JQL is ephemeral/operational data, not project configuration. Adding it to config would require updating the ProjectConfig type and all its consumers.
- localStorage: Would not persist across app reinstalls and is renderer-side only.

### Decision 2: New IPC channel vs. reuse existing

**Chosen**: Add 2 new IPC channels — `get-last-jql` to retrieve the stored JQL, and `save-last-jql` to save it. The existing `jira-import-issues` channel remains unchanged.

**Rationale**: Separating JQL persistence from the import operation keeps responsibilities clean. The Sync button in the Renderer needs to know the last JQL to determine button availability (FR-006) before any import happens. The save is called after a successful import to update the stored value.

**Alternatives rejected**:
- Modifying `jira-import-issues` to auto-save JQL: This would couple the import channel with persistence, making it harder to test and violating the single-responsibility pattern of existing IPC handlers.
- Returning lastJql from `get-sla-issues`: Would couple unrelated concerns and add the JQL to return types that don't need it.

### Decision 3: Sync button orchestration

**Chosen**: The Sync handler in `SLADashboard.tsx` orchestrates the two-step process (import → generate) using sequential `await` calls to existing IPC channels, reusing `jiraImportIssues` and `generateSLAReport`.

**Rationale**: No new backend orchestration needed. The Renderer already has both IPC calls available. Sequential awaits with try/catch at each step enable precise error reporting per the spec (FR-009, FR-010).

**Alternatives rejected**:
- Single combined IPC channel `sync-sla`: Would require duplicating existing import+generate logic in a new handler. Over-engineering for a sequential two-step process.

### Decision 4: Sync button UX placement

**Chosen**: Place the Sync button in the existing button group (header area), alongside "Import Issues" and "Generate Report". Use a distinct icon (e.g., `RefreshCw` or `RotateCw`) and label "Sync".

**Rationale**: Follows the existing layout pattern. The Sync button is logically related to the existing action buttons. Keeping it in the same location avoids confusion.

## Complexity Tracking

No constitution violations to justify.
