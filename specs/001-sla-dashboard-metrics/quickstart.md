# Quickstart: SLA Dashboard Metrics

This document provides a high-level overview for developers to understand and contribute to the new metrics-based SLA Dashboard.

## 1. Feature Overview

This feature replaces the existing issue-list view with a metrics-only dashboard composed of several charts. The data is aggregated in the main process by a new service, `SlaMetricsService`, and fetched by the renderer process via a new IPC channel.

## 2. Key Components

-   **`SlaMetricsService` (`src/main/services/SlaMetricsService.ts`)**:
    -   **Purpose**: Fetches raw data from Jira and aggregates it into the `SlaMetrics` data structure.
    -   **Methods**:
        -   `getSlaMetrics(projectName: string): Promise<SlaMetrics | null>`: The main method that performs the aggregation.

-   **`ipc-channels.md` (`specs/001-sla-dashboard-metrics/contracts/ipc-channels.md`)**:
    -   **Purpose**: Defines the new `get-sla-metrics` IPC channel used to request the aggregated metrics.

-   **`SLADashboard` Component (`src/renderer/src/components/SLADashboard.tsx`)**:
    -   **Change**: This component will be refactored to remove the `SLATable` and instead display the new `SLACharts` component. It will be responsible for fetching the `SlaMetrics` data.

-   **`SLACharts` Component (`src/renderer/src/design-system/organisms/SLACharts.tsx`)**:
    -   **Change**: This component will be updated to render the new set of charts based on the `SlaMetrics` data.

## 3. Data Flow

1.  The `SLADashboard` component calls `window.api.getSlaMetrics(projectName)` to request the metrics.
2.  The `get-sla-metrics` IPC handler in the main process calls `SlaMetricsService.getSlaMetrics()`.
3.  `SlaMetricsService` fetches the necessary data from Jira.
4.  `SlaMetricsService` aggregates the data into the `SlaMetrics` structure and returns it.
5.  The `SLADashboard` component receives the `SlaMetrics` data and passes it to the `SLACharts` component.
6.  `SLACharts` renders the charts using `recharts`.

## 4. Testing

-   **Unit/Integration Tests**: Tests for the `SlaMetricsService` will be created to ensure the aggregation logic is correct.
-   **Component Tests**: Tests for the `SLACharts` component will be created to verify that the charts are rendered correctly based on the provided data.
