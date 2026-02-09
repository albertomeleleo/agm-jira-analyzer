# Feature Specification: Issue Key Sorting

**Feature Branch**: `010-issue-key-sorting`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "le issue devono essere ordinabili per Key, di default l'ordinamento deve essere discendente"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Default Descending Sort by Key (Priority: P1)

As a PM or Tech Lead, I want the Issue List to be automatically sorted by Key in descending order when I open the page, so that I can immediately see the most recently created or highest-numbered issues at the top.

**Why this priority**: It sets the initial state of the data view, directly affecting how users perceive the "latest" work.

**Independent Test**: Open the Issue List page and verify that the first issue in the list is the one with the highest alphanumeric Key.

**Acceptance Scenarios**:

1. **Given** the Issue List has multiple issues (e.g., PROJ-1, PROJ-10, PROJ-2), **When** the page loads, **Then** the issues are displayed in descending order (PROJ-10, PROJ-2, PROJ-1).
2. **Given** the user navigates between Dashboard and Issue List, **When** returning to the Issue List, **Then** the sort order remains Key Descending (unless changed by the user).
3. **Given** issues with keys RAM-998 and RAM-1000, **When** the list is sorted descending, **Then** RAM-1000 appears before RAM-998.

---

### User Story 2 - Toggle Sort Direction (Priority: P2)

As a user, I want to be able to click on the "Key" column header to switch between ascending and descending order, so that I can find older issues or specific keys more easily.

**Why this priority**: Enhances the flexibility of the table navigation.

**Independent Test**: Click the "Key" header twice and verify the order flips from descending to ascending and back.

**Acceptance Scenarios**:

1. **Given** the list is sorted descending, **When** I click the "Key" header, **Then** the list sorts in ascending order.
2. **Given** the list is sorted ascending, **When** I click the "Key" header, **Then** the list sorts in descending order.

### Edge Cases

- **Mixed Project Keys**: If issues from different Jira projects are present (e.g., AAA-1, BBB-1), they should be sorted lexicographically first, then by number.
- **Empty State**: Sorting should not affect the UI when no issues are present.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The System MUST set the default `sortField` to "Key" for the Issue List.
- **FR-002**: The System MUST set the default `sortDir` to "Descending" for the Issue List.
- **FR-003**: The System MUST re-render the list immediately when the sort direction is toggled by clicking the "Key" header.
- **FR-004**: The sorting algorithm MUST parse and sort Jira Keys numerically by their sequence number (e.g., RAM-1000 is greater than RAM-998), rather than lexicographically.

### Key Entities *(include if feature involves data)*

- **SLAIssue**: The data object containing the `key` field used for sorting.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of page loads result in the Issue List being sorted by Key Descending by default.
- **SC-002**: Sort operations (toggling) complete in under 500ms for lists up to 1,000 issues.
- **SC-003**: The visual sort indicator (e.g., arrow icon) correctly reflects the current state of the "Key" column.