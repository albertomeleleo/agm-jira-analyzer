# Feature Specification: SLA One-Click Sync

**Feature Branch**: `004-sla-sync-button`
**Created**: 2026-02-07
**Status**: Draft
**Input**: User description: "Devo poter aggiornare i dati importati dalla sla dashboard, cliccando un solo bottone. Deve essere memorizzata l'ultima JQL utilizzata, in modo che cliccando il nuovo bottone venga riutilizzata. Se clicco questo bottone di sincronizzazione, deve essere generato anche il nuovo report senza ulteriori click."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - One-Click SLA Sync (Priority: P1)

As a PM or Tech Lead, I want a single "Sync" button on the SLA Dashboard that re-imports issues using the last JQL query and automatically regenerates the SLA report, so I can refresh my data with zero friction instead of opening the import modal, confirming the JQL, waiting, closing the modal, and then clicking "Generate Report".

**Why this priority**: This is the core feature request. The current workflow requires 4-5 clicks across two separate interactions (import modal + generate report button). Reducing this to a single click dramatically improves daily usage efficiency.

**Independent Test**: Open the SLA Dashboard after having previously imported issues. Click the Sync button. Verify that the issue data is re-imported and the SLA report is regenerated in a single operation, with appropriate progress feedback.

**Acceptance Scenarios**:

1. **Given** a project with previously imported SLA issues (last JQL is stored), **When** the user clicks the Sync button, **Then** the system re-imports issues using the stored JQL and automatically generates a new SLA report without any additional user interaction.
2. **Given** a sync operation is in progress, **When** the user sees the Sync button, **Then** the button shows a loading state and is disabled to prevent duplicate operations.
3. **Given** a sync operation completes successfully, **When** the report is generated, **Then** the dashboard updates with the new data (stats, charts, table) and the user sees a brief success indication.
4. **Given** a sync operation fails (e.g., Jira connection error), **When** the error occurs, **Then** the user sees a clear error message and can retry the sync.
5. **Given** a project with no previously used JQL (first-time use), **When** the user views the dashboard, **Then** the Sync button is not available (disabled or hidden), and the user must first import issues through the existing Import modal.

---

### User Story 2 - Last JQL Persistence (Priority: P1)

As a PM, I want the system to remember the last JQL query I used to import issues, so the Sync button can reuse it without me having to re-enter or re-select it.

**Why this priority**: This is a prerequisite for the one-click sync — without remembering the JQL, the sync button cannot function. The JQL must persist across app sessions (not just in memory).

**Independent Test**: Import issues using a custom JQL query. Close and reopen the app. Open the Import modal — the last JQL should be pre-filled. Also verify that the Sync button reuses this stored JQL.

**Acceptance Scenarios**:

1. **Given** a user imports issues via the Import modal with a specific JQL query, **When** the import succeeds, **Then** the JQL query is saved as the project's "last used JQL".
2. **Given** a stored last JQL exists for the project, **When** the user opens the Import modal again, **Then** the textarea is pre-filled with the last used JQL (instead of the default template).
3. **Given** a stored last JQL exists, **When** the user re-imports with a different JQL, **Then** the stored JQL is updated to the new one.
4. **Given** the user closes and reopens the application, **When** they select the same project, **Then** the last used JQL is still available (persisted to disk, not just in memory).

---

### Edge Cases

- What happens if the stored JQL becomes invalid (e.g., project key changed)? The sync fails and shows the error from Jira, allowing the user to open the Import modal and correct the JQL.
- What happens if the Jira credentials expire or are changed? The sync fails with a connection error, same as the existing import behavior.
- What happens during a network interruption mid-sync? The operation fails gracefully with an error message; previously imported data remains intact.
- What happens if the user modifies the JQL in the Import modal but cancels? The stored JQL is NOT updated (only successful imports update the stored JQL).
- What happens if import succeeds but report generation fails? The user sees an error for the report generation step; the imported data is still saved. The user can manually click "Generate Report" to retry.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST persist the last successfully used JQL query per project, surviving application restarts.
- **FR-002**: System MUST provide a Sync button on the SLA Dashboard that triggers both issue import and report generation in a single user action.
- **FR-003**: The Sync button MUST reuse the project's stored last JQL query for the import step.
- **FR-004**: The Sync operation MUST execute the import and report generation sequentially (import first, then generate report) without requiring user interaction between steps.
- **FR-005**: The Sync button MUST show a loading state during the operation and be disabled to prevent duplicate triggers.
- **FR-006**: The Sync button MUST be disabled (or hidden) when no last JQL is stored for the current project (i.e., the user has never successfully imported issues).
- **FR-007**: Upon a successful import via the Import modal, the system MUST save the JQL query used as the project's last JQL.
- **FR-008**: The Import modal MUST pre-fill its JQL textarea with the project's last used JQL (if available), instead of the default template query.
- **FR-009**: If the Sync operation fails at the import step, the system MUST display the error and NOT attempt report generation.
- **FR-010**: If the Sync operation fails at the report generation step, the system MUST display the error; previously imported data from the successful import step MUST be preserved.
- **FR-011**: After a successful Sync, the dashboard MUST refresh all displayed data (statistics, charts, table) with the new report results.

### Key Entities

- **Last Used JQL**: A string stored per project that records the most recent successfully executed JQL import query. Persisted to disk alongside other project data.
- **Sync Operation**: A composite operation consisting of two sequential steps — issue import (using stored JQL) followed by SLA report generation — triggered by a single user action.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can refresh their SLA data in 1 click (down from 4-5 clicks in the current workflow).
- **SC-002**: The last used JQL persists across application restarts for each project independently.
- **SC-003**: The Sync operation completes both import and report generation without any intermediate user interaction.
- **SC-004**: Error scenarios (network failure, invalid JQL, expired credentials) are communicated to the user with clear, actionable messages within 5 seconds of the failure.
- **SC-005**: The Sync button is only available when a valid last JQL exists, preventing user confusion on first-time use.

## Assumptions

- The last used JQL is stored per-project (each project has its own independent last JQL).
- The JQL is only updated upon a **successful** import, not on failed attempts or cancellations.
- The Sync button uses the same Jira credentials and SLA configuration already stored in the project config — no additional configuration is needed.
- The Sync button does not replace the existing "Import Issues" and "Generate Report" buttons; it supplements them as a convenience shortcut.
- Progress feedback during sync uses the same loading patterns already present in the application (spinner, disabled state).
- The sync operation follows the same two-step process as the manual workflow: first import issues via JQL, then generate the SLA report from the imported data.
