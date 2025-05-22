import { animate, useMotionValue, useMotionValueEvent } from 'motion-v'
import { ref, computed } from 'vue'
import { useResizeObserver } from '@vueuse/core'

interface CarouselItem {
  id: number
  x: number
}

export function useCarousel() {
  const gap = 50

  const containerRef = ref<HTMLElement | null>(null)
  useResizeObserver(containerRef, (entries) => {
    containerWidth.value = entries[0].contentRect.width
  })

  const containerWidth = ref(430)
  const itemWidth = computed(() => {
    return containerWidth.value
  })

  const totalVisibleItems = computed(() => {
    return Math.ceil(containerWidth.value / (itemWidth.value + gap)) + 2
  })

  const centerOffset = computed(() => {
    return Math.floor(containerWidth.value / 2 - itemWidth.value / 2)
  })

  const x = useMotionValue(0)
  const xStart = ref(0)
  const currentIndex = ref(0)

  const items = computed<CarouselItem[]>(() => {
    const itemsBefore = 1
    const baseIndex = currentIndex.value

    return Array.from({ length: totalVisibleItems.value }, (_, i) => {
      const index = baseIndex + (i - itemsBefore)
      const xPos = centerOffset.value + index * (itemWidth.value + gap)
      return { id: index, x: xPos }
    })
  })

  useMotionValueEvent(x, 'animationComplete', () => {
    const distancePerItem = itemWidth.value + gap

    requestAnimationFrame(() => {
      currentIndex.value = -x.get() / distancePerItem
    })
  })

  function handleDragStart(e: PointerEvent) {
    xStart.value = e.clientX
  }

  function handleDragEnd(e: PointerEvent) {
    const dx = e.clientX - xStart.value
    const distancePerItem = itemWidth.value + gap
    const distanceToSlide = distancePerItem / 3
    const duration = 0.3

    if (dx > distanceToSlide) {
      animate(x, (-currentIndex.value + 1) * distancePerItem, { duration })
    } else if (dx < -distanceToSlide) {
      animate(x, (-currentIndex.value - 1) * distancePerItem, { duration })
    } else {
      animate(x, -currentIndex.value * distancePerItem, { duration })
    }
  }

  return {
    containerRef,
    x,
    items,
    handleDragStart,
    handleDragEnd,
  }
}
