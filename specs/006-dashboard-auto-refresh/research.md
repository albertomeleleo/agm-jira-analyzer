# Research: Dashboard Auto-Refresh

This document answers the open questions identified in the `plan.md` during the initial planning phase.

## 1. Timer Lifecycle Management

**Decision**: A custom React hook (`useInterval`) will be used to manage the timer lifecycle.

**Rationale**: `setInterval` in React can be tricky. If you're not careful, you can easily create memory leaks or have stale closures. A `useInterval` hook abstracts away the complexity of setting up and tearing down the interval, ensuring it's handled correctly within the React component lifecycle. It's a clean, reusable, and well-established pattern in the React community.

**Alternatives Considered**:
- **`setInterval` in `useEffect`**: This is the manual approach. It's prone to errors, such as forgetting to clear the interval on unmount or capturing stale state.
- **External library**: Libraries like `use-interval` exist, but creating our own simple `useInterval` hook is trivial and avoids an extra dependency.

## 2. Testing Time-Based Features with Vitest

**Decision**: We will use Vitest's built-in timer mocks (`vi.useFakeTimers()` and `vi.advanceTimersByTime()`).

**Rationale**: Vitest provides excellent support for mocking timers. This allows us to simulate the passage of time in our tests without waiting for the actual time to elapse. We can write tests that are fast, deterministic, and reliable. For example, we can check if the refresh function is called exactly after the configured interval has "passed".

**Alternatives Considered**:
- **Manual time manipulation**: This would involve complex and brittle mocks of `Date.now()` or other time-related functions. It's not a recommended practice.
- **Long-running tests**: We could let the tests run for the actual duration, but this would be extremely slow and impractical.

## 3. State Management for Refresh State

**Decision**: A new React Context (`RefreshContext`) will be created to manage the refresh state.

**Rationale**: While the refresh logic is primarily in the `SLADashboard`, the refresh interval is a global setting. A context will allow us to provide the interval and the refresh function to any component that needs it without prop drilling. It also provides a centralized place to manage the refresh state, such as when a refresh is in progress.

**Alternatives Considered**:
- **Prop drilling**: Passing the interval and refresh function down through multiple components would be cumbersome and make the code harder to maintain.
- **Zustand/Redux**: While these are powerful state management libraries, they would be overkill for this feature. A simple React Context is sufficient.

## 4. Custom Hook for the Timer

**Decision**: Yes, a custom hook (`useAutoRefresh`) will be created.

**Rationale**: This hook will encapsulate all the logic for the auto-refresh feature. It will use the `useInterval` hook, connect to the `RefreshContext` to get the interval, and call the sync function. This makes the `SLADashboard` component cleaner and the refresh logic reusable and easy to test in isolation.

**Alternatives Considered**:
- **Logic directly in `SLADashboard`**: This would make the component more complex and harder to test. It would also mix the UI logic with the refresh logic.