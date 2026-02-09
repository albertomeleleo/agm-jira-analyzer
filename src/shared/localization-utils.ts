/**
 * Jira Localization Utilities
 *
 * Provides Italian translations for Jira statuses and priorities.
 * Mapping is case-insensitive and preserves unmapped values.
 */

// Status mapping: English (Jira) -> Italian (UI)
export const STATUS_MAPPING: Record<string, string> = {
  'done': 'Completata',
  'in progress': 'In corso',
  'rejected': 'Rifiutato'
}

// Priority mapping: English (Jira) -> Italian (UI)
export const PRIORITY_MAPPING: Record<string, string> = {
  'critical': 'Critico',
  'high': 'Alta',
  'medium': 'Media',
  'low': 'Bassa',
  'lowest': 'Minore'
}

/**
 * Get localized Italian label for a Jira status
 * @param status - Raw English Jira status (e.g., "Done", "In progress")
 * @returns Italian label if mapped, otherwise original status
 */
export function getLocalizedStatus(status: string): string {
  const normalized = status.trim().toLowerCase()
  return STATUS_MAPPING[normalized] || status
}

/**
 * Get localized Italian label for a Jira priority
 * @param priority - Raw English Jira priority (e.g., "Critical", "High")
 * @returns Italian label if mapped, otherwise original priority
 */
export function getLocalizedPriority(priority: string): string {
  const normalized = priority.trim().toLowerCase()
  return PRIORITY_MAPPING[normalized] || priority
}
