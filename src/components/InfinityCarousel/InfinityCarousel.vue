<script setup lang="ts">
import { useCarousel } from '@/composables/useCarousel'
import { useDrag } from '@vueuse/gesture'

const { onNext, onPrev } = defineProps<{ onNext?: () => void; onPrev?: () => void }>()
const { containerRef, items, dragHandler, domTarget } = useCarousel(onNext, onPrev)

const dragOptions = {
  axis: 'x',
  domTarget,
  swipeVelocity: 0.01,
  swipeDistance: 1,
  swipeDuration: 1000,
}

useDrag(dragHandler, dragOptions)
</script>

<template>
  <div class="relative h-full overflow-hidden" ref="containerRef">
    <div class="relative h-full will-change-transform" ref="domTarget">
      <div
        v-for="item in items"
        :key="item.id"
        class="absolute top-0 h-full w-full"
        :style="{
          transform: `translate3d(${item.x}px, 0, 0)`,
        }"
      >
        <slot name="item" :item="item" />
      </div>
    </div>
  </div>
</template>
