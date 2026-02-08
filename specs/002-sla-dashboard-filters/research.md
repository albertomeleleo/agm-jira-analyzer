# Research: SLA Dashboard Advanced Filters

**Feature**: 002-sla-dashboard-filters
**Date**: 2026-02-07 (updated 2026-02-08)

## Decision 1: Filter State Management — Context vs Local State

**Decision**: Lift filter state from SLADashboard local `useState` into a dedicated `FilterContext` provider.

**Rationale**: The current implementation stores filter state in SLADashboard's local state with localStorage persistence. This works for app restart scenarios but does NOT survive in-app navigation (the component unmounts when switching pages, losing React state; localStorage restore only happens on mount). A React Context wrapping `MainLayout` keeps the state in memory across page switches while still syncing to localStorage for restart persistence.

**Alternatives considered**:
- **Keep local state + localStorage only**: Current approach. Filters restore on mount but with a brief flash of unfiltered data. Does not cleanly preserve state during navigation without re-reading localStorage on every mount.
- **Global state library (Zustand/Redux)**: Overkill for a single-user Electron app with one piece of shared state. Adds a dependency.
- **React Context (chosen)**: Zero new dependencies. Fits the existing pattern (ProjectContext, ThemeContext). Provides immediate state access without serialization on every navigation.

## Decision 2: Preset Storage Location — localStorage vs Project Files

**Decision**: Store presets in the project directory as `filter-presets.json` via ProjectService, accessed through IPC.

**Rationale**: Presets are project-scoped data that should travel with the project directory (e.g., if copied to another machine). Using the existing ProjectService file I/O pattern keeps presets alongside other project data (`config.json`, `sla-cache.json`). This also avoids localStorage size limits and keeps preset data backed by the filesystem.

**Alternatives considered**:
- **localStorage**: Simple but data is browser-scoped, doesn't travel with the project, subject to clearing, and mixes concerns (session state vs user data).
- **electron-store**: Global to the app, not project-scoped. Would require namespacing logic.
- **Project directory JSON file (chosen)**: Consistent with existing pattern (`config.json`, `sla-cache.json`). Data is per-project. Survives localStorage clearing. Backed by filesystem.

## Decision 3: FilterPreset Identity — UUID vs Name-based

**Decision**: Use a generated UUID (`crypto.randomUUID()`) as the preset identifier, with name as a separate display field.

**Rationale**: Name-based identity creates problems when renaming (all references break). UUID provides stable identity. Name uniqueness is enforced as a business rule but not as an identity constraint.

**Alternatives considered**:
- **Name as ID**: Simple but renaming requires updating all references. Fragile.
- **Auto-increment integer**: Requires tracking a counter. No advantage over UUID for a small collection.
- **UUID (chosen)**: Stable, no collision risk, standard approach. `crypto.randomUUID()` is available in modern Node.js and browsers.

## Decision 4: Active Filter Persistence — localStorage vs electron-store

**Decision**: Keep localStorage for active filter state persistence (current behavior), enhanced by FilterContext for in-session navigation.

**Rationale**: Active filter state is session-level data (what filters are currently applied). It changes frequently and needs fast read/write. localStorage is synchronous and already implemented. The FilterContext handles in-memory navigation persistence; localStorage handles restart persistence. No IPC round-trip needed for filter state changes.

**Alternatives considered**:
- **electron-store via IPC**: Adds IPC overhead for every filter change. Unnecessary for session state.
- **Project file via IPC**: Same overhead issue. Presets (saved configurations) go to files; active state stays in localStorage.
- **localStorage (chosen, status quo)**: Fast, synchronous, already working. Enhanced by Context for navigation.

## Decision 5: Preset UI Pattern — Dropdown vs Chips vs Sidebar

**Decision**: Display presets as horizontal scrollable chips above the filter groups, with a save button and a management popover.

**Rationale**: Chips match the existing filter toggle UI pattern. Horizontal layout keeps the preset bar compact. A "Save" button with name input appears inline (or as a small modal). Management actions (rename, delete, update) are available via right-click context menu or a small popover on each chip.

**Alternatives considered**:
- **Dropdown select**: Hides presets behind a click. Less discoverable.
- **Sidebar section**: Takes too much space. Presets are secondary to filters.
- **Chips bar (chosen)**: Consistent with toggle chip pattern. Immediately visible. One-click activation. Compact.

## Decision 6: Page-Scoped Filter State Architecture (US5)

**Decision**: Refactor FilterContext to manage a `Record<string, SLAFilterState>` internally, keyed by page identifier. Expose a `usePageFilter(pageId: string)` hook that returns filter state and actions scoped to that page. Presets remain shared across pages.

**Rationale**: Both the SLA Dashboard and the new Issue List page need independent filter states (FR-017) but shared presets. A single FilterContext managing per-page state is the cleanest approach — no duplicate providers, no separate contexts for presets vs filters.

**Alternatives considered**:
- **Separate FilterProviders per page**: Would require duplicating preset state management or introducing a separate PresetContext. More complex, more code, harder to keep presets in sync.
- **Single shared filter state**: Violates FR-017 (independent active filter states per page). Rejected per spec.
- **Local useState per page**: Would lose context-level persistence. Each page would independently manage localStorage, duplicating logic. Breaks the established pattern.
- **Page-scoped Record in context (chosen)**: Minimal change from current single-state context. Each page gets its own filter state via `pageId` key. Presets remain a single shared array. localStorage keys are page-scoped (e.g., `sla_filters_dashboard_${projectName}`).

## Decision 7: Issue List Page Component Design (US5)

**Decision**: Create `IssueListPage.tsx` as a new page component that reuses existing `SLATable`, `SLAFilters`, and `FilterPresetBar` components. It loads the SLA report from cache, applies its own page-scoped filters, and renders only the table with filters. No stat cards, charts, or import/generate buttons.

**Rationale**: Maximum component reuse. The page is essentially a stripped-down SLADashboard. The `applyFilters` function should be extracted to shared utilities to avoid duplication.

**Alternatives considered**:
- **Parameterized SLADashboard with a "mode" prop**: Adds conditional rendering complexity to an already large component.
- **Embed as a tab within SLADashboard**: Rejected by spec — must be a separate menu entry (FR-016).

## Decision 8: Shared Utility Extraction — applyFilters (US5)

**Decision**: Extract the `applyFilters` function from `SLADashboard.tsx` into `src/shared/filter-utils.ts` so both `SLADashboard` and `IssueListPage` can import it without duplication.

**Rationale**: Both pages need the exact same filter application logic. Duplicating 30 lines with date parsing creates maintenance risk.

**Alternatives considered**:
- **Keep in SLADashboard, import from there**: Creates a cross-page-component import which violates conventions.
- **Duplicate in IssueListPage**: Violates DRY and risks divergence.
- **Shared utility file (chosen)**: Clean, follows the existing `src/shared/` pattern.

## Decision 9: localStorage Key Migration (US5)

**Decision**: On FilterContext mount, check if the old key `sla_filters_${projectName}` exists. If so, copy its value to `sla_filters_dashboard_${projectName}` and delete the old key. One-time migration.

**Rationale**: Users upgrading from the previous implementation have filters stored under the old key. Without migration, they lose persisted dashboard filters.

**Alternatives considered**:
- **No migration**: Users lose filters on upgrade. Poor UX.
- **Support both keys forever**: Adds complexity for a one-time scenario.
