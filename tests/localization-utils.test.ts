import { describe, it, expect } from 'vitest'
import {
  STATUS_MAPPING,
  PRIORITY_MAPPING,
  getLocalizedStatus,
  getLocalizedPriority
} from '../src/shared/localization-utils'

describe('Localization Utilities', () => {
  describe('STATUS_MAPPING', () => {
    it('should be defined', () => {
      expect(STATUS_MAPPING).toBeDefined()
    })
  })

  describe('PRIORITY_MAPPING', () => {
    it('should be defined', () => {
      expect(PRIORITY_MAPPING).toBeDefined()
    })
  })

  describe('getLocalizedStatus', () => {
    it('should return "Completata" for "Done"', () => {
      expect(getLocalizedStatus('Done')).toBe('Completata')
    })

    it('should return "In corso" for "In progress"', () => {
      expect(getLocalizedStatus('In progress')).toBe('In corso')
    })

    it('should return "Rifiutato" for "Rejected"', () => {
      expect(getLocalizedStatus('Rejected')).toBe('Rifiutato')
    })

    it('should be case-insensitive', () => {
      expect(getLocalizedStatus('DONE')).toBe('Completata')
      expect(getLocalizedStatus('done')).toBe('Completata')
      expect(getLocalizedStatus('DoNe')).toBe('Completata')
    })

    it('should handle leading/trailing whitespace', () => {
      expect(getLocalizedStatus(' Done ')).toBe('Completata')
      expect(getLocalizedStatus('  In progress  ')).toBe('In corso')
    })

    it('should return original status if not mapped', () => {
      expect(getLocalizedStatus('In Review')).toBe('In Review')
      expect(getLocalizedStatus('Unknown Status')).toBe('Unknown Status')
    })
  })

  describe('getLocalizedPriority', () => {
    it('should return "Critico" for "Critical"', () => {
      expect(getLocalizedPriority('Critical')).toBe('Critico')
    })

    it('should return "Alta" for "High"', () => {
      expect(getLocalizedPriority('High')).toBe('Alta')
    })

    it('should return "Media" for "Medium"', () => {
      expect(getLocalizedPriority('Medium')).toBe('Media')
    })

    it('should return "Bassa" for "Low"', () => {
      expect(getLocalizedPriority('Low')).toBe('Bassa')
    })

    it('should return "Minore" for "Lowest"', () => {
      expect(getLocalizedPriority('Lowest')).toBe('Minore')
    })

    it('should be case-insensitive', () => {
      expect(getLocalizedPriority('CRITICAL')).toBe('Critico')
      expect(getLocalizedPriority('critical')).toBe('Critico')
      expect(getLocalizedPriority('CrItIcAl')).toBe('Critico')
    })

    it('should handle leading/trailing whitespace', () => {
      expect(getLocalizedPriority(' High ')).toBe('Alta')
      expect(getLocalizedPriority('  Medium  ')).toBe('Media')
    })

    it('should return original priority if not mapped', () => {
      expect(getLocalizedPriority('Unknown')).toBe('Unknown')
      expect(getLocalizedPriority('Custom Priority')).toBe('Custom Priority')
    })
  })
})
