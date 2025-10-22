<script lang="ts" setup>
import BaseIndicator from '../BaseIndicator/BaseIndicator.vue'
import { type PeriodType } from '@/pages/MainPage/model/types'

const { onChangeViewType, viewType, indicator } = defineProps<{
  onChangeViewType: (type: PeriodType) => void
  viewType: PeriodType
  indicator: {
    day: boolean
    week: boolean
    month: boolean
    year: boolean
  }
}>()
</script>

<template>
  <div class="flex gap-4">
    <button
      class="relative text-gray-300 transition-colors"
      :class="[{ 'text-orange-600': viewType === 'day' }]"
      @click="onChangeViewType('day')"
    >
      <BaseIndicator v-if="indicator.day" :customClass="'absolute top-0 right-0'" />
      день
    </button>
    <button
      class="relative text-gray-300 transition-colors"
      :class="[{ 'text-orange-600': viewType === 'week' }]"
      @click="onChangeViewType('week')"
    >
      <BaseIndicator v-if="indicator.week" :customClass="'absolute top-0 right-0'" />
      неделя
    </button>
    <button
      class="relative text-gray-300 transition-colors"
      :class="[{ 'text-orange-600': viewType === 'month' }]"
      @click="onChangeViewType('month')"
    >
      <BaseIndicator v-if="indicator.month" :customClass="'absolute top-0 right-0'" />
      месяц
    </button>
    <button
      class="relative text-gray-300 transition-colors"
      :class="[{ 'text-orange-600': viewType === 'year' }]"
      @click="onChangeViewType('year')"
    >
      <BaseIndicator v-if="indicator.year" :customClass="'absolute top-0 right-0'" />
      год
    </button>
  </div>
</template>
