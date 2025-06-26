import {
  startOfWeek,
  endOfWeek,
  addDays,
  getWeek,
  isSameMonth,
  startOfMonth,
  endOfMonth,
} from 'date-fns'

export const months = [
  'Январь',
  'Февраль',
  'Март',
  'Апрель',
  'Май',
  'Июнь',
  'Июль',
  'Август',
  'Сентябрь',
  'Октябрь',
  'Ноябрь',
  'Декабрь',
] as const

export const daysOfWeek = ['п', 'в', 'с', 'ч', 'п', 'с', 'в'] as const

export type CalendarDay = {
  date: Date
  isCurrentMonth: boolean
}

type CalendarWeek = {
  weekNumber: number
  start: Date
  end: Date
  days: CalendarDay[]
}

export type CalendarMonth = {
  month: number // 0-11
  year: number
  weeks: CalendarWeek[]
}

/**
 * Создает данные для одного месяца календаря с неделями и днями
 */
export function getCalendarMonth(year: number, month: number): CalendarMonth {
  const monthStart = startOfMonth(new Date(year, month))
  const monthEnd = endOfMonth(monthStart)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const weeks: CalendarWeek[] = []

  let current = calendarStart
  while (current <= calendarEnd) {
    const weekStart = current
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

    const days: CalendarDay[] = []
    for (let i = 0; i < 7; i++) {
      const day = addDays(weekStart, i)
      days.push({
        date: day,
        isCurrentMonth: isSameMonth(day, monthStart),
      })
    }

    weeks.push({
      weekNumber: getWeek(weekStart, { weekStartsOn: 1 }),
      start: weekStart,
      end: weekEnd,
      days,
    })

    current = addDays(weekEnd, 1) // Переход к следующей неделе
  }

  return {
    month,
    year,
    weeks,
  }
}

const calendarCache = new Map<string, CalendarMonth>()

export function cacheCalendarMonth(year: number, month: number): CalendarMonth {
  const key = `${year}-${month}`
  if (!calendarCache.has(key)) {
    calendarCache.set(key, getCalendarMonth(year, month))
  }
  return calendarCache.get(key)!
}
