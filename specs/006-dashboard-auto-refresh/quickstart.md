# Quickstart: Dashboard Auto-Refresh

This document provides a high-level overview for developers to understand and contribute to the auto-refresh feature.

## 1. Feature Overview

The auto-refresh feature automatically updates the SLA Dashboard at a configurable interval. The core logic is encapsulated in a new custom hook, `useAutoRefresh`, and managed via a new React Context, `RefreshContext`.

## 2. Key Components

- **`RefreshContext` (`src/renderer/src/contexts/RefreshContext.tsx`)**:
  - **Purpose**: Provides the `autoRefreshInterval` and a function to update it to all components.
  - **State**:
    - `autoRefreshInterval`: The current interval in minutes.
    - `setAutoRefreshInterval`: Function to update the interval.

- **`useAutoRefresh` hook (`src/renderer/src/hooks/useAutoRefresh.ts`)**:
  - **Purpose**: Encapsulates the entire auto-refresh logic.
  - **Functionality**:
    - Subscribes to `RefreshContext` to get the interval.
    - Uses a `useInterval` helper hook to run a callback at the specified interval.
    - The callback triggers the Jira sync process.
    - Handles disabling the timer when the interval is 0.

- **`useInterval` hook (`src/renderer/src/hooks/useInterval.ts`)**:
  - **Purpose**: A utility hook that safely manages `setInterval` within a React component.
  - **Functionality**:
    - Takes a callback and a delay.
    - Sets up and clears the interval correctly during the component lifecycle.

- **`SLADashboard` Component (`src/renderer/src/components/SLADashboard.tsx`)**:
  - **Change**: This component will use the `useAutoRefresh` hook to enable the auto-refresh functionality.

- **`SettingsPage` Component (`src/renderer/src/components/SettingsPage.tsx`)**:
  - **Change**: This component will include a new input field to configure the `autoRefreshInterval`.
  - It will use the `RefreshContext` to get and set the interval.

## 3. Data Flow

1. The `App` component wraps the application in a `RefreshProvider`.
2. The `SettingsPage` component allows the user to change the `autoRefreshInterval`, which is saved to the global settings via `StorageService`.
3. The `SLADashboard` component uses the `useAutoRefresh` hook.
4. The `useAutoRefresh` hook gets the `autoRefreshInterval` from the `RefreshContext`.
5. The `useInterval` hook within `useAutoRefresh` triggers the sync process at the specified interval.
6. The sync process fetches data from Jira and updates the dashboard.

## 4. Testing

- **Unit/Integration Tests**: Tests for the hooks and components will be located in the `tests` directory.
- **Timer Mocks**: Vitest's timer mocks (`vi.useFakeTimers()`) will be used to test the time-based logic without waiting.
