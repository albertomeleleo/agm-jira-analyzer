# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Release Analyzer (AGMS)** — an Electron desktop app for PMs and Tech Leads to analyze Jira release data, track SLA compliance, and visualize release compositions. Specs are in `RECREATION_GUIDE.md` and `IMPLEMENTATION_TASKS.md`.

## Tech Stack

- **Electron 28** (Main + Renderer + Preload architecture)
- **React 18 + TypeScript 5.3** (strict, no `any`)
- **Vite 5** via `electron-vite` for build/dev
- **TailwindCSS 3.4** for styling (dark mode via `class` strategy)
- **Recharts 3** for data visualization
- **Lucide React** for icons
- **date-fns 4** for date utilities
- **electron-store 6** for settings persistence
- **pdf-parse** for PDF processing
- **Vitest 4** for testing
- **electron-builder** for packaging (Windows NSIS + Mac DMG)

## Common Commands

```bash
npm run dev              # Start dev server with hot-reload
npm run build            # TypeCheck + Build (outputs to /out)
npm run build:win        # Build Windows installer
npm run build:mac        # Build Mac installer
npm run build:all        # Build all platforms
npm run lint             # ESLint with --fix
npm run format           # Prettier formatting
npm run typecheck        # Full TS validation (all configs)
npm run typecheck:node   # TS check main process only
npm run typecheck:web    # TS check renderer only
npm run test             # Run Vitest tests
npm start                # Run built app (electron-vite preview)
```

## Architecture

### Three-Process Model
```
Main Process (Node.js)  <-->  Preload (Context Bridge)  <-->  Renderer (React)
src/main/                     src/preload/                     src/renderer/src/
```

- **Main Process** (`src/main/`): IPC handlers, file system operations, Jira API calls, SLA calculations. All infrastructure logic lives here.
- **Preload** (`src/preload/`): Exposes `window.api` object via contextBridge. Declares 23 IPC channels. The Renderer never uses `require()` directly.
- **Renderer** (`src/renderer/src/`): React UI. Communicates with Main exclusively via IPC.

### Shared Types
`src/shared/` contains TypeScript interfaces used by both Main and Renderer:
- `jira-types.ts` — JiraConfig, JiraIssue, JiraProject, JiraVersion, JiraSearchResult, JiraChangelog, JiraHistoryItem, JiraStatusChange
- `sla-types.ts` — SLAIssue, SLAReport, SLASummary, SLAPrioritySummary, SLATarget, SLATier, SLASegment
- `project-types.ts` — Project, ProjectConfig, SLAGroup, AppSettings, DEFAULT_SLA_GROUPS

### Path Aliases
Configured in `electron.vite.config.ts` and `tsconfig.web.json`:
- `@renderer` -> `src/renderer/src`
- `@design-system` -> `src/renderer/src/design-system/index.ts`

### Frontend — Atomic Design
Components follow Atomic Design in `src/renderer/src/design-system/`:
- **Atoms** (6): Button, Input, Typography (H1/H2/H3/Text/Label), Badge, Card, ThemeToggle
- **Molecules** (5): Modal, SearchField, FormGroup, StatCard, SLAFilters
- **Organisms** (6): Sidebar, SLATable, SLACharts, IssueImportModal, ReleaseFetchModal, ReleaseCharts

Feature pages live in `src/renderer/src/components/`:
- `MainLayout.tsx` — Main layout wrapper (Sidebar + content area)
- `SLADashboard.tsx` — Primary page for SLA analysis with KPIs, filters, table, charts
- `ReleaseDetail.tsx` — Release version analysis with composition charts
- `SettingsPage.tsx` — Project settings editor (Jira creds, SLA groups, logo)
- `HelpPage.tsx` — Help/documentation page
- `Onboarding/` — 3-step wizard: StorageStep -> JiraStep -> ProjectStep

### React Contexts (`src/renderer/src/contexts/`)
- **ProjectContext** (`useProject()`) — project list, active project, refresh, loading state
- **ThemeContext** (`useTheme()`) — light/dark toggle, persisted to settings

### Main Process Services (`src/main/services/`)
- **JiraService**: REST API v3 wrapper with Basic Auth, pagination (maxResults: 50), JQL search
- **StorageService**: File I/O via electron-store for app settings (theme, storage root, last project)
- **ProjectService**: Project CRUD, logo management, release data, SLA cache

### IPC Channels (23 total, in `src/preload/index.ts`)
| Group | Channels |
|---|---|
| Settings (4) | get-settings, update-settings, select-directory, set-storage-root |
| Projects (6) | get-projects, get-project, create-project, update-project-config, set-project-logo, get-project-logo |
| Jira (4) | jira-test-connection, jira-get-projects, jira-get-versions, jira-search-issues |
| SLA (4) | jira-import-issues, get-sla-issues, get-sla-cache, generate-sla-report |
| Releases (3) | jira-fetch-release, get-releases, delete-release |
| Storage (2) | read-json-file, write-json-file |

All `ipcMain.handle()` calls are centralized in `src/main/index.ts`, delegating to services.

## SLA Business Logic

Core engine is in `src/main/sla-parser.ts`. Key functions: `generateSLAReport()`, `parseSLAForIssue()`, `getBusinessMinutesBetween()`.

**Key rules:**
- **Business Hours**: 09:00-18:00, Mon-Fri, excludes Italian national holidays + Easter Monday
- **Reaction Time**: Creation -> first transition out of Open/New. Tasks have no reaction SLA.
- **Resolution Time (Net)**: First work status -> Done/Released, minus time in pause statuses (`Waiting for support`, `In pausa`, `Sospeso`, `Pausa`, `Dipendenza Adesso.it`, `Dipendenza GNV`)
- **24x7 Rule**: Highest/Critical priority issues created after 2026-02-01 bypass business hours
- **Task exception**: Resolution starts from creation date (not from work status transition)

**SLA Targets:**
| Priority | Tier | Resolution | Reaction |
|---|---|---|---|
| Highest/Critical | Expedite | 4h | 15min |
| High | Critical | 8h | 15min |
| Medium | Major | 16h | 15min |
| Low | Minor | 32h | 15min |
| Lowest | Trivial | 40h | 15min |

## Tests

Tests are in `tests/` using Vitest. Currently covers:
- `sla-parser.test.ts` — business hour calculations, mock issue helpers

Run with: `npm run test`

## Project Data Structure (on disk)
```
<storage-root>/
└── <ProjectName>/
    ├── config.json
    ├── logo.png
    ├── release-data.json
    ├── sla-cache.json
    └── *.pdf
```

## Documentation
- `RECREATION_GUIDE.md` — Full specs for rebuilding from scratch
- `IMPLEMENTATION_TASKS.md` — 7-phase granular task list
- `docs/current_state.md` — Italian-language codebase analysis snapshot

## Styling
- TailwindCSS with custom brand colors defined in `tailwind.config.js`
- Glassmorphism utilities: `.glass`, `.glass-hover`, `.neon-glow`, `.neon-border`
- Custom CSS variables for brand colors (RGB) in `src/renderer/src/index.css`
- Brand colors: `brand-deep` (#0a0a0f), `brand-card` (#16161f), `brand-cyan` (#00f2ff), `brand-blue`, `brand-purple`, `brand-text-sec`, `brand-text-pri`
- Dark/light mode via `class` on `<html>` element, toggled by ThemeContext

## Coding Conventions

- **Composition over inheritance** — functional components + contexts (no custom hooks yet)
- **No `any` types** — strict TypeScript everywhere
- **Service isolation** — infrastructure logic (Jira API, filesystem) stays in Main Process services only
- **IPC delegation** — `main/index.ts` handlers delegate to services, never contain business logic inline
- **Singleton services** — JiraService, StorageService, ProjectService follow singleton-like pattern
- **Theme** via React Context (`ThemeContext`) + TailwindCSS `darkMode: 'class'`

## Active Technologies
- TypeScript 5.3, React 18, Node.js (Electron 28 Main Process) + React 18, TailwindCSS 3.4, Lucide React (icons), electron-store 6 (002-sla-dashboard-filters)
- localStorage (filter state), project JSON files on disk (presets via ProjectService) (002-sla-dashboard-filters)
- TypeScript 5.3 (strict, no `any`) + React 18, Electron 28, TailwindCSS 3.4, Lucide React, date-fns 4 (002-sla-dashboard-filters)
- localStorage (active filter state per page), JSON files via ProjectService (presets) (002-sla-dashboard-filters)

## Recent Changes
- 002-sla-dashboard-filters: Added TypeScript 5.3, React 18, Node.js (Electron 28 Main Process) + React 18, TailwindCSS 3.4, Lucide React (icons), electron-store 6
