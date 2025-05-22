<script setup lang="ts">
import Calendar from './CalendarMonth.vue'
import { months } from '@/utils/calendarUtils'
import InvfinityCarousel from './InfinityCarousel.vue'
</script>

<template>
  <div class="px-5">
    <h2>2025</h2>
    <InvfinityCarousel>
      <template #item="{ item }">
        <div class="grid grid-cols-3 gap-3">
          <Calendar
            v-for="(month, index) in months"
            :key="2025 + item.id + '-' + index"
            :year="2025 + item.id"
            :monthIndex="index"
          />
        </div>
      </template>
    </InvfinityCarousel>
  </div>
</template>
