# Research: SLA Dashboard Metrics

This document answers the open questions identified in the `plan.md` during the initial planning phase.

## 1. Charting Library

**Decision**: We will use `recharts` for all new charts.

**Rationale**: A search of the codebase reveals that `recharts` is already used in the `SLACharts.tsx` component. To maintain consistency and avoid introducing new dependencies, we will continue to use `recharts`. It is a well-documented and powerful library that can handle all the required chart types.

**Alternatives Considered**:
- **`chart.js`**: Another popular charting library, but it would add a new dependency to the project.
- **`d3.js`**: A powerful but more low-level library that would require more effort to create the charts.

## 2. Metrics Aggregation

**Decision**: A new service, `SlaMetricsService.ts`, will be created in the main process.

**Rationale**: This service will be responsible for fetching the raw issue data from Jira and transforming it into the aggregated metrics required for the charts. This approach has several advantages:
- **Separation of Concerns**: The frontend is decoupled from the data aggregation logic.
- **Performance**: The main process can handle the data processing in the background, without blocking the UI.
- **Testability**: The `SlaMetricsService` can be unit-tested in isolation, without needing to render any UI components.

**Alternatives Considered**:
- **Frontend Aggregation**: The aggregation logic could be implemented in the renderer process. This would simplify the main process, but it could lead to performance issues and make the frontend code more complex.
- **Direct Jira API Calls from Frontend**: This would violate the project's architecture, which proxies all external API calls through the main process.
