import { format } from 'date-fns'

function getDayKey(date: Date = new Date()): string {
  const formatedDate = format(date, 'yyyy-MM-dd')
  return `${formatedDate}`
}

function getWeekKey(date: Date = new Date()): string {
  const formatedDate = format(date, "yyyy-'W'II")
  return `${formatedDate}`
}

function getMonthKey(date: Date = new Date()): string {
  const formatedDate = format(date, 'yyyy-MM')
  return `${formatedDate}`
}

function getYearKey(date: Date = new Date()): string {
  const formatedDate = format(date, 'yyyy')
  return `${formatedDate}`
}

export const getKeyByType = (date: Date, type: 'day' | 'week' | 'month' | 'year') => {
  const currentDate = date || new Date()
  switch (type) {
    case 'day':
      return getDayKey(currentDate)
    case 'week':
      return getWeekKey(currentDate)
    case 'month':
      return getMonthKey(currentDate)
    case 'year':
      return getYearKey(currentDate)
  }
}

export function getAllKeysForDate(date: Date = new Date()) {
  return {
    day: getDayKey(date),
    week: getWeekKey(date),
    month: getMonthKey(date),
    year: getYearKey(date),
  }
}
