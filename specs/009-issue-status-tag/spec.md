# Feature Specification: Issue Status Tags in Issue List

**Feature Branch**: `009-issue-status-tag`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "nella tabella issue list devo vedere su ogni issue un tag che mi mostri lo stato della issue per esempio: Rejected , Released, Done, Backlog"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Status Tags in Issue List (Priority: P1)

As a PM or Tech Lead, I want to see a clear visual indicator (tag) of each issue's current status in the Issue List table, so that I can quickly identify the progress and state of work items without opening details.

**Why this priority**: Understanding the status of issues is fundamental for tracking progress. Visual tags provide immediate context and improve the scannability of the table.

**Independent Test**: Can be fully tested by navigating to the Issue List page and verifying that each row contains a "Status" column with a styled tag representing the issue's current state (e.g., "Done", "Rejected").

**Acceptance Scenarios**:

1. **Given** the Issue List is loaded with data, **When** I view the table, **Then** I see a "Status" column containing a tag for every issue.
2. **Given** an issue has a status of "Rejected", **When** I view the Issue List, **Then** the status tag for that issue is clearly labeled "Rejected" and displayed with a Red (Danger) color theme to highlight its rejected state.

---

### User Story 2 - Color-Coded Status Categories (Priority: P2)

As a user, I want the status tags to be color-coded by category (e.g., Todo, In Progress, Done, Rejected), so that I can distinguish between active, completed, and blocked work at a glance.

**Why this priority**: Categorical coloring significantly enhances the speed of information processing. It allows users to "scan" for red (blocked/rejected) or green (done) items instantly.

**Independent Test**: Can be tested by verifying that different statuses map to specific color categories in the Issue List.

**Acceptance Scenarios**:

1. **Given** an issue is in a "Done" or "Released" state, **When** I view the list, **Then** the tag is displayed with a "success" (green) theme.
2. **Given** an issue is in "Backlog" or "Open", **When** I view the list, **Then** the tag is displayed with a "default" or "info" theme.

### Edge Cases

- **Long Status Names**: How does the tag handle very long status strings from Jira? (It should truncate gracefully or use a fixed width).
- **Missing Status**: What happens if an issue record is missing a status field? (It should show "Unknown" or a placeholder tag).
- **Custom Statuses**: How are unknown or custom statuses categorized? (They should default to a neutral category/color).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The System MUST add a "Status" column to the Issue List table.
- **FR-002**: The Status column MUST display the current status of each issue as a styled tag.
- **FR-003**: Status tags MUST be color-coded based on their logical category:
    - **Success (Green)**: Done, Released, Resolved.
    - **Danger (Red)**: Rejected, Won't Fix, Cancelled.
    - **Warning (Orange/Yellow)**: In Progress, Review, Testing.
    - **Info/Default (Blue/Gray)**: Backlog, Open, New.
- **FR-004**: The status text MUST match the value returned from the Jira API exactly (case-preserved or standard capitalization).
- **FR-005**: The Status column SHALL NOT be sortable.

### Key Entities *(include if feature involves data)*

- **SLAIssue**: Already contains a `status` field. This feature adds a visual representation for it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of issues in the Issue List display a visible status tag.
- **SC-002**: Status tags are consistently colored according to the defined category mapping for at least 95% of standard Jira statuses.
- **SC-003**: The Issue List table remains responsive and does not suffer performance degradation when rendering tags for up to 1,000 issues.
- **SC-004**: Users can correctly identify the state of 10 issues in under 5 seconds by scanning the color-coded tags.