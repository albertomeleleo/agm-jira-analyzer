import { describe, it, expect } from 'vitest'
import { PRIORITY_WEIGHTS, comparePriorities } from '../src/shared/jira-utils'

describe('Priority Sorting', () => {
  describe('PRIORITY_WEIGHTS', () => {
    it('should define correct priority hierarchy', () => {
      expect(PRIORITY_WEIGHTS['critical']).toBe(5)
      expect(PRIORITY_WEIGHTS['high']).toBe(4)
      expect(PRIORITY_WEIGHTS['medium']).toBe(3)
      expect(PRIORITY_WEIGHTS['low']).toBe(2)
      expect(PRIORITY_WEIGHTS['lowest']).toBe(1)
    })
  })

  describe('comparePriorities', () => {
    it('should sort Critical before High (descending sort)', () => {
      // Negative means 'a' comes before 'b' in sort order
      expect(comparePriorities('Critical', 'High')).toBeLessThan(0)
      expect(comparePriorities('High', 'Critical')).toBeGreaterThan(0)
    })

    it('should sort High before Medium (descending sort)', () => {
      expect(comparePriorities('High', 'Medium')).toBeLessThan(0)
      expect(comparePriorities('Medium', 'High')).toBeGreaterThan(0)
    })

    it('should sort Medium before Low (descending sort)', () => {
      expect(comparePriorities('Medium', 'Low')).toBeLessThan(0)
      expect(comparePriorities('Low', 'Medium')).toBeGreaterThan(0)
    })

    it('should sort Low before Lowest (descending sort)', () => {
      expect(comparePriorities('Low', 'Lowest')).toBeLessThan(0)
      expect(comparePriorities('Lowest', 'Low')).toBeGreaterThan(0)
    })

    it('should return 0 for equal priorities', () => {
      expect(comparePriorities('High', 'High')).toBe(0)
      expect(comparePriorities('Critical', 'Critical')).toBe(0)
    })

    it('should be case-insensitive', () => {
      expect(comparePriorities('CRITICAL', 'high')).toBeLessThan(0)
      expect(comparePriorities('CrItIcAl', 'HIGH')).toBeLessThan(0)
    })

    it('should handle unmapped priorities by defaulting to weight 0', () => {
      // Unmapped priorities should be sorted to the bottom
      expect(comparePriorities('Critical', 'Unknown')).toBeLessThan(0)
      expect(comparePriorities('Unknown', 'Critical')).toBeGreaterThan(0)
    })

    it('should handle two unmapped priorities (both weight 0)', () => {
      expect(comparePriorities('Unknown1', 'Unknown2')).toBe(0)
    })

    it('should sort full priority hierarchy correctly', () => {
      const priorities = ['Low', 'Critical', 'Lowest', 'High', 'Medium']
      const sorted = priorities.sort(comparePriorities)
      expect(sorted).toEqual(['Critical', 'High', 'Medium', 'Low', 'Lowest'])
    })
  })
})
