<script setup lang="ts">
import Calendar from '../../components/SimpleCalendar/SimpleCalendar.vue'
import { months } from '@/utils/calendarUtils'
import InvfinityCarousel from '@/components/InfinityCarousel/InfinityCarousel.vue'
import { RouterLink } from 'vue-router'
import { motion } from 'motion-v'
import { useSelectedDateStore } from '@/app/stores/selectedDate'
import { computed } from 'vue'

const store = useSelectedDateStore()
const { setSelectedYear } = useSelectedDateStore()
const year = computed(() => store.selectedDate.getFullYear())
const fixedYear = store.selectedDate.getFullYear()

const variants = [
  'top left',
  'top',
  'top right',
  'left 20%',
  'center 20%',
  'right 20%',
  'left 50%',
  'center 50%',
  'right 50%',
  'left 70%',
  'center 70%',
  'right 70%',
]
</script>

<template>
  <div class="grid h-dvh grid-rows-[auto_1fr]">
    <h2 class="relative z-10 bg-white px-5 py-2">{{ year }}</h2>
    <div class="grid px-5">
      <motion.div
        :initial="{ scale: 3, transformOrigin: variants[store.selectedDate.getMonth()] }"
        :animate="{ scale: 1 }"
        :transition="{ duration: 0.3 }"
        class="z-0"
      >
        <InvfinityCarousel
          :onNext="
            () => {
              setSelectedYear(year + 1)
            }
          "
          :onPrev="
            () => {
              setSelectedYear(year - 1)
            }
          "
        >
          <template #item="{ item }">
            <div class="grid grid-cols-3 gap-3">
              <RouterLink
                v-for="(month, index) in months"
                to="/"
                :key="fixedYear + item.id + '-' + index"
                @click="store.setSelectedDate(new Date(fixedYear + item.id, index))"
              >
                <Calendar :year="fixedYear + item.id" :monthIndex="index" />
              </RouterLink>
            </div>
          </template>
        </InvfinityCarousel>
      </motion.div>
    </div>
  </div>
</template>
