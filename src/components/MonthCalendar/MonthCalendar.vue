<script setup lang="ts">
import { useSelectedDateStore } from '@/app/stores/selectedDate'
import { cacheCalendarMonth, type CalendarDay } from '@/utils/calendarUtils'
import { computed } from 'vue'
import InvfinityCarousel from '@/pages/YearView/InfinityCarousel.vue'

const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

const { monthIndex = 5, year = new Date().getFullYear() } = defineProps<{
  monthIndex?: number
  year?: number
}>()
const selectedStore = useSelectedDateStore()
const dates = computed(() =>
  cacheCalendarMonth(
    selectedStore.selectedDate.getFullYear(),
    selectedStore.selectedDate.getMonth(),
  ),
)

const handleDayClick = (day: CalendarDay) => {
  selectedStore.setSelectedDate(day.date)
}
</script>

<template>
  <div class="relative grid grid-rows-[min-content_1fr]">
    <div
      class="start-2 ml-[20px] grid grid-cols-7 border-b border-gray-200 text-center text-sm text-gray-400"
    >
      <div v-for="dayOfWeek in daysOfWeek" :key="dayOfWeek">
        {{ dayOfWeek }}
      </div>
    </div>

    <div class="grid grid-cols-[20px_1fr] items-start">
      <div
        class="grid items-center justify-center gap-y-3 border-r border-r-gray-200 text-[10px] text-gray-400"
      >
        <div
          v-for="week in dates.weeks"
          :key="week.weekNumber"
          class="relative flex justify-center"
        >
          <div class="grid h-10 items-center text-center text-xs text-gray-400">
            {{ week.weekNumber }}
          </div>
        </div>
      </div>
      <InvfinityCarousel
        :onNext="
          () => {
            selectedStore.setSelectedMonth(selectedStore.selectedDate.getMonth() + 1)
          }
        "
        :onPrev="
          () => {
            selectedStore.setSelectedMonth(selectedStore.selectedDate.getMonth() - 1)
          }
        "
      >
        <template #item="{ item }">
          <div class="grid grid-cols-7 items-center justify-end gap-y-3">
            <template
              v-for="week in cacheCalendarMonth(year, monthIndex + item.id).weeks"
              :key="week.weekNumber"
            >
              <template v-for="day in week.days" :key="day.toString()">
                <div class="flex justify-center">
                  <div
                    :class="[
                      'flex size-10 items-center justify-center text-lg',
                      { 'text-gray-400': !day.isCurrentMonth },
                      {
                        'rounded-full border border-gray-200 text-orange-600':
                          day.date.toDateString() === selectedStore.selectedDate.toDateString(),
                      },
                    ]"
                    @click="() => handleDayClick(day)"
                  >
                    {{ day.date.getDate() }}
                  </div>
                </div>
              </template>
            </template>
          </div>
        </template>
      </InvfinityCarousel>
    </div>
  </div>
</template>
