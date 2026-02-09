import { describe, it, expect } from 'vitest'
import { compareJiraKeys } from '../src/shared/jira-utils'

describe('compareJiraKeys', () => {
  describe('Numerical sorting within same prefix', () => {
    it('should sort RAM-1 before RAM-2', () => {
      expect(compareJiraKeys('RAM-1', 'RAM-2')).toBeLessThan(0)
    })

    it('should sort RAM-10 after RAM-2 (numerical, not lexicographical)', () => {
      expect(compareJiraKeys('RAM-10', 'RAM-2')).toBeGreaterThan(0)
    })

    it('should sort RAM-1000 after RAM-998', () => {
      expect(compareJiraKeys('RAM-1000', 'RAM-998')).toBeGreaterThan(0)
    })

    it('should treat equal keys as equal', () => {
      expect(compareJiraKeys('RAM-100', 'RAM-100')).toBe(0)
    })

    it('should handle single-digit vs multi-digit correctly', () => {
      expect(compareJiraKeys('PROJ-9', 'PROJ-10')).toBeLessThan(0)
      expect(compareJiraKeys('PROJ-99', 'PROJ-100')).toBeLessThan(0)
    })
  })

  describe('Lexicographical prefix comparison', () => {
    it('should sort A-1 before B-1', () => {
      expect(compareJiraKeys('A-1', 'B-1')).toBeLessThan(0)
    })

    it('should sort RAM-1 before XYZ-1', () => {
      expect(compareJiraKeys('RAM-1', 'XYZ-1')).toBeLessThan(0)
    })

    it('should sort AAA-10 before AAB-10', () => {
      expect(compareJiraKeys('AAA-10', 'AAB-10')).toBeLessThan(0)
    })
  })

  describe('Fallback to string comparison', () => {
    it('should handle keys without hyphens', () => {
      expect(compareJiraKeys('NOHYPHEN', 'RAM-1')).not.toBe(0)
      expect(compareJiraKeys('ABC', 'XYZ')).toBeLessThan(0)
    })

    it('should handle keys with non-numeric suffixes', () => {
      const result = compareJiraKeys('RAM-ABC', 'RAM-XYZ')
      // Should fall back to string comparison
      expect(result).toBe('RAM-ABC'.localeCompare('RAM-XYZ'))
    })

    it('should handle empty strings', () => {
      expect(compareJiraKeys('', '')).toBe(0)
      expect(compareJiraKeys('RAM-1', '')).not.toBe(0)
    })
  })

  describe('Edge cases', () => {
    it('should handle keys with leading zeros', () => {
      // parseInt handles leading zeros correctly
      expect(compareJiraKeys('RAM-001', 'RAM-2')).toBeLessThan(0)
      expect(compareJiraKeys('RAM-010', 'RAM-2')).toBeGreaterThan(0)
    })

    it('should handle keys with multiple hyphens (uses first hyphen)', () => {
      expect(compareJiraKeys('PROJ-SUB-1', 'PROJ-SUB-2')).toBeLessThan(0)
    })

    it('should handle very large numbers', () => {
      expect(compareJiraKeys('RAM-999999', 'RAM-1000000')).toBeLessThan(0)
    })
  })

  describe('Sorting array of keys', () => {
    it('should sort an array correctly in ascending order', () => {
      const keys = ['RAM-10', 'RAM-2', 'RAM-1', 'RAM-100', 'RAM-20']
      const sorted = [...keys].sort(compareJiraKeys)
      expect(sorted).toEqual(['RAM-1', 'RAM-2', 'RAM-10', 'RAM-20', 'RAM-100'])
    })

    it('should sort an array correctly in descending order', () => {
      const keys = ['RAM-10', 'RAM-2', 'RAM-1', 'RAM-100', 'RAM-20']
      const sorted = [...keys].sort((a, b) => compareJiraKeys(b, a))
      expect(sorted).toEqual(['RAM-100', 'RAM-20', 'RAM-10', 'RAM-2', 'RAM-1'])
    })

    it('should sort mixed prefixes correctly', () => {
      const keys = ['XYZ-1', 'RAM-10', 'ABC-5', 'RAM-2']
      const sorted = [...keys].sort(compareJiraKeys)
      expect(sorted).toEqual(['ABC-5', 'RAM-2', 'RAM-10', 'XYZ-1'])
    })
  })
})
