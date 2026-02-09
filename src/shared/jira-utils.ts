/**
 * Jira-specific utility functions
 */

// Priority weights for logical sorting
// Higher weight = higher priority (Critical > High > Medium > Low > Lowest)
export const PRIORITY_WEIGHTS: Record<string, number> = {
  'critical': 5,
  'high': 4,
  'medium': 3,
  'low': 2,
  'lowest': 1
}

/**
 * Compare two Jira issue keys numerically for sorting.
 *
 * Logic:
 * 1. Split both keys by the first hyphen (e.g., "RAM-1000" → prefix: "RAM", num: "1000")
 * 2. Compare prefixes lexicographically - if different, return the comparison result
 * 3. If prefixes match, parse and compare the numeric parts as integers
 * 4. Fall back to string comparison if parsing fails or format is unexpected
 *
 * @param a - First Jira key (e.g., "RAM-10")
 * @param b - Second Jira key (e.g., "RAM-2")
 * @returns Negative if a < b, positive if a > b, zero if equal
 *
 * @example
 * compareJiraKeys("RAM-1", "RAM-2")   // < 0 (1 < 2)
 * compareJiraKeys("RAM-10", "RAM-2")  // > 0 (10 > 2, numerical)
 * compareJiraKeys("A-1", "B-1")       // < 0 (prefix comparison)
 * compareJiraKeys("RAM-1000", "RAM-998") // > 0 (1000 > 998)
 */
export function compareJiraKeys(a: string, b: string): number {
  // Split by first hyphen
  const indexA = a.indexOf('-')
  const indexB = b.indexOf('-')

  // If either key doesn't have a hyphen, fall back to string comparison
  if (indexA === -1 || indexB === -1) {
    return a.localeCompare(b)
  }

  const prefixA = a.substring(0, indexA)
  const prefixB = b.substring(0, indexB)
  const numStrA = a.substring(indexA + 1)
  const numStrB = b.substring(indexB + 1)

  // Compare prefixes lexicographically
  if (prefixA !== prefixB) {
    return prefixA.localeCompare(prefixB)
  }

  // Parse numeric parts
  const numA = parseInt(numStrA, 10)
  const numB = parseInt(numStrB, 10)

  // If either parse failed, fall back to string comparison
  if (isNaN(numA) || isNaN(numB)) {
    return a.localeCompare(b)
  }

  // Compare numerically
  return numA - numB
}

/**
 * Compare two Jira priorities for logical sorting.
 *
 * Uses weight-based comparison: Critical (5) > High (4) > Medium (3) > Low (2) > Lowest (1)
 * Unmapped priorities default to weight 0 and are sorted to the bottom.
 *
 * Returns positive if a has higher priority (should come first in descending sort).
 * Returns negative if b has higher priority (should come first).
 * Returns 0 if equal priority.
 *
 * @param a - First priority (e.g., "Critical", "High")
 * @param b - Second priority (e.g., "Medium", "Low")
 * @returns Positive if a > b (a should come first in descending sort),
 *          Negative if a < b (b should come first),
 *          0 if equal priority
 *
 * @example
 * comparePriorities("Critical", "High")  // > 0 (Critical comes first)
 * comparePriorities("Low", "Medium")     // < 0 (Medium comes first)
 * comparePriorities("High", "High")      // 0 (equal)
 * ["Low", "Critical", "High"].sort(comparePriorities) // ["Critical", "High", "Low"]
 */
export function comparePriorities(a: string, b: string): number {
  const normalizedA = a.trim().toLowerCase()
  const normalizedB = b.trim().toLowerCase()

  const weightA = PRIORITY_WEIGHTS[normalizedA] ?? 0
  const weightB = PRIORITY_WEIGHTS[normalizedB] ?? 0

  // For descending sort (highest priority first), return weightB - weightA
  return weightB - weightA
}
