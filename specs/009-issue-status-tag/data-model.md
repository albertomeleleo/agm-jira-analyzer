# Data Model: Issue Status Tags

## Entities

### SLAIssue (`src/shared/sla-types.ts`)
*Status*: Existing.
This entity already contains the `status` field (string) populated from Jira. No changes to the data structure are required.

## Shared Logic

### Status Utility (`src/shared/status-utils.ts`)
A new shared utility to handle status categorization and visual mapping.

#### `getStatusVariant(status: string): 'success' | 'danger' | 'warning' | 'info' | 'default'`
Maps a raw Jira status string to a UI semantic color variant.

**Mapping Rules:**
- **Success (Green)**: `Done`, `Released`, `Resolved`, `Closed`.
- **Danger (Red)**: `Rejected`, `Won't Fix`, `Cancelled`.
- **Warning (Orange)**: `In Progress`, `Review`, `Testing`, `Development`.
- **Info (Blue)**: `Backlog`, `Open`, `New`, `To Do`.
- **Default (Gray)**: Any other status.

*Implementation detail*: Case-insensitive keyword matching.
