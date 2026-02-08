# IPC Channels: SLA Dashboard Filters

This document defines the IPC usage for the SLA Dashboard Filters feature.

## Data Flow Change

The SLA Dashboard is transitioning from server-side aggregation to **client-side aggregation** to support real-time interactive filtering.

### Primary Data Source: `get-sla-cache`

-   **Direction**: Renderer → Main
-   **Description**: Retrieves the full `SLAReport` (including raw `SLAIssue[]`) for the dashboard.
-   **Handler**: `ProjectService.getSLACache(projectName)`

#### Return Value
- `Promise<SLAReport | null>`: Contains the list of issues and pre-calculated global summary.

### Deprecated/Secondary: `get-sla-metrics`

-   **Note**: This channel returns *unfiltered* metrics. It is no longer the primary source for the interactive dashboard but remains available for background tasks or simplified views.

## Shared Data Structures

The `SLAFilterState` (shared across pages) is extended:

```typescript
export interface SLAFilterState {
  // ... existing fields ...
  search: string;
  rejectedMode: 'include' | 'exclude' | 'only';
}
```

These changes affect how filters are serialized and persisted to `localStorage` and the project settings via existing IPC channels (`saveFilterPreset`, etc.).
No new IPC channels are required for persistence as they already handle generic `SLAFilterState`.
