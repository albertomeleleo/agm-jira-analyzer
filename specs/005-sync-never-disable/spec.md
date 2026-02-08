# Feature Specification: Sync Button Always Enabled

**Feature Branch**: `005-sync-never-disable`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "il bottone sync non si deve mai disabilitare"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Sync Button Always Clickable (Priority: P1)

As a PM or Tech Lead using the SLA Dashboard, I want the Sync button to always remain clickable so that I can refresh SLA data at any time without first having to open the Import Issues modal.

Currently the Sync button is disabled when no JQL query has been previously saved. This forces users to go through the Import Issues modal at least once before they can use Sync. The button should always be enabled, regardless of whether a JQL query was previously saved.

**Why this priority**: This is the core requirement of the feature — removing the unnecessary disabled state from the Sync button.

**Independent Test**: Can be fully tested by opening the SLA Dashboard on a project that has never imported issues and verifying that the Sync button is clickable.

**Acceptance Scenarios**:

1. **Given** a project with no previously saved JQL query, **When** I open the SLA Dashboard, **Then** the Sync button is enabled and clickable.
2. **Given** a project with a previously saved JQL query, **When** I open the SLA Dashboard, **Then** the Sync button is enabled and clickable.
3. **Given** a sync operation is in progress, **When** I look at the Sync button, **Then** it shows a loading spinner but remains visually present (non-interactive only while the operation is running).

---

### User Story 2 - Graceful Handling When No JQL Exists (Priority: P1)

When the user clicks Sync but no JQL query has been saved yet, the system should guide them rather than silently failing. The system should open the Import Issues modal so the user can define a JQL query.

**Why this priority**: Without this, removing the disabled state would lead to a confusing experience — the user clicks Sync, nothing visible happens, and there's no feedback.

**Independent Test**: Can be tested by clicking Sync on a project with no saved JQL and verifying that the Import Issues modal opens.

**Acceptance Scenarios**:

1. **Given** no JQL query has been saved for the active project, **When** I click the Sync button, **Then** the Import Issues modal opens automatically so I can define a query.
2. **Given** I define a JQL query in the Import Issues modal that was opened via Sync, **When** the import completes, **Then** the SLA data refreshes automatically as if I had clicked Sync with an existing JQL.

---

### Edge Cases

- What happens if the user clicks Sync while a sync is already in progress? The button should remain non-interactive (loading state) until the current operation completes — this existing behavior is correct and should be preserved.
- What happens if the Jira connection is not configured? The import modal should show the existing connection error, no new behavior needed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Sync button MUST always be visually enabled and clickable when no sync operation is in progress.
- **FR-002**: The Sync button MUST NOT be disabled based on the presence or absence of a saved JQL query.
- **FR-003**: When the user clicks Sync and no JQL query exists, the system MUST open the Import Issues modal to let the user define one.
- **FR-004**: After a successful import triggered via the Sync-initiated modal, the system MUST automatically refresh the SLA data.
- **FR-005**: The Sync button MUST still show a loading state and prevent duplicate clicks while a sync operation is in progress.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Sync button is clickable 100% of the time when no sync operation is running, regardless of project state.
- **SC-002**: Users who have never imported issues can discover the import flow by clicking Sync, reducing confusion about the two-step process.
- **SC-003**: Zero change in behavior for users who already have a saved JQL query — Sync continues to work exactly as before.

## Assumptions

- The existing loading state that prevents duplicate clicks during sync is correct behavior and should be preserved.
- The Import Issues modal already handles JQL saving and import execution; no changes to the modal itself are needed.
- Error handling for Jira connection issues is already adequate and does not need modification.
