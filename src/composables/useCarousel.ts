import { ref, computed } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { animate, useMotionValue } from 'motion-v'

interface CarouselItem {
  id: number
  x: number
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

  const x = useMotionValue(0)

  function onDragEnd(event, info) {
    const offset = info.offset.x
    const velocity = info.velocity.x
    const distancePerItem = itemWidth.value + gap
    const distanceToSlide = distancePerItem / 3

    let direction = 0

    if (Math.abs(velocity) > 100) {
      direction = velocity > 0 ? -1 : 1
    } else if (Math.abs(offset) > distanceToSlide) {
      direction = offset > 0 ? -1 : 1
    }

    if (direction === -1) {
      prevSlide({ distancePerItem })

      requestAnimationFrame(() => {
        onPrev?.()
        currentIndex.value--
      })
    } else if (direction === 1) {
      nextSlide({ distancePerItem })

      requestAnimationFrame(() => {
        onNext?.()
        currentIndex.value++
      })
    } else {
      cancelSlide({ distancePerItem })
    }
  }

  function prevSlide({ distancePerItem }) {
    animate(x, (-currentIndex.value + 1) * distancePerItem)
  }

  function nextSlide({ distancePerItem }) {
    animate(x, (-currentIndex.value - 1) * distancePerItem)
  }

  function cancelSlide({ distancePerItem }) {
    animate(x, -currentIndex.value * distancePerItem)
  }

  return {
    containerRef,
    items,
    x,
    onDragEnd,
  }
}
