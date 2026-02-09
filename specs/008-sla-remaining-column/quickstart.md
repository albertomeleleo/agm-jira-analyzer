# Quickstart: SLA Remaining Column

## Overview
This feature adds a real-time countdown for open issues in the Item List. It uses a shared business hour calculation engine to ensure consistency between the backend report and the frontend display.

## Key Files
- `src/shared/business-hours.ts`: The source of truth for working hours, holidays, and lunch breaks.
- `src/renderer/src/hooks/useRemainingTime.ts`: A React hook that updates every minute to provide real-time SLA remaining minutes.
- `src/renderer/src/design-system/organisms/SLATable.tsx`: Updated `RemainingBadge` to use the real-time hook.

## Verification Steps

### Basic Verification
1. **Navigate to Issue List**: Open a project with open SLA issues and go to the Issue List page.
2. **Check Remaining Column**: Verify the "SLA Remaining" column shows:
   - Badge with timer icon for open issues
   - Green badge for issues with >60min remaining
   - Yellow badge for issues with <60min remaining
   - Red badge for overdue issues (negative values shown as "-Xh Ym")
   - "-" for resolved issues
3. **Wait 1 Minute**: Observe that all remaining values decrease by 1 minute after 60 seconds (during business hours).

### Real-Time Updates
4. **Sort by Remaining**: Click the "SLA Remaining" column header to sort issues by time remaining.
5. **Verify Dynamic Sorting**: Wait 1 minute and confirm the sort order updates as time progresses.

### Business Hours Validation
6. **Check Outside Hours**: Test during non-business hours (before 09:00, after 18:00, or weekends):
   - Remaining time should NOT decrease
   - Timer still updates every 60s but values remain constant
7. **Holiday Test**: If testing on an Italian national holiday, verify remaining time is frozen.

### Lunch Break Setting
8. **Project Settings**: Go to Settings page and toggle "Exclude Lunch Break" setting.
9. **Regenerate Report**: Re-import issues and regenerate the SLA report.
10. **Verify Calculation**: Check that remaining times reflect the lunch break exclusion (values should be different based on the setting).

### Edge Cases
11. **Breached SLA**: Find an issue with negative remaining time (overdue):
    - Badge should be red
    - Time should display as "-2h 30m" (negative format)
12. **No SLA Target**: Tasks or issues without SLA targets should show "N/A" badge.
