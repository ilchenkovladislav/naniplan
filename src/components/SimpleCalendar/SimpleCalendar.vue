<script setup lang="ts">
import { cacheCalendarMonth, months, daysOfWeek } from '@/utils/calendarUtils'
import { computed } from 'vue'
import { isToday } from 'date-fns'

const { monthIndex, year } = defineProps<{ monthIndex: number; year: number }>()
const dates = computed(() => cacheCalendarMonth(year, monthIndex))
</script>

<template>
  <div class="relative grid grid-rows-[min-content_min-content_1fr] gap-1">
    <div class="relative grid w-max items-center">
      <h3 class="w-max text-sm dark:text-white">{{ months[monthIndex] }}</h3>
    </div>

    <div class="start-2 grid grid-cols-8 text-center text-xs text-gray-400 dark:text-slate-400">
      <div v-for="dayOfWeek in daysOfWeek" :key="dayOfWeek">
        {{ dayOfWeek }}
      </div>
    </div>

    <div class="grid grid-cols-8 items-center justify-end gap-y-2 text-center text-[10px]">
      <template v-for="week in dates.weeks" :key="week.weekNumber">
        <template v-for="day in week.days" :key="day.toString()">
          <div v-if="!day.isCurrentMonth" />

          <div v-else class="relative flex justify-center dark:text-white">
            <div :class="[{ 'font-bold text-orange-600': isToday(day.date) }]">
              {{ day.date.getDate() }}
            </div>
          </div>
        </template>

        <div
          class="grid items-center justify-center gap-1 gap-y-2 text-[10px] text-gray-400 dark:text-slate-400"
        >
          <div class="relative flex justify-center">
            <div>{{ week.weekNumber }}</div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>
