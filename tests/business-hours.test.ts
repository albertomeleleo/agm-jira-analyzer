import { describe, it, expect } from 'vitest'
import {
  getBusinessMinutesBetween,
  getCalendarMinutesBetween,
  isBusinessDay,
  isHoliday,
  getItalianHolidays,
  getEasterMonday
} from '../src/shared/business-hours'

describe('business-hours', () => {
  describe('isBusinessDay', () => {
    it('returns true for weekdays', () => {
      const monday = new Date('2026-02-09T10:00:00.000Z') // Monday
      const friday = new Date('2026-02-13T10:00:00.000Z') // Friday
      expect(isBusinessDay(monday)).toBe(true)
      expect(isBusinessDay(friday)).toBe(true)
    })

    it('returns false for weekends', () => {
      const saturday = new Date('2026-02-14T10:00:00.000Z')
      const sunday = new Date('2026-02-15T10:00:00.000Z')
      expect(isBusinessDay(saturday)).toBe(false)
      expect(isBusinessDay(sunday)).toBe(false)
    })

    it('returns false for Italian holidays', () => {
      const newYear = new Date('2026-01-01T10:00:00.000Z')
      const christmas = new Date('2026-12-25T10:00:00.000Z')
      expect(isBusinessDay(newYear)).toBe(false)
      expect(isBusinessDay(christmas)).toBe(false)
    })
  })

  describe('isHoliday', () => {
    it('detects Italian national holidays', () => {
      expect(isHoliday(new Date('2026-01-01'))).toBe(true) // Capodanno
      expect(isHoliday(new Date('2026-01-06'))).toBe(true) // Epifania
      expect(isHoliday(new Date('2026-04-25'))).toBe(true) // Liberazione
      expect(isHoliday(new Date('2026-05-01'))).toBe(true) // Festa del Lavoro
      expect(isHoliday(new Date('2026-06-02'))).toBe(true) // Repubblica
      expect(isHoliday(new Date('2026-08-15'))).toBe(true) // Ferragosto
      expect(isHoliday(new Date('2026-11-01'))).toBe(true) // Ognissanti
      expect(isHoliday(new Date('2026-12-08'))).toBe(true) // Immacolata
      expect(isHoliday(new Date('2026-12-25'))).toBe(true) // Natale
      expect(isHoliday(new Date('2026-12-26'))).toBe(true) // Santo Stefano
    })

    it('detects Easter Monday', () => {
      const easter2026 = getEasterMonday(2026)
      expect(isHoliday(easter2026)).toBe(true)
    })

    it('returns false for regular days', () => {
      const regularDay = new Date('2026-02-10') // Tuesday, not a holiday
      expect(isHoliday(regularDay)).toBe(false)
    })
  })

  describe('getItalianHolidays', () => {
    it('returns 11 holidays for 2026', () => {
      const holidays = getItalianHolidays(2026)
      expect(holidays).toHaveLength(11)
    })
  })

  describe('getCalendarMinutesBetween', () => {
    it('calculates simple minute difference', () => {
      const start = new Date('2026-02-09T10:00:00.000Z')
      const end = new Date('2026-02-09T11:30:00.000Z')
      expect(getCalendarMinutesBetween(start, end)).toBe(90)
    })

    it('returns 0 for negative intervals', () => {
      const start = new Date('2026-02-09T11:00:00.000Z')
      const end = new Date('2026-02-09T10:00:00.000Z')
      expect(getCalendarMinutesBetween(start, end)).toBe(0)
    })
  })

  describe('getBusinessMinutesBetween', () => {
    it('calculates full working day (9-18) as 540 minutes', () => {
      const start = new Date(2026, 1, 9, 9, 0, 0) // Feb 9, 2026 09:00
      const end = new Date(2026, 1, 9, 18, 0, 0)
      expect(getBusinessMinutesBetween(start, end, false)).toBe(540)
    })

    it('calculates full working day excluding lunch (9-18) as 480 minutes', () => {
      const start = new Date(2026, 1, 9, 9, 0, 0)
      const end = new Date(2026, 1, 9, 18, 0, 0)
      expect(getBusinessMinutesBetween(start, end, true)).toBe(480)
    })

    it('skips weekends', () => {
      const friday5pm = new Date(2026, 1, 13, 17, 0, 0) // Friday Feb 13, 17:00
      const monday9am = new Date(2026, 1, 16, 9, 0, 0) // Monday Feb 16, 09:00
      expect(getBusinessMinutesBetween(friday5pm, monday9am, false)).toBe(60) // 1 hour Friday evening
    })

    it('skips holidays', () => {
      const beforeNewYear = new Date(2025, 11, 31, 17, 0, 0) // Dec 31, 2025 17:00
      const afterNewYear = new Date(2026, 0, 2, 9, 0, 0) // Jan 2, 2026 09:00
      // 31 Dec (Wed) 17:00-18:00 = 60min, 1 Jan = holiday, 2 Jan = nothing (9am start)
      expect(getBusinessMinutesBetween(beforeNewYear, afterNewYear, false)).toBe(60)
    })

    it('handles lunch break overlap', () => {
      const start = new Date(2026, 1, 9, 12, 30, 0)
      const end = new Date(2026, 1, 9, 14, 30, 0)
      // 12:30-13:00 (30min) + 13:00-14:00 (lunch) + 14:00-14:30 (30min)
      expect(getBusinessMinutesBetween(start, end, false)).toBe(120)
      expect(getBusinessMinutesBetween(start, end, true)).toBe(60)
    })

    it('returns 0 for intervals outside business hours', () => {
      const start = new Date(2026, 1, 9, 20, 0, 0)
      const end = new Date(2026, 1, 9, 21, 0, 0)
      expect(getBusinessMinutesBetween(start, end, false)).toBe(0)
    })
  })
})
