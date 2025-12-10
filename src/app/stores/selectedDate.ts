import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSelectedDateStore = defineStore('selectedDate', () => {
  const initSelectedDate = localStorage.getItem("lastSelectedDate") ?? new Date()
  const selectedDate = ref(new Date(initSelectedDate))

  function setSelectedDate(newDate: Date) {
    selectedDate.value = newDate
  }

  function setSelectedYear(newYear: number) {
    selectedDate.value = new Date(
      newYear,
      selectedDate.value.getMonth(),
      selectedDate.value.getDate(),
    )
  }

  function setSelectedMonth(newMonth: number) {
    selectedDate.value = new Date(
      selectedDate.value.getFullYear(),
      newMonth,
      selectedDate.value.getDate(),
    )
  }

  return { selectedDate, setSelectedDate, setSelectedYear, setSelectedMonth }
})
