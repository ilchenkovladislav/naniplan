import { ref, computed } from 'vue'
import { useResizeObserver } from '@vueuse/core'
import { useMotion } from '@vueuse/motion'

interface CarouselItem {
  id: number
  x: number
}

type SlideOption = {
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

  const lastX = ref(0)
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

  const domTarget = ref()
  const motion = useMotion(domTarget)

  const dragHandler = ({
    movement: [x],
    swipe: [swipeX],
    first,
    dragging,
  }: {
    movement: [number]
    swipe: [number]
    first: boolean
    dragging: boolean
  }) => {
    if (!motion) return

    if (first) {
      lastX.value = motion.motionProperties.x ?? 0
    }

    if (!dragging) {
      const sign = Math.sign(x)
      const swipe = Math.abs(swipeX) * sign
      const distancePerItem = itemWidth.value + gap
      const distanceToSlide = distancePerItem / 3

      if (x > distanceToSlide || swipe === 1) {
        prevSlide({ distancePerItem })

        requestAnimationFrame(() => {
          onPrev?.()
          currentIndex.value--
        })
      } else if (x < -distanceToSlide || swipe === -1) {
        nextSlide({ distancePerItem })

        requestAnimationFrame(() => {
          onNext?.()
          currentIndex.value++
        })
      } else {
        cancelSlide({ distancePerItem })
      }

      return
    }

    motion.apply({
      x: x + lastX.value,
    })
  }

  function prevSlide({ distancePerItem }: SlideOption) {
    motion.apply({
      x: (-currentIndex.value + 1) * distancePerItem,
      transition: {
        type: 'tween',
        duration: 300,
      },
    })
  }

  function nextSlide({ distancePerItem }: SlideOption) {
    motion.apply({
      x: (-currentIndex.value - 1) * distancePerItem,
      transition: {
        type: 'tween',
        duration: 300,
      },
    })
  }

  function cancelSlide({ distancePerItem }: SlideOption) {
    motion.apply({
      x: -currentIndex.value * distancePerItem,
      transition: {
        type: 'tween',
        duration: 300,
      },
    })
  }

  return {
    containerRef,
    items,
    dragHandler,
    domTarget,
  }
}
