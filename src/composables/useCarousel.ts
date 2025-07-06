import { animate, useMotionValue, useMotionValueEvent } from 'motion-v'
import { ref, computed } from 'vue'
import { useResizeObserver } from '@vueuse/core'

interface CarouselItem {
  id: number
  x: number
}

type SlideOption = {
  duration: number
  distancePerItem: number
}

export function useCarousel(onNext?: () => void, onPrev?: () => void) {
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
    if (!x.getVelocity()) {
      return
    }

    requestAnimationFrame(() => {
      const newIndex = -x.get() / distancePerItem
      if (currentIndex.value > newIndex) {
        onPrev?.()
      } else if (currentIndex.value < newIndex) {
        onNext?.()
      }
      currentIndex.value = newIndex
    })
  })

  function handleDragStart(e: PointerEvent) {
    xStart.value = e.clientX
  }

  function prevSlide({ duration, distancePerItem }: SlideOption) {
    animate(x, (-currentIndex.value + 1) * distancePerItem, { duration })
  }

  function nextSlide({ duration, distancePerItem }: SlideOption) {
    animate(x, (-currentIndex.value - 1) * distancePerItem, { duration })
  }

  function cancelSlide({ duration, distancePerItem }: SlideOption) {
    animate(x, -currentIndex.value * distancePerItem, { duration })
  }

  function handleDragEnd(e: PointerEvent) {
    const dx = e.clientX - xStart.value
    const distancePerItem = itemWidth.value + gap
    const distanceToSlide = distancePerItem / 3
    const duration = 0.3

    if (dx > distanceToSlide) {
      prevSlide({ duration, distancePerItem })
    } else if (dx < -distanceToSlide) {
      nextSlide({ duration, distancePerItem })
    } else {
      cancelSlide({ duration, distancePerItem })
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
