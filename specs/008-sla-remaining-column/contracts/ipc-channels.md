# IPC Channels: SLA Remaining Column

No new IPC channels are introduced by this feature. Existing channels are updated to handle the extended `SLAIssue` and `SLAReport` types.

## Updated Channels

### `get-sla-cache`
- **Direction**: Renderer → Main
- **Return Type**: `Promise<SLAReport | null>` (Now includes `excludeLunchBreak` and `SLAIssue` with start timestamps)

### `generate-sla-report`
- **Direction**: Renderer → Main
- **Return Type**: `Promise<SLAReport>` (Now includes `excludeLunchBreak` and `SLAIssue` with start timestamps)

## Data Synchronization
The `SLATable` in the renderer will perform local calculations using a 60-second timer to update the "SLA Remaining" column in real-time without requiring new IPC calls.
