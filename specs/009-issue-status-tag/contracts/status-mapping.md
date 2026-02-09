# Contracts: Issue Status Tags

## Shared Types

### Status Variant Type
Defined in `src/shared/status-utils.ts` or similar to match `BadgeProps['variant']`.

```typescript
export type StatusBadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'default';
```

## Shared Utilities

### `getStatusVariant`
- **Location**: `src/shared/status-utils.ts`
- **Input**: `status: string`
- **Output**: `StatusBadgeVariant`

## UI Component Integration

### `SLATable` Component
The table will be updated to include a new header and cell.

**Header mapping:**
```typescript
{ key: null, label: 'Status' }
```

**Row rendering:**
```typescript
<td className="px-4 py-3">
  <Badge variant={getStatusVariant(issue.status)}>
    {issue.status}
  </Badge>
</td>
```
