
import {
  isBefore,
  setHours,
  setMinutes,
  setSeconds,
  setMilliseconds,
  addDays,
  differenceInMinutes,
  isWeekend,
  isSameDay,
  getYear,
  isAfter
} from 'date-fns';

// --- HELPER FUNCTIONS ---
function getItalianHolidays(year: number): Date[] { return [new Date(year, 0, 1)]; }
const holidayCache = new Map<number, Date[]>();
function getHolidays(year: number): Date[] {
  if (!holidayCache.has(year)) holidayCache.set(year, getItalianHolidays(year));
  return holidayCache.get(year)!;
}
function isHoliday(date: Date): boolean {
  return getHolidays(getYear(date)).some((h) => isSameDay(h, date));
}
function isBusinessDay(date: Date): boolean {
  return !isWeekend(date) && !isHoliday(date);
}
function setTimeOfDay(date: Date, hours: number, minutes = 0): Date {
  return setMilliseconds(setSeconds(setMinutes(setHours(date, hours), minutes), 0), 0);
}

const WORK_START_HOUR = 9;
const WORK_END_HOUR = 18;
const LUNCH_START_HOUR = 13;
const LUNCH_END_HOUR = 14;

function getBusinessMinutesBetween(start: Date, end: Date, excludeLunch = false): number {
  if (!isBefore(start, end)) return 0;

  let totalMinutes = 0;
  let current = new Date(start);

  while (isBefore(current, end)) {
    if (isBusinessDay(current)) {
      const dayStart = setTimeOfDay(current, WORK_START_HOUR);
      const dayEnd = setTimeOfDay(current, WORK_END_HOUR);

      const effectiveStart = isBefore(current, dayStart) ? dayStart : current;
      const effectiveEnd = isAfter(end, dayEnd) ? dayEnd : end;

      if (isBefore(effectiveStart, effectiveEnd) && !isBefore(effectiveEnd, dayStart) && !isAfter(effectiveStart, dayEnd)) {
        let dayMinutes = differenceInMinutes(effectiveEnd, effectiveStart);

        if (excludeLunch) {
          const lunchStart = setTimeOfDay(current, LUNCH_START_HOUR);
          const lunchEnd = setTimeOfDay(current, LUNCH_END_HOUR);
          const overlapStart = isBefore(effectiveStart, lunchStart) ? lunchStart : effectiveStart;
          const overlapEnd = isAfter(effectiveEnd, lunchEnd) ? lunchEnd : effectiveEnd;
          
          if (isBefore(overlapStart, overlapEnd)) {
            const deduction = differenceInMinutes(overlapEnd, overlapStart);
            console.log(`  -> Day ${current.toISOString().slice(0,10)}: deducting ${deduction}m lunch`);
            dayMinutes -= deduction;
          }
        }
        totalMinutes += dayMinutes;
      }
    }
    current = setTimeOfDay(addDays(current, 1), 0);
  }
  return totalMinutes;
}

// --- REPRO ---
// 04/02/2026 09:23 -> 04/02/2026 14:50
const start = new Date(2026, 1, 4, 9, 23, 0); // Feb is index 1
const end = new Date(2026, 1, 4, 14, 50, 0);

console.log('Start:', start.toString());
console.log('End:', end.toString());
console.log('Is Business Day?', isBusinessDay(start));

const resultWithLunch = getBusinessMinutesBetween(start, end, false);
console.log('With Lunch (False):', resultWithLunch, 'minutes');

const resultExcludeLunch = getBusinessMinutesBetween(start, end, true);
console.log('Exclude Lunch (True):', resultExcludeLunch, 'minutes');

const expected = 267; // 327 total - 60 lunch
console.log('Expected:', expected);
console.log('Diff:', resultExcludeLunch - expected);
