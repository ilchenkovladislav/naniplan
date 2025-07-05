import { format } from 'date-fns'

type NoteKeyPattern = {
  day: `notes:day:${string}` // notes:day:2025-07-01
  week: `notes:week:${string}` // notes:week:2025-W27
  month: `notes:month:${string}` // notes:month:2025-07
  year: `notes:year:${string}` // notes:year:2025
}

class NotesKeyManager {
  static getDayKey(date: Date = new Date()): string {
    const formatedDate = format(date, 'yyyy-MM-dd')
    return `notes:day:${formatedDate}`
  }

  static getWeekKey(date: Date = new Date()): string {
    const formatedDate = format(date, "yyyy-'W'II")
    return `notes:week:${formatedDate}`
  }

  static getMonthKey(date: Date = new Date()): string {
    const formatedDate = format(date, 'yyyy-MM')
    return `notes:month:${formatedDate}`
  }

  static getYearKey(date: Date = new Date()): string {
    const formatedDate = format(date, 'yyyy')
    return `notes:year:${formatedDate}`
  }

  // Получить все ключи для конкретной даты
  static getAllKeysForDate(date: Date = new Date()) {
    return {
      day: this.getDayKey(date),
      week: this.getWeekKey(date),
      month: this.getMonthKey(date),
      year: this.getYearKey(date),
    }
  }

  // Парсинг ключа для получения информации
  static parseKey(key: string): { type: string; date: string } | null {
    const match = key.match(/^notes:(day|week|month|year):(.+)$/)
    if (!match) return null

    return {
      type: match[1],
      date: match[2],
    }
  }

  static getNote(key: string): string | null {
    return localStorage.getItem(key)
  }
}

export const useNotesKeys = () => {
  const getCurrentKeys = (date?: Date) => {
    return NotesKeyManager.getAllKeysForDate(date)
  }

  const getKeyByType = (type: 'day' | 'week' | 'month' | 'year', date?: Date) => {
    const currentDate = date || new Date()
    switch (type) {
      case 'day':
        return NotesKeyManager.getDayKey(currentDate)
      case 'week':
        return NotesKeyManager.getWeekKey(currentDate)
      case 'month':
        return NotesKeyManager.getMonthKey(currentDate)
      case 'year':
        return NotesKeyManager.getYearKey(currentDate)
    }
  }

  return {
    getCurrentKeys,
    getKeyByType,
    parseKey: NotesKeyManager.parseKey,
    getNote: NotesKeyManager.getNote,
  }
}
