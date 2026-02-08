# Data Model: Dashboard Auto-Refresh

This document describes the data model changes required for the auto-refresh feature.

## 1. AppSettings

The global application settings will be extended to include the refresh interval.

**Existing `AppSettings` (in `src/shared/project-types.ts`)**:

```typescript
export interface AppSettings {
  // ... existing settings
}
```

**New `AppSettings`**:

```typescript
export interface AppSettings {
  // ... existing settings
  autoRefreshInterval: number; // in minutes, 0 means disabled
}
```

- **Field**: `autoRefreshInterval`
- **Type**: `number`
- **Description**: The interval in minutes for auto-refreshing the dashboard. A value of `0` disables the feature.
- **Default Value**: `5` (as per `spec.md`)

## 2. Project

The project data model already includes the `lastJQL` field. No changes are needed here.

**Existing `Project` (in `src/shared/project-types.ts`)**:

```typescript
export interface Project {
  // ... existing fields
  lastJQL?: string;
}
```

This field is already used by the manual sync process and will be used by the auto-refresh feature as well.