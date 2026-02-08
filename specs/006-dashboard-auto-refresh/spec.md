# Feature Specification: Dashboard Auto-Refresh

**Feature Branch**: `006-dashboard-auto-refresh`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "voglio che la dashboard venga riaggiornata in termini di issue e grafici ogni x minuti, gli x minuti devono essere configurati a livello globale, la sincronizzazione deve basarsi sempre sull'ultima jql utilizzata, e non deve cambiare fino a che non viene cambiata la jql"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Automatic Periodic Dashboard Refresh (Priority: P1)

As a PM or Tech Lead monitoring SLA compliance, I want the SLA Dashboard to automatically refresh its issues and charts at a configurable interval so that I can see up-to-date data without manually clicking Sync.

The dashboard should silently re-sync in the background using the last JQL query that was used for importing issues. This JQL stays fixed until the user explicitly changes it via the Import Issues modal.

**Why this priority**: This is the core value of the feature — keeping the dashboard current without user intervention.

**Independent Test**: Open SLA Dashboard on a project with a saved JQL, wait for the configured interval to elapse, and verify that the issue list and charts update automatically.

**Acceptance Scenarios**:

1. **Given** the dashboard is open and a JQL query has been saved, **When** the configured interval elapses, **Then** the dashboard re-fetches issues from Jira and refreshes charts automatically.
2. **Given** the dashboard is open, **When** a refresh cycle completes successfully, **Then** a subtle visual indicator confirms the last refresh time.
3. **Given** the dashboard is open, **When** a refresh cycle is in progress, **Then** the user can still interact with filters and charts without interruption.
4. **Given** no JQL query has been saved for the active project, **When** the interval elapses, **Then** no automatic refresh occurs (nothing to sync against).

---

### User Story 2 - Global Refresh Interval Configuration (Priority: P1)

As a user, I want to configure the auto-refresh interval (in minutes) from the global application settings so that I can control how frequently the dashboard fetches new data.

**Why this priority**: Without configuration, users cannot adapt the refresh frequency to their workflow (e.g., busy periods may need faster refresh, or they may want to disable it entirely).

**Independent Test**: Open Settings, change the refresh interval, return to the dashboard, and verify that the new interval takes effect.

**Acceptance Scenarios**:

1. **Given** I am on the Settings page, **When** I set the refresh interval to a specific number of minutes, **Then** the value is saved globally and applied to all projects.
2. **Given** I set the interval to 0 (or "Disabled"), **When** I return to the dashboard, **Then** no automatic refresh occurs.
3. **Given** a refresh interval is set, **When** I switch between projects, **Then** the same interval applies to every project's dashboard.
4. **Given** I change the interval while the dashboard is open, **When** the new value is saved, **Then** the refresh timer resets using the new interval immediately.

---

### User Story 3 - JQL Stability (Priority: P2)

As a user, I want the auto-refresh to always use the last JQL query I explicitly set, not change it automatically, so that my data scope remains predictable and consistent.

**Why this priority**: The user described this as a key constraint. The JQL must be "sticky" — it never changes unless the user explicitly updates it via the Import Issues modal.

**Independent Test**: Set a JQL, trigger multiple auto-refreshes, and verify that each refresh uses the same JQL. Then change the JQL via the modal and verify the new one is used going forward.

**Acceptance Scenarios**:

1. **Given** a JQL query has been saved, **When** an auto-refresh runs, **Then** it uses that exact same JQL query.
2. **Given** multiple auto-refreshes have occurred, **When** the user opens the Import Issues modal and saves a new JQL, **Then** all subsequent refreshes use the new JQL.
3. **Given** the user changes the JQL, **When** the change is saved, **Then** a manual refresh or the next auto-refresh cycle uses the new JQL immediately.

---

### Edge Cases

- What happens if Jira is unreachable during an auto-refresh? The refresh silently fails and retries at the next interval; a non-intrusive error indicator is shown.
- What happens if the user is actively editing filters when a refresh completes? Applied filters persist across refreshes — the refresh updates the underlying data, not the filter state.
- What happens if the app is minimized or in the background? Auto-refresh continues on the configured interval regardless of window focus.
- What happens if the refresh interval is very short (e.g., 1 minute) and a Jira sync takes longer? The next cycle is skipped until the current one completes.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST automatically refresh SLA issues and charts at the configured global interval.
- **FR-002**: The auto-refresh MUST use the last saved JQL query for the active project.
- **FR-003**: The JQL query used for auto-refresh MUST NOT change unless the user explicitly saves a new one via the Import Issues modal.
- **FR-004**: Users MUST be able to configure the refresh interval (in minutes) in the global application settings.
- **FR-005**: Setting the interval to 0 MUST disable auto-refresh entirely.
- **FR-006**: The refresh interval MUST apply globally across all projects.
- **FR-007**: The dashboard MUST remain interactive (filterable, scrollable) during a background refresh.
- **FR-008**: If no JQL is saved for a project, auto-refresh MUST NOT trigger for that project.
- **FR-009**: If a refresh fails, the system MUST display a non-intrusive error indicator and retry at the next interval.
- **FR-010**: Changing the refresh interval while the dashboard is open MUST reset the timer immediately.

### Key Entities

- **Refresh Interval**: Global setting (integer, minutes, 0 = disabled). Minimum: 0, reasonable default: 5 minutes.
- **Last JQL**: Per-project stored query used for refresh. Set only via Import Issues modal.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The dashboard refreshes automatically within ±5 seconds of the configured interval elapsing.
- **SC-002**: 100% of auto-refreshes use the last explicitly saved JQL — no silent JQL changes ever occur.
- **SC-003**: Users can configure the refresh interval in under 30 seconds via Settings.
- **SC-004**: Auto-refresh does not block or visibly interrupt user interactions with filters or charts.
- **SC-005**: Setting the interval to 0 reliably disables all automatic refreshes.

## Assumptions

- A default refresh interval of 5 minutes is reasonable for most users; they can change it.
- The "Disabled" state is represented as interval = 0.
- Auto-refresh reuses the existing Sync mechanism (same JQL + issue fetch + SLA report regeneration).
- No new per-project override for the interval is needed — one global setting is sufficient.
- The refresh interval persists across app restarts as part of AppSettings.
