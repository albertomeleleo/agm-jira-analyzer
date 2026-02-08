# Data Model: SLA Dashboard Metrics

This document describes the data model for the new SLA Dashboard metrics.

## 1. Metric Data Structures

New interfaces will be defined in `src/shared/sla-types.ts` to represent the aggregated metrics for the charts.

### Weekly Open vs. Closed Counts

```typescript
export interface WeeklyCount {
  week: string; // e.g., "2026-W05"
  open: number;
  closed: number;
}
```

### SLA Compliance Counts

```typescript
export interface SlaCompliance {
  inSla: number;
  outOfSla: number;
}
```

### Pie Chart Data Point

```typescript
export interface PieChartDataPoint {
  name: string;
  value: number;
}
```

## 2. Main Metrics Data Structure

A new interface will be created to hold all the metrics for the dashboard.

```typescript
export interface SlaMetrics {
  tasks: WeeklyCount[];
  bugsAndRequests: WeeklyCount[];
  responseTimeSla: SlaCompliance;
  resolutionTimeSla: SlaCompliance;
  issueTypeDistribution: PieChartDataPoint[];
  priorityDistribution: PieChartDataPoint[];
}
```

## 3. Key Entities

-   **Metric**: A calculated value based on issue data (e.g., open/closed count, SLA compliance). The new interfaces above define the structure of these metrics.
-   **Chart**: A visual representation of one or more metrics. The charts will be implemented in the `SLACharts.tsx` component using `recharts`.
