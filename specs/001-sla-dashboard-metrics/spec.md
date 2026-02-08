# Feature Specification: SLA Dashboard Metrics

**Feature Branch**: `001-sla-dashboard-metrics`
**Created**: 2026-02-08
**Status**: Draft
**Input**: User description: "SLA Dashboard deve visualizzare solo le metriche, non le issues. grafici da visualizzare: Numero di task aperti vs chiusi per ogni settimana Numero di bug e service request aperti vs chiusi per settimana Conteggio bug/service request Dentro sla vs fuori sla per presa in carico Conteggio bug/service request Dentro sla vs fuori sla per risoluzione Una torta che visualizzi, rispetto ai filtri, la percentuale di numero di bug e service request Versus Issue rejected Una torta che visualizzi la distribuzione percentuale tra le varie priorità di bug e service request"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Open vs Closed Tasks Chart (Priority: P1)

As a manager, I want to see the number of open vs closed tasks for each week so that I can track team productivity and workload over time.

**Why this priority**: This provides a fundamental view of task throughput.

**Independent Test**: The chart should be verifiable by filtering Jira for tasks within a specific week and comparing the open/closed counts.

**Acceptance Scenarios**:

1.  **Given** I am on the SLA Dashboard, **When** I view the "Open vs Closed Tasks" chart, **Then** I see a weekly breakdown of task counts.
2.  **Given** the filters are changed, **When** the chart updates, **Then** it reflects the filtered data.

---

### User Story 2 - Open vs Closed Bugs/Service Requests Chart (Priority: P1)

As a support lead, I want to see the number of open vs closed bugs and service requests per week to monitor our support team's performance.

**Why this priority**: This is a key indicator of the support team's effectiveness.

**Independent Test**: The chart should be verifiable by filtering Jira for bugs and service requests within a specific week and comparing the open/closed counts.

**Acceptance Scenarios**:

1.  **Given** I am on the SLA Dashboard, **When** I view the "Open vs Closed Bugs/Service Requests" chart, **Then** I see a weekly breakdown of bug and service request counts.
2.  **Given** the filters are changed, **When** the chart updates, **Then** it reflects the filtered data.

---

### User Story 3 - SLA Compliance Chart for Response Time (Priority: P1)

As a manager, I want to see the count of bugs/service requests within SLA vs out of SLA for response time to ensure we are meeting our service level agreements.

**Why this priority**: Response time is a critical customer-facing metric.

**Independent Test**: The chart should be verifiable by checking the reaction time of individual bugs and service requests against the SLA.

**Acceptance Scenarios**:

1.  **Given** I am on the SLA Dashboard, **When** I view the "SLA Compliance for Response Time" chart, **Then** I see a clear visualization of in-SLA vs out-of-SLA counts.
2.  **Given** the filters are changed, **When** the chart updates, **Then** it reflects the filtered data.

---

### User Story 4 - SLA Compliance Chart for Resolution Time (Priority: P1)

As a manager, I want to see the count of bugs/service requests within SLA vs out of SLA for resolution time to ensure we are resolving issues in a timely manner.

**Why this priority**: Resolution time is a key measure of team efficiency and customer satisfaction.

**Independent Test**: The chart should be verifiable by checking the resolution time of individual bugs and service requests against the SLA.

**Acceptance Scenarios**:

1.  **Given** I am on the SLA Dashboard, **When** I view the "SLA Compliance for Resolution Time" chart, **Then** I see a clear visualization of in-SLA vs out-of-SLA counts.
2.  **Given** the filters are changed, **When** the chart updates, **Then** it reflects the filtered data.

---

### User Story 5 - Bugs/Service Requests vs Rejected Issues Pie Chart (Priority: P1)

As a product manager, I want to see a pie chart showing the percentage of bugs and service requests versus rejected issues to understand the quality of incoming requests.

**Why this priority**: This helps identify noise in the issue tracking system.

**Independent Test**: The chart should be verifiable by counting the number of bugs, service requests, and rejected issues within the filtered data set.

**Acceptance Scenarios**:

1.  **Given** I am on the SLA Dashboard, **When** I view the "Bugs/Service Requests vs Rejected Issues" pie chart, **Then** I see the percentage breakdown.
2.  **Given** the filters are changed, **When** the chart updates, **Then** it reflects the filtered data.

---

### User Story 6 - Priority Distribution Pie Chart (Priority: P1)

As a team lead, I want to see a pie chart displaying the percentage distribution of bug and service request priorities to understand where my team is focusing its efforts.

**Why this priority**: This helps in prioritizing work and allocating resources.

**Independent Test**: The chart should be verifiable by counting the number of bugs and service requests for each priority within the filtered data set.

**Acceptance Scenarios**:

1.  **Given** I am on the SLA Dashboard, **When** I view the "Priority Distribution" pie chart, **Then** I see a percentage breakdown by priority.
2.  **Given** the filters are changed, **When** the chart updates, **Then** it reflects the filtered data.

---

### Edge Cases

-   What happens when there is no data for a given week? The chart should display "No data" for that week.
-   How does the system handle issues that are in progress? They should be counted as "open".

## Requirements *(mandatory)*

### Functional Requirements

-   **FR-001**: The system MUST display a chart showing the number of open vs closed tasks for each week.
-   **FR-002**: The system MUST display a chart showing the number of open vs closed bugs and service requests per week.
-   **FR-003**: The system MUST display a chart showing the count of bugs/service requests within SLA vs out of SLA for response time.
-   **FR-004**: The system MUST display a chart showing the count of bugs/service requests within SLA vs out of SLA for resolution time.
-   **FR-005**: The system MUST display a pie chart showing the percentage of bugs and service requests versus rejected issues.
-   **FR-006**: The system MUST display a pie chart showing the percentage distribution among the various priorities of bugs and service requests.
-   **FR-007**: All charts MUST update to reflect any active filters.
-   **FR-008**: The dashboard MUST NOT display a list of individual issues.

### Key Entities *(include if feature involves data)*

-   **Metric**: A calculated value based on issue data (e.g., open/closed count, SLA compliance).
-   **Chart**: A visual representation of one or more metrics.

## Success Criteria *(mandatory)*

### Measurable Outcomes

-   **SC-001**: All charts load in under 3 seconds.
-   **SC-002**: Chart data is accurate to within 1% of the data in Jira.
-   **SC-003**: Users can understand the meaning of each chart without additional explanation.
-   **SC-004**: The dashboard provides a clear and concise overview of SLA performance and team productivity.