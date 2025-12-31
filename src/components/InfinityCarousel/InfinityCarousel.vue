<script setup lang="ts">
import { useCarousel } from '@/composables/useCarousel'
import { motion } from 'motion-v'

const { onNext, onPrev, padding } = defineProps<{
  onNext?: () => void
  onPrev?: () => void
  padding?: string
}>()
const { containerRef, items, x, onDragEnd } = useCarousel(onNext, onPrev)
</script>

<template>
  <div class="relative h-full overflow-hidden" ref="containerRef">
    <motion.div
      drag="x"
      :style="{ x }"
      class="relative h-full will-change-transform"
      @dragEnd="onDragEnd"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="absolute top-0 h-full w-full"
        :class="`${padding}`"
        :style="{
          transform: `translate3d(${item.x}px, 0, 0)`,
        }"
      >
        <slot name="item" :item="item" />
      </div>
    </motion.div>
  </div>
</template>
