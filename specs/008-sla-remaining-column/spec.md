# Feature Specification: SLA Remaining Column in Item List

**Feature Branch**: `008-sla-remaining-column`  
**Created**: 2026-02-08  
**Status**: Draft  
**Input**: User description: "In Item List, la colonna SLA REMAINING deve essere senore popolata(nel caso di issue ancora aperta) con il tempo rimanente per la risoluzione, il tempo rimanente è il tempo dalla creazione fino al termine della sla di riferimento. Importante, per le issue deve essere escluso l'orario fuori dall'orario 9:00 - 18:00 (considerare anche esclusione della pausa pranzo, se abilitato Exclude Lunch Break) e i giorni festivi e sabato e domenica."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View Real-Time SLA Remaining for Open Issues (Priority: P1)

As a Support Agent, I want to see the remaining time for resolution for every open issue directly in the Item List, so that I can prioritize my work according to the closest deadlines.

**Why this priority**: This is the core requirement. Providing accurate remaining time helps users manage their workload and avoid SLA breaches.

**Independent Test**: Can be fully tested by opening the Item List with several open issues and verifying that the "SLA REMAINING" column is populated with values that correctly subtract non-working hours, weekends, and holidays.

**Acceptance Scenarios**:

1. **Given** an open issue with an SLA target, **When** I view the Item List during working hours, **Then** the "SLA REMAINING" column displays the net time remaining until the deadline.
2. **Given** an open issue, **When** the "Exclude Lunch Break" setting is toggled, **Then** the "SLA REMAINING" value updates to include or exclude the lunch break duration in the calculation.

---

### User Story 2 - Accurate Calculation across Weekends and Holidays (Priority: P2)

As a Team Lead, I want the SLA remaining time to ignore non-working days, so that the reported deadlines are realistic and reflect actual working capacity.

**Why this priority**: Ensures data integrity and trust in the system. Without accounting for holidays and weekends, the SLA metrics would be significantly distorted.

**Independent Test**: Can be tested by creating an issue on a Friday and checking the remaining time on Monday, verifying that Saturday and Sunday were not counted towards the SLA consumption.

**Acceptance Scenarios**:

1. **Given** an issue created on Friday afternoon with a 4-hour SLA, **When** viewed on Monday morning, **Then** the remaining time correctly reflects only the working hours consumed/remaining, skipping the weekend.
2. **Given** a national holiday is configured in the system, **When** an SLA span covers that holiday, **Then** that day is excluded from the calculation.

### Edge Cases

- **Creation outside working hours**: If an issue is created at 10:00 PM on a Saturday, the SLA calculation should start from 09:00 AM on the next working day (Monday).
- **SLA Breach**: When the remaining time becomes zero or negative, the display should clearly indicate the breach (e.g., "Overdue" or negative value).
- **Incomplete Calendar Configuration**: If a holiday is missing from the configuration, the system should treat it as a standard working day to avoid calculation errors.
- **Dynamic Setting Changes**: If the "Exclude Lunch Break" setting is toggled, all visible remaining times should recalculate immediately to reflect the new rule.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The System MUST populate the "SLA REMAINING" column for all open issues in the Item List.
- **FR-002**: The SLA calculation MUST exclude time outside the working window of 09:00 to 18:00.
- **FR-003**: The SLA calculation MUST exclude Saturdays and Sundays.
- **FR-004**: The SLA calculation MUST exclude configured holidays.
- **FR-005**: The System MUST exclude the lunch break duration if the "Exclude Lunch Break" setting is enabled.
- **FR-006**: The SLA calculation MUST be based on the net time from the **current time** until the reference SLA deadline.
- **FR-007**: The reference SLA deadline MUST be determined based on the issue's **priority** mapping (e.g., Highest, High, Medium, Low).
- **FR-008**: If "Exclude Lunch Break" is enabled, the system MUST use a standard lunch break window of **13:00 to 14:00** (1 hour).

### Key Entities *(include if feature involves data)*

- **SLAIssue**: Represents an issue in the list with its creation date, status, and SLA target information.
- **WorkCalendar**: Represents the configuration of working hours, weekend rules, and specific holiday dates.
- **SLASettings**: Stores global configurations like "Exclude Lunch Break" and lunch break time/duration.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The "SLA REMAINING" column is populated for 100% of open issues that have an assigned SLA target.
- **SC-002**: SLA calculation accuracy is 100% when compared to manual calculations accounting for working hours, weekends, and holidays.
- **SC-003**: The Item List remains responsive (loading in under 2 seconds) even with SLA remaining time calculations performed for up to 500 visible issues.
- **SC-004**: Users report high confidence in the displayed remaining time during peak periods with complex calendar overlaps.