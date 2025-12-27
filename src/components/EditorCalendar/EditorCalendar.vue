<script setup lang="ts">
import { useSelectedDateStore } from '@/app/stores/selectedDate'
import { cacheCalendarMonth, type CalendarDay } from '@/utils/calendarUtils'
import { computed, ref } from 'vue'
import InfinityCarousel from '@/components/InfinityCarousel/InfinityCarousel.vue'
import BaseIndicator from '../BaseIndicator/BaseIndicator.vue'
import { format, getWeeksInMonth, isToday } from 'date-fns'
import { ru } from 'date-fns/locale'
import { usePlansStore } from '@/app/stores/plans.ts'

const daysOfWeek = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'] as const

const selectedStore = useSelectedDateStore()

const monthIndex = selectedStore.selectedDate.getMonth()
const year = selectedStore.selectedDate.getFullYear()

const handleDayClick = (day: CalendarDay) => {
  selectedStore.setSelectedDate(day.date)
  localStorage.setItem('lastSelectedDate', day.date.toString())
}

const state = ref(new Date(year, monthIndex))

const dates = computed(() => {
  return cacheCalendarMonth(state.value.getFullYear(), state.value.getMonth())
})

const getGapClass = (date: Date) => {
  const weeksInMonth = getWeeksInMonth(date, { weekStartsOn: 1 })
  if (weeksInMonth === 6) return 'gap-y-[1.6px]'
  if (weeksInMonth === 4) return 'gap-y-[29.3px]'
  return 'gap-y-3'
}

const plansStore = usePlansStore()
</script>

<template>
  <div class="relative grid grid-rows-[min-content_min-content_1fr]">
    <div class="justify-self-center text-gray-400">
      {{ format(state, 'LLLL yyyy', { locale: ru }) }}
    </div>
    <div
      class="start-2 grid grid-cols-[40px_repeat(7,_1fr)] border-b border-gray-100 py-2 text-center text-sm text-gray-400"
    >
      <div class="grid items-center justify-center border-r border-transparent">
        <BaseIndicator v-if="plansStore.hasPlan(state, 'month')" />
      </div>

      <div v-for="dayOfWeek in daysOfWeek" :key="dayOfWeek">
        {{ dayOfWeek }}
      </div>
    </div>

    <div class="grid grid-cols-[40px_1fr] items-start">
      <div
        :class="[
          'grid items-center justify-center border-r border-r-gray-100 text-[10px] text-gray-400',
          getGapClass(state),
        ]"
      >
        <div
          v-for="week in dates.weeks"
          :key="week.weekNumber"
          class="relative flex justify-center"
        >
          <div class="relative grid h-10 items-center text-center text-xs text-gray-400">
            <BaseIndicator
              v-if="plansStore.hasPlan(week.end, 'week')"
              :customClass="'absolute top-0.5 justify-self-center'"
            />
            {{ week.weekNumber }}
          </div>
        </div>
      </div>
      <InfinityCarousel
        :onNext="() => (state = new Date(state.getFullYear(), state.getMonth() + 1))"
        :onPrev="() => (state = new Date(state.getFullYear(), state.getMonth() - 1))"
      >
        <template #item="{ item }">
          <div
            :class="[
              'grid grid-cols-7 items-center justify-end',
              getGapClass(new Date(year, monthIndex + item.id)),
            ]"
          >
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
                        'rounded-full border border-orange-300 bg-red-100/30 font-bold text-orange-600':
                          day.date.toDateString() === selectedStore.selectedDate.toDateString(),
                      },
                    ]"
                    @click="() => handleDayClick(day)"
                  >
                    {{ day.date.getDate() }}
                    <BaseIndicator
                      v-if="plansStore.hasPlan(day.date, 'day')"
                      :class="[
                        'absolute justify-self-center',
                        {
                          '-bottom-2':
                            day.date.toDateString() === selectedStore.selectedDate.toDateString(),
                        },
                        {
                          'bottom-1':
                            day.date.toDateString() !== selectedStore.selectedDate.toDateString(),
                        },
                      ]"
                    />
                  </div>
                </div>
              </template>
            </template>
          </div>
        </template>
      </InfinityCarousel>
    </div>
  </div>
</template>
