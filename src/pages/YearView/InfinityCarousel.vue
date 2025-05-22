<script setup lang="ts">
import { motion } from 'motion-v'
import { useCarousel } from '@/composables/useCarousel'

const { containerRef, x, items, handleDragStart, handleDragEnd } = useCarousel()
</script>

<template>
  <div class="relative overflow-hidden h-dvh" ref="containerRef">
    <motion.div
      class="relative h-full will-change-transform"
      drag="x"
      :style="{ x }"
      @dragStart="handleDragStart"
      @dragEnd="handleDragEnd"
    >
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
    </motion.div>
  </div>
</template>
