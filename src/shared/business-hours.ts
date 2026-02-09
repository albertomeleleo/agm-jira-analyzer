import {
  isBefore,
  isAfter,
  isSameDay,
  isWeekend,
  differenceInMinutes,
  addDays,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  getYear
} from 'date-fns'

// --- Italian holidays ---
export function getItalianHolidays(year: number): Date[] {
  const fixed = [
    new Date(year, 0, 1),   // Capodanno
    new Date(year, 0, 6),   // Epifania
    new Date(year, 3, 25),  // Liberazione
    new Date(year, 4, 1),   // Festa del Lavoro
    new Date(year, 5, 2),   // Repubblica
    new Date(year, 7, 15),  // Ferragosto
    new Date(year, 10, 1),  // Ognissanti
    new Date(year, 11, 8),  // Immacolata
    new Date(year, 11, 25), // Natale
    new Date(year, 11, 26)  // Santo Stefano
  ]

  // Easter Monday (Pasquetta) - computus algorithm
  const easterMonday = getEasterMonday(year)
  fixed.push(easterMonday)

  return fixed
}

export function getEasterMonday(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31) - 1
  const day = ((h + l - 7 * m + 114) % 31) + 1

  const easterSunday = new Date(year, month, day)
  return addDays(easterSunday, 1)
}

// Holiday cache per year
const holidayCache = new Map<number, Date[]>()
function getHolidays(year: number): Date[] {
  if (!holidayCache.has(year)) {
    holidayCache.set(year, getItalianHolidays(year))
  }
  return holidayCache.get(year)!
}

export function isHoliday(date: Date): boolean {
  const year = getYear(date)
  return getHolidays(year).some((h) => isSameDay(h, date))
}

export function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date)
}

// --- Business time calculation ---
const WORK_START_HOUR = 9
const WORK_END_HOUR = 18

function setTimeOfDay(date: Date, hours: number, minutes = 0): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0)
}

const LUNCH_START_HOUR = 13
const LUNCH_END_HOUR = 14

export function getBusinessMinutesBetween(start: Date, end: Date, excludeLunch = false): number {
  if (!isBefore(start, end)) return 0

  let totalMinutes = 0
  let current = new Date(start)

  while (isBefore(current, end)) {
    if (isBusinessDay(current)) {
      const dayStart = setTimeOfDay(current, WORK_START_HOUR)
      const dayEnd = setTimeOfDay(current, WORK_END_HOUR)

      const effectiveStart = isBefore(current, dayStart) ? dayStart : current
      const effectiveEnd = isAfter(end, dayEnd) ? dayEnd : end

      if (isBefore(effectiveStart, effectiveEnd)) {
        let dayMinutes = differenceInMinutes(effectiveEnd, effectiveStart)

        if (excludeLunch) {
          const lunchStart = setTimeOfDay(current, LUNCH_START_HOUR)
          const lunchEnd = setTimeOfDay(current, LUNCH_END_HOUR)
          const overlapStart = isBefore(effectiveStart, lunchStart) ? lunchStart : effectiveStart
          const overlapEnd = isAfter(effectiveEnd, lunchEnd) ? lunchEnd : effectiveEnd
          if (isBefore(overlapStart, overlapEnd)) {
            const lunchMinutes = differenceInMinutes(overlapEnd, overlapStart)
            dayMinutes -= lunchMinutes
          }
        }

        totalMinutes += dayMinutes
      }
    }

    current = setTimeOfDay(addDays(current, 1), 0)
  }

  return totalMinutes
}

export function getCalendarMinutesBetween(start: Date, end: Date): number {
  return Math.max(0, differenceInMinutes(end, start))
}
