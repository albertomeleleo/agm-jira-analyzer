# IPC Channels: SLA Dashboard Metrics

This document defines the new IPC channel for the SLA Dashboard metrics feature.

## `get-sla-metrics`

-   **Direction**: Renderer → Main
-   **Description**: Requests the aggregated SLA metrics for a given project.
-   **Handler**: `SlaMetricsService.getSlaMetrics(projectName)`

### Arguments

-   `projectName` (string): The name of the project.

### Return Value

-   `Promise<SlaMetrics | null>`: A promise that resolves with the aggregated SLA metrics, or `null` if no data is available.

### Preload Binding

```typescript
// in src/preload/index.ts
getSlaMetrics: (projectName: string): Promise<SlaMetrics | null> =>
  ipcRenderer.invoke('get-sla-metrics', projectName)
```
