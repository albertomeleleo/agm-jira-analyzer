# Data Model: SLA One-Click Sync

**Feature**: 004-sla-sync-button
**Date**: 2026-02-07

## Entity Changes

### Extended Entity: SLA Issues File (`sla-issues.json`)

The existing `sla-issues.json` file per project is extended with a new field.

**Current schema**:
```
{
  fetchedAt: string (ISO 8601)
  issues: JiraIssue[]
}
```

**New schema**:
```
{
  fetchedAt: string (ISO 8601)
  issues: JiraIssue[]
  lastJql?: string        ← NEW: the JQL query used for the last successful import
}
```

**Field details**:

| Field     | Type              | Required | Description                                                |
|-----------|-------------------|----------|------------------------------------------------------------|
| fetchedAt | string (ISO 8601) | Yes      | Timestamp of last import (existing)                        |
| issues    | JiraIssue[]       | Yes      | Array of imported Jira issues (existing)                   |
| lastJql   | string            | No       | The JQL query used for the last successful import (new)    |

**Notes**:
- `lastJql` is optional for backward compatibility — existing `sla-issues.json` files without this field will simply have `lastJql` as `undefined`, meaning the Sync button will be disabled until the user performs a new import.
- No migration is needed. The field is additive.
- The field is only updated on **successful** imports (not on failures or cancellations).

## Data Flow

### Sync Operation Flow

```
User clicks "Sync"
    → Renderer reads lastJql from local state (loaded on mount via IPC)
    → Renderer calls jiraImportIssues(config, lastJql, projectName) via IPC
        → Main: JiraService fetches issues from Jira API
        → Main: ProjectService.saveSLAIssues(projectName, issues, lastJql)
            → Writes { fetchedAt, issues, lastJql } to sla-issues.json
    → Renderer calls generateSLAReport(projectName, ...) via IPC
        → Main: reads sla-issues.json, computes SLA, writes sla-cache.json
    → Renderer updates state with new report
```

### Import Modal Flow (updated)

```
User opens Import modal
    → Modal calls getLastJql(projectName) via IPC
        → Main: reads sla-issues.json, returns lastJql (or null)
    → If lastJql exists: pre-fill textarea
    → If not: use default template (project = "KEY" ORDER BY created DESC)

User clicks "Import"
    → Renderer calls jiraImportIssues(config, jql, projectName) via IPC
    → On success: Renderer calls saveLastJql(projectName, jql) via IPC
        → Main: reads sla-issues.json, updates lastJql field, writes back
    → Modal calls onImportComplete callback
        → SLADashboard updates local lastJql state
```

## Cross-Entity Relationships

```
ProjectConfig (config.json)
    ├── jira: JiraConfig         → used by Sync for credentials
    ├── jiraProjectKey: string   → used by Sync for report generation
    ├── slaGroups: SLAGroup[]    → used by Sync for report generation
    └── excludeLunchBreak: bool  → used by Sync for report generation

SLA Issues (sla-issues.json)
    ├── issues: JiraIssue[]      → input to SLA report generation
    ├── fetchedAt: string        → updated on each import
    └── lastJql: string (NEW)    → reused by Sync button

SLA Cache (sla-cache.json)
    └── SLAReport                → output of report generation, displayed on dashboard
```
