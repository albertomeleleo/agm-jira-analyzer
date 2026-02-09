# Contracts: Issue Key Sorting

## Shared Utilities

### `compareJiraKeys`
Defines the contract for numerical Jira Key comparison.

-   **Location**: `src/shared/jira-utils.ts`
-   **Input**:
    -   `a`: `string` (e.g., "PROJ-10")
    -   `b`: `string` (e.g., "PROJ-2")
-   **Output**: `number` (negative if `a < b`, positive if `a > b`, zero if equal)

**Example Test Cases:**
| Input A | Input B | Result | Why |
|---------|---------|--------|-----|
| "RAM-1" | "RAM-2" | `< 0`  | 1 < 2 |
| "RAM-10" | "RAM-2" | `> 0` | 10 > 2 (Numerical) |
| "A-1" | "B-1" | `< 0` | Lexicographical prefix comparison |
| "RAM-1000" | "RAM-998" | `> 0` | 1000 > 998 |

## UI Integration

### `SLATable` Component
The table will be updated to use the shared utility.

**Default State:**
```typescript
const [sortField, setSortField] = useState<'key' | ...>('key')
const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
```

**Sorting Block:**
```typescript
case 'key':
  cmp = compareJiraKeys(a.key, b.key)
  break
```
