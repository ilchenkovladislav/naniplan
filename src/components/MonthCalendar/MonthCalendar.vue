<script setup lang="ts">
import { useSelectedDateStore } from '@/app/stores/selectedDate'
import { cacheCalendarMonth, type CalendarDay } from '@/utils/calendarUtils'
import { computed, ref } from 'vue'
import InvfinityCarousel from '@/pages/YearView/InfinityCarousel.vue'
import BaseIndicator from '../BaseIndicator/BaseIndicator.vue'
import { useNotesKeys } from '@/composables/useNotes'
import { isToday } from 'date-fns'

const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

const selectedStore = useSelectedDateStore()

const monthIndex = selectedStore.selectedDate.getMonth()
const year = selectedStore.selectedDate.getFullYear()

const handleDayClick = (day: CalendarDay) => {
  selectedStore.setSelectedDate(day.date)
}

const state = ref(new Date(year, monthIndex))

const dates = computed(() => {
  return cacheCalendarMonth(state.value.getFullYear(), state.value.getMonth())
})

const keysManager = useNotesKeys()
</script>

<template>
  <div class="relative grid grid-rows-[min-content_1fr]">
    <div
      class="start-2 grid grid-cols-[20px_repeat(7,_1fr)] border-b border-gray-200 text-center text-sm text-gray-400"
    >
      <div class="grid items-center justify-center border-r border-transparent">
        <BaseIndicator v-if="keysManager.getNote(keysManager.getKeyByType('month', state))" />
      </div>

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
          <div class="relative grid h-10 items-center text-center text-xs text-gray-400">
            <BaseIndicator
              v-if="keysManager.getNote(keysManager.getKeyByType('week', week.end))"
              :customClass="'absolute top-0.5 justify-self-center'"
            />
            {{ week.weekNumber }}
          </div>
        </div>
      </div>
      <InvfinityCarousel
        :onNext="() => (state = new Date(state.getFullYear(), state.getMonth() + 1))"
        :onPrev="() => (state = new Date(state.getFullYear(), state.getMonth() - 1))"
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
                      'relative flex size-10 items-center justify-center text-lg',
                      { 'text-gray-400': !day.isCurrentMonth },
                      { 'text-orange-300': isToday(day.date) },
                      {
                        'rounded-full border border-gray-200 text-orange-600':
                          day.date.toDateString() === selectedStore.selectedDate.toDateString(),
                      },
                    ]"
                    @click="() => handleDayClick(day)"
                  >
                    <BaseIndicator
                      v-if="keysManager.getNote(keysManager.getKeyByType('day', day.date))"
                      :customClass="'absolute top-1 justify-self-center'"
                    />
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
