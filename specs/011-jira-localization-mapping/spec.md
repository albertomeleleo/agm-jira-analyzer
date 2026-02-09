# Feature Specification: Jira Localization and Priority Mapping

**Feature Branch**: `011-jira-localization-mapping`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "Ho notato un problema nella lingua utilizzata da jira, inserisco delle mappature necessarie : Stati Done - Completata In progress - In corso Rejected - Rifiutato Priorità : Critical = Critico High = Alta Low = Bassa Lowest = Minore Medium = Media L'ordine delle priorità indipendentemente dall'ordine alfabetico deve essere: Critical = Critico High = Alta Medium = Media Low = Bassa Lowest = Minore"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Localized Status and Priority Display (Priority: P1)

As a user, I want to see Jira statuses and priorities in Italian in the issue table and filters, so that the interface is consistent with my local language expectations.

**Why this priority**: Correct localization is essential for user comfort and professional appearance of the application.

**Independent Test**: Can be fully tested by opening the Issue List and SLA Dashboard and verifying that "Done" appears as "Completata", "High" as "Alta", etc.

**Acceptance Scenarios**:

1. **Given** an issue with Jira status "Done", **When** I view it in the Issue List, **Then** the status tag shows "Completata".
2. **Given** an issue with Jira priority "Critical", **When** I view it in the Issue List, **Then** the priority column shows "Critico".

---

### User Story 2 - Logical Priority Sorting (Priority: P1)

As a user, I want the issues to be sorted by priority in a logical order (Critical > High > Medium > Low > Lowest) regardless of their localized names or alphabetical order, so that the most urgent tasks are correctly grouped.

**Why this priority**: Standard alphabetical sorting would put "Alta" (High) before "Critico" (Critical), which is logically incorrect for task management.

**Independent Test**: Can be tested by clicking the "Priority" header in the Issue List and verifying that the sequence matches the logical hierarchy.

**Acceptance Scenarios**:

1. **Given** a list of issues with different priorities, **When** I sort by Priority descending, **Then** "Critico" issues appear before "Alta" issues, and "Minore" issues appear last.

---

### User Story 3 - Localized Filter Options (Priority: P2)

As a user, I want the filter sidebar to show the localized names for status and priority, so that filtering is intuitive.

**Why this priority**: Consistency between the table display and the filter options is crucial for a good user experience.

**Independent Test**: Open the filters and verify the labels.

**Acceptance Scenarios**:

1. **Given** the filter sidebar is open, **When** I look at the Priority section, **Then** I see chips for "Critico", "Alta", etc., instead of the original English names.

### Edge Cases

- **Unmapped Values**: If a status or priority is encountered that is not in the mapping (e.g., "In Review"), it should be displayed as-is (raw English name) to ensure no data is hidden.
- **Partial Matches**: Mapping should be robust against trailing/leading spaces in Jira data.
- **Sorting with Unmapped Values**: If an issue has an unmapped priority, it should be sorted at the bottom of the list to avoid breaking the logic.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The System MUST map Jira statuses to Italian labels:
    - `Done` -> `Completata`
    - `In progress` -> `In corso`
    - `Rejected` -> `Rifiutato`
- **FR-002**: The System MUST map Jira priorities to Italian labels:
    - `Critical` -> `Critico`
    - `High` -> `Alta`
    - `Medium` -> `Media`
    - `Low` -> `Bassa`
    - `Lowest` -> `Minore`
- **FR-003**: The System MUST use the localized labels in all UI components (Tables, Charts, Filters).
- **FR-004**: The System MUST enforce a logical priority order for sorting: `Critical` > `High` > `Medium` > `Low` > `Lowest`.
- **FR-005**: Mappings MUST be case-insensitive for input but produce correctly capitalized Italian output.

### Key Entities *(include if feature involves data)*

- **SLAIssue**: Its `status` and `priority` fields will be displayed using mapped values.
- **PriorityMapper**: A logic component to handle logical ordering and localization.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Jira statuses and priorities specified in the mapping are translated in the UI.
- **SC-002**: Priority sorting follows the 5-level hierarchy correctly in both ascending and descending modes.
- **SC-003**: No English terms for the specified statuses/priorities remain visible in the production UI.