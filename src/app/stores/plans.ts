import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getKeyByType } from '@/utils/keyUtils.ts'

export const usePlansStore = defineStore('plans', () => {
  const plans = ref(new Map())

  function hasPlan(date: Date, type: 'day' | 'week' | 'month' | 'year') {
    const key = getKeyByType(date, type)

    return plans.value.has(key)
  }

  return { plans, hasPlan }
})
