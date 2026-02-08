# Feature Specification: SLA Dashboard Advanced Filters

**Feature Branch**: `002-sla-dashboard-filters`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "La SLA Dashboard deve avere dei filtri usabili, separati per tipologia di filtro, i filtri devono rimanere memorizzati dopo l'utilizzo, anche se si cambia pagina, deve essere possibile salvare dei filtri rapidi, che sono la combinazione di filtri che l'utente vuole utilizzare per poter accedere in maniera più rapida alle informazioni richieste. I filtri devono essere salvabili con nomi specifici decisi dall'utente"

## Clarifications

### Session 2026-02-07

- Q: Should the new Issue List page share the same filter state and presets with the SLA Dashboard, or should each page have its own independent filters? → A: Shared presets, independent active filters — presets are shared but each page tracks its own current filter selections.
- Q: What SLA calculations should the Issue List page display beyond the existing per-issue table columns? → A: Same columns as current SLATable — per-issue reaction time, resolution time, SLA met/missed badges. No additional columns or summary rows needed.
- Q: Where should the Issue List menu entry be placed in the sidebar, and what should it be labeled? → A: "Issue List" label, placed right after Dashboard, with a Table Lucide icon.
- Q: Should the Issue List page have its own "Import Issues" and "Generate Report" buttons, or depend on the Dashboard? → A: No duplicate buttons. Issue List shows an empty state message directing user to generate a report from the Dashboard if no data exists.
- Q: Should the Issue List page's independent filter state also persist to localStorage (surviving restarts)? → A: Yes, persist independently with a page-scoped localStorage key (e.g., `sla_filters_issues_${projectName}`).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Filter SLA Issues by Category (Priority: P1)

As a PM or Tech Lead, I want to filter SLA issues using clearly separated filter groups (by issue type, priority, status, and date range), so I can quickly narrow down the data to the subset I need to analyze.

**Why this priority**: Filtering is the core interaction on the SLA Dashboard. Without usable, well-organized filters, all other features (presets, persistence) have no foundation.

**Independent Test**: Can be fully tested by opening the SLA Dashboard, applying filters from each category, and verifying that the issues table and charts update to show only matching issues.

**Acceptance Scenarios**:

1. **Given** the SLA Dashboard is loaded with issues, **When** the user selects one or more issue types from the Issue Type filter group, **Then** only issues of those types are displayed in the table and charts.
2. **Given** multiple filter categories have active selections, **When** the user views results, **Then** the system applies AND logic between categories and OR logic within each category.
3. **Given** filters are applied, **When** the user views the dashboard, **Then** a visible indicator shows how many issues match out of the total (e.g., "Showing 24 of 150 issues").
4. **Given** the user has applied filters, **When** the user clicks a "Reset Filters" action, **Then** all filters return to their default (unfiltered) state.

---

### User Story 2 - Filter Persistence Across Navigation (Priority: P1)

As a PM, I want my active filter selections to be remembered when I navigate away from the SLA Dashboard and return, so I don't have to reapply filters every time I switch pages.

**Why this priority**: This is equally critical to the filtering itself. Losing filter state on navigation is a major usability pain point that directly impacts daily workflow efficiency.

**Independent Test**: Can be tested by applying filters on the SLA Dashboard, navigating to a different page (e.g., Settings, Release Detail), returning to the SLA Dashboard, and verifying that the same filters are still active.

**Acceptance Scenarios**:

1. **Given** the user has applied filters on the SLA Dashboard, **When** the user navigates to the Settings page and then returns to the SLA Dashboard, **Then** all previously applied filters are still active and the data is filtered accordingly.
2. **Given** the user switches between projects, **When** the user returns to a previously viewed project's SLA Dashboard, **Then** the filters for that specific project are restored independently.
3. **Given** the user closes and reopens the application, **When** the SLA Dashboard loads, **Then** the last-used filters for the active project are restored.

---

### User Story 3 - Save Named Filter Presets (Priority: P2)

As a PM or Tech Lead, I want to save a combination of filter settings as a named preset (Quick Filter), so I can instantly recall frequently used filter configurations without manually reapplying each filter.

**Why this priority**: Presets build on top of the filtering and persistence foundation. They add significant productivity value for power users who repeatedly analyze the same data slices, but the dashboard is still fully usable without them.

**Independent Test**: Can be tested by applying a combination of filters, saving them as a named preset, resetting filters, then selecting the saved preset and verifying all filters are restored to the saved configuration.

**Acceptance Scenarios**:

1. **Given** the user has applied a combination of filters, **When** the user clicks "Save Filter" and enters a custom name (e.g., "Critical Bugs This Month"), **Then** the current filter configuration is saved as a named preset.
2. **Given** one or more presets exist, **When** the user views the filter area, **Then** the saved presets are displayed as selectable options (e.g., clickable chips) in the filter area.
3. **Given** the user selects a saved preset, **When** the preset is applied, **Then** all filter categories are updated to match the saved configuration and the data refreshes accordingly.
4. **Given** the user wants to remove a preset, **When** the user deletes a saved preset, **Then** the preset is removed from the list and the current active filters are not affected.

---

### User Story 4 - Rename and Manage Filter Presets (Priority: P3)

As a PM, I want to rename or update existing filter presets, so I can keep my presets organized and relevant as my analysis needs evolve.

**Why this priority**: Management operations (rename, update) are secondary to the core save/load workflow. Users can work around this by deleting and re-creating presets.

**Independent Test**: Can be tested by creating a preset, renaming it, verifying the new name appears, then updating it with different filters and verifying the updated configuration loads correctly.

**Acceptance Scenarios**:

1. **Given** a saved preset exists, **When** the user chooses to rename it and enters a new name, **Then** the preset is displayed with the updated name.
2. **Given** the user has modified filters after loading a preset, **When** the user chooses to update the preset, **Then** the preset is overwritten with the current filter configuration.
3. **Given** the user attempts to save a preset with a name that already exists, **When** the save action is triggered, **Then** the system asks for confirmation before overwriting the existing preset.

---

### User Story 5 - Dedicated Issue List Page (Priority: P1)

As a PM or Tech Lead, I want a separate menu entry that shows only the SLA issue list with filters and SLA calculations (no charts or stat cards), so I can focus on individual issue details and SLA compliance without dashboard statistics noise.

**Why this priority**: This is a core navigation feature requested alongside the dashboard. It provides a focused view for issue-level SLA analysis.

**Independent Test**: Can be tested by clicking the new menu entry, verifying the issue list displays with filters, applying filters and verifying the list updates, and confirming presets from the SLA Dashboard are available here.

**Acceptance Scenarios**:

1. **Given** the application is running, **When** the user clicks the Issue List menu entry in the sidebar, **Then** the application navigates to a page showing only the SLA issue table (same columns as the dashboard: key, type, priority, created, resolved, reaction time, resolution time, SLA met/missed) with filter controls.
2. **Given** the Issue List page is loaded, **When** the user applies filters, **Then** only matching issues are shown in the table and the filtered count indicator updates.
3. **Given** presets were saved from the SLA Dashboard, **When** the user views the Issue List page, **Then** the same presets are available for loading.
4. **Given** the user applies filters on the Issue List page, **When** the user navigates to the SLA Dashboard, **Then** the SLA Dashboard retains its own independent filter state (not overwritten by Issue List filters).
5. **Given** no SLA report has been generated yet, **When** the user opens the Issue List page, **Then** an empty state message is displayed directing the user to generate a report from the SLA Dashboard.

---

### Edge Cases

- What happens when the user saves a preset with an empty name? The system prevents saving and displays a validation message requiring a non-empty name.
- What happens when the user tries to save more than the maximum allowed presets (20 per project)? The system informs the user and suggests deleting unused presets before saving a new one.
- What happens when a preset references filter values that no longer exist in the data (e.g., an issue type removed from Jira)? The preset loads successfully; non-matching filter values are silently ignored without error.
- What happens when the storage mechanism is cleared or unavailable? The system falls back to default (unfiltered) state without errors; presets are lost gracefully with no crash.
- What happens when two presets have the same name? The system enforces unique preset names per project, showing a validation message if a duplicate name is entered.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display filters organized in visually separated groups by category: Issue Type, Priority, Status, and Date/Period.
- **FR-002**: System MUST allow multi-selection within each filter category using toggle-style controls (e.g., chips or toggle buttons).
- **FR-003**: System MUST apply AND logic between filter categories and OR logic within each category.
- **FR-004**: System MUST persist active filter state per project, surviving page navigation within the application.
- **FR-005**: System MUST persist active filter state per project across application restarts.
- **FR-006**: System MUST provide a "Reset Filters" action that clears all active filters to default state.
- **FR-007**: System MUST allow users to save the current filter combination as a named preset with a user-defined name.
- **FR-008**: System MUST enforce unique preset names within each project; duplicate names are rejected with a validation message.
- **FR-009**: System MUST display saved presets as quickly accessible elements (e.g., clickable chips) in the filter area.
- **FR-010**: System MUST allow users to load a saved preset, replacing all current filters with the preset's saved configuration.
- **FR-011**: System MUST allow users to delete a saved preset without affecting current active filters.
- **FR-012**: System MUST allow users to rename an existing preset.
- **FR-013**: System MUST allow users to update (overwrite) an existing preset with the current filter configuration, with confirmation prompt.
- **FR-014**: System MUST limit presets to a maximum of 20 per project.
- **FR-015**: System MUST display a count indicator showing filtered vs total issues (e.g., "Showing 24 of 150 issues").
- **FR-016**: System MUST provide a separate "Issue List" page accessible via a dedicated sidebar menu entry (labeled "Issue List" with a Table Lucide icon, placed immediately after the Dashboard entry), displaying only the SLA issue table with filters and SLA calculations (no charts or stat cards).
- **FR-017**: The Issue List page and SLA Dashboard MUST share filter presets but maintain independent active filter states. Changing filters on one page MUST NOT affect the other.
- **FR-018**: The Issue List page MUST persist its own active filter state independently from the SLA Dashboard, surviving navigation and app restarts.
- **FR-019**: The Issue List page MUST NOT duplicate "Import Issues" or "Generate Report" actions. When no SLA data exists, it MUST display an empty state directing the user to the SLA Dashboard.

### Key Entities

- **FilterState**: Represents the current active filter configuration. Contains selected values for each filter category (issue types, priorities, statuses) and date filtering mode with associated date values.
- **FilterPreset**: A named, saved combination of filter settings. Contains a unique identifier, a user-defined name, a creation timestamp, and a complete FilterState snapshot. Belongs to a specific project.
- **FilterPresetCollection**: The set of all saved presets for a given project. Enforces unique names and a maximum count of 20. Persisted alongside project data.

## Assumptions

- The existing four filter categories (Issue Type, Priority, Status, Date/Period) are sufficient; no new filter categories are introduced in this feature.
- Presets are local to each project and are not shared across projects.
- Presets are stored locally on the user's machine; no cloud sync or multi-device sharing is required.
- The existing filter UI pattern (toggle chips for multi-select, dropdowns/inputs for dates) is maintained and extended, not replaced.
- Preset names have a maximum length of 50 characters.
- Active filter state is persisted per page per project using page-scoped localStorage keys (e.g., `sla_filters_${projectName}` for Dashboard, `sla_filters_issues_${projectName}` for Issue List).
- The Issue List page reuses the existing `SLATable` component and does not introduce new table columns or summary rows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can apply any combination of filters across all four categories and see results update within 500ms.
- **SC-002**: Users can navigate away from the SLA Dashboard and return with their filters preserved 100% of the time.
- **SC-003**: Users can save a named filter preset in 3 interactions or fewer (apply filters, click save, enter name).
- **SC-004**: Users can recall a saved preset and see the dashboard update in a single click.
- **SC-005**: Users can manage up to 20 presets per project without performance degradation.
- **SC-006**: Filter state survives application restart without data loss.
- **SC-007**: Users can access the Issue List page from the sidebar in a single click and see the filtered issue table with the same presets available as on the Dashboard.
- **SC-008**: Filters applied on the Issue List page do not affect the SLA Dashboard's active filters, and vice versa.
