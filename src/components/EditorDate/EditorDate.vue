<script lang="ts" setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { format, startOfISOWeek, endOfISOWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useSelectedDateStore } from '@/app/stores/selectedDate'

import { type PeriodType } from '@/pages/MainPage/model/types'

const { viewType } = defineProps<{
  viewType: PeriodType
}>()

const DATE_FORMATS = {
  day: 'd MMMM yyyy',
  weekStart: 'd MMMM',
  weekEnd: 'd MMMM yyyy',
  month: 'LLLL yyyy',
  year: 'yyyy',
}

function formatWeekRange(date: Date) {
  const startDate = format(startOfISOWeek(date), DATE_FORMATS.weekStart, { locale: ru })
  const endDate = format(endOfISOWeek(date), DATE_FORMATS.weekEnd, { locale: ru })

  return `${startDate} — ${endDate}`
}

const formatStrategies = {
  day: (date: Date) => format(date, DATE_FORMATS.day, { locale: ru }),
  week: (date: Date) => formatWeekRange(date),
  month: (date: Date) => format(date, DATE_FORMATS.month, { locale: ru }),
  year: (date: Date) => format(date, DATE_FORMATS.year, { locale: ru }),
}

const selectedDateStore = useSelectedDateStore()

const formattedDate = computed(() => {
  const date = selectedDateStore.selectedDate
  const strategy = formatStrategies[viewType]

  return strategy ? strategy(date) : ''
})
</script>

<template>
  <RouterLink to="/yearView" class="text-gray-300">{{ formattedDate }}</RouterLink>
</template>
