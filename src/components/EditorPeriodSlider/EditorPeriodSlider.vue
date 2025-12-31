<template>
  <div
    class="slider"
    :class="{
      'slider--dragging': isDragging,
      'slider--releasing': isReleasing,
      'slider--disabled': disabled,
      'slider--vertical': vertical,
    }"
    :style="verticalStyle"
    ref="sliderRef"
  >
    <!-- Увеличенная область касания -->
    <div class="slider__touch-area" @mousedown="handleStart" @touchstart.passive="handleStart">
      <!-- Трек слайдера -->
      <div class="slider__track" ref="trackRef">
        <!-- Заполненная часть -->
        <div class="slider__fill" :style="fillStyle" />

        <!-- Точки привязки -->
        <div
          v-for="(point, index) in normalizedSnapPoints"
          :key="index"
          class="slider__snap-point"
          :class="{ 'slider__snap-point--active': isNearSnapPoint(point.value) }"
          :style="snapPointStyle(point)"
        >
          <span
            v-if="point.label"
            class="slider__snap-label"
            :class="{ 'slider__snap-label--active': isNearSnapPoint(point.value) }"
          >
            {{ point.label }}
          </span>
        </div>

        <!-- Ползунок (thumb) -->
        <div
          class="slider__thumb"
          :class="{
            'slider__thumb--snapping': isSnapping,
            'slider__thumb--active': isDragging,
          }"
          :style="thumbStyle"
          ref="thumbRef"
        >
          <div class="slider__thumb-inner" />

          <!-- Tooltip со значением -->
          <div v-if="showTooltip && isDragging" class="slider__tooltip">
            {{ formatValue(internalValue) }}
          </div>
        </div>
      </div>
    </div>

    <!-- Метки min/max -->
    <div v-if="showLabels" class="slider__labels">
      <span>{{ formatValue(vertical ? max : min) }}</span>
      <span>{{ formatValue(vertical ? min : max) }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'

// ==================== Props ====================
const props = defineProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 100,
  },
  step: {
    type: Number,
    default: 1,
  },
  // Вертикальный режим
  vertical: {
    type: Boolean,
    default: false,
  },
  // Высота для вертикального слайдера
  height: {
    type: [Number, String],
    default: 200,
  },
  // Точки привязки: число или { value: number, label?: string }
  snapPoints: {
    type: Array,
    default: () => [],
  },
  // Порог притяжения в процентах от диапазона
  snapThreshold: {
    type: Number,
    default: 8,
  },
  // Сила притяжения (0-1)
  snapStrength: {
    type: Number,
    default: 0.3,
  },
  // Длительность анимации притяжения (мс)
  snapAnimationDuration: {
    type: Number,
    default: 250,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  showTooltip: {
    type: Boolean,
    default: false,
  },
  showLabels: {
    type: Boolean,
    default: false,
  },
  // Функция форматирования значения
  formatter: {
    type: Function,
    default: null,
  },
})

// ==================== Emits ====================
const emit = defineEmits([
  'update:modelValue',
  'change', // Когда отпустили
  'snap', // Когда притянулось к точке
  'dragStart',
  'dragEnd',
  'findClosestSnapPoint',
])

// ==================== Refs ====================
const sliderRef = ref(null)
const trackRef = ref(null)
const thumbRef = ref(null)

// ==================== State ====================
const isDragging = ref(false)
const isReleasing = ref(false)
const isSnapping = ref(false)
const internalValue = ref(props.modelValue)

// Для YouTube-style перетаскивания
const dragContext = ref({
  startX: 0,
  startY: 0,
  startValue: 0,
  touchedOnThumb: false,
  lastClientX: 0,
  lastClientY: 0,
})

// ==================== Computed ====================
const range = computed(() => props.max - props.min)

const percentage = computed(() => {
  return ((internalValue.value - props.min) / range.value) * 100
})

// Стиль для вертикального слайдера
const verticalStyle = computed(() => {
  if (!props.vertical) return {}

  const h = typeof props.height === 'number' ? `${props.height}px` : props.height
  return {
    '--slider-vertical-height': h,
  }
})

// Стиль заполненной части
const fillStyle = computed(() => {
  if (props.vertical) {
    return { height: `${percentage.value}%` }
  }
  return { width: `${percentage.value}%` }
})

// Стиль ползунка
const thumbStyle = computed(() => {
  const animDuration = `${props.snapAnimationDuration}ms`

  if (props.vertical) {
    return {
      bottom: `${percentage.value}%`,
      '--snap-animation-duration': animDuration,
    }
  }
  return {
    left: `${percentage.value}%`,
    '--snap-animation-duration': animDuration,
  }
})

// Стиль точки привязки
const snapPointStyle = (point) => {
  if (props.vertical) {
    return { bottom: `${point.percent}%` }
  }
  return { left: `${point.percent}%` }
}

// Нормализуем точки привязки в единый формат
const normalizedSnapPoints = computed(() => {
  return props.snapPoints.map((point) => {
    const value = typeof point === 'number' ? point : point.value
    const label = typeof point === 'object' ? point.label : null
    return {
      value,
      label,
      percent: ((value - props.min) / range.value) * 100,
    }
  })
})

// Порог в единицах значения
const snapThresholdValue = computed(() => {
  return (props.snapThreshold / 100) * range.value
})

// ==================== Methods ====================
function formatValue(value) {
  if (props.formatter) {
    return props.formatter(value)
  }
  // Умное округление в зависимости от step
  const decimals = (props.step.toString().split('.')[1] || '').length
  return value.toFixed(decimals)
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function getClientX(event) {
  return event.touches ? event.touches[0].clientX : event.clientX
}

function getClientY(event) {
  return event.touches ? event.touches[0].clientY : event.clientY
}

function getValueFromPosition(clientX, clientY) {
  const rect = trackRef.value.getBoundingClientRect()

  if (props.vertical) {
    // Инвертируем для вертикального (снизу вверх)
    const percent = 1 - (clientY - rect.top) / rect.height
    return props.min + percent * range.value
  }

  const percent = (clientX - rect.left) / rect.width
  return props.min + percent * range.value
}

function getValueFromDelta(deltaX, deltaY) {
  const rect = trackRef.value.getBoundingClientRect()

  if (props.vertical) {
    // Инвертируем для вертикального
    return -(deltaY / rect.height) * range.value
  }

  return (deltaX / rect.width) * range.value
}

function isNearSnapPoint(snapValue) {
  return Math.abs(internalValue.value - snapValue) <= snapThresholdValue.value
}

// Находим ближайшую точку snap
function findClosestSnapPoint(value) {
  let closestSnap = null
  let closestDistance = Infinity

  for (const point of normalizedSnapPoints.value) {
    const distance = Math.abs(value - point.value)
    if (distance < closestDistance && distance <= snapThresholdValue.value) {
      closestDistance = distance
      closestSnap = point.value
    }
  }

  return { closestSnap, closestDistance }
}

// Применяем притяжение к точкам
function applySnapAttraction(value, forceSnap = false) {
  if (normalizedSnapPoints.value.length === 0) {
    isSnapping.value = false
    return value
  }

  const { closestSnap, closestDistance } = findClosestSnapPoint(value)

  if (closestSnap !== null) {
    // Резкий snap при отпускании
    if (forceSnap) {
      isSnapping.value = true
      emit('snap', closestSnap)
      return closestSnap
    }

    // Мягкое притяжение во время перетаскивания
    const attractionForce = 1 - closestDistance / snapThresholdValue.value
    const attraction = attractionForce * props.snapStrength
    const attracted = value + (closestSnap - value) * attraction

    isSnapping.value = attractionForce > 0.5
    return attracted
  }

  isSnapping.value = false
  return value
}

function applyStep(value) {
  if (props.step <= 0) return value
  const stepped = Math.round((value - props.min) / props.step) * props.step + props.min
  return stepped
}

function updateValue(rawValue, finalizing = false) {
  let value = clamp(rawValue, props.min, props.max)

  // Применяем притяжение
  value = applySnapAttraction(value, finalizing)

  // Применяем step только если не в зоне snap
  if (!isSnapping.value && finalizing) {
    value = applyStep(value)
  }

  value = clamp(value, props.min, props.max)
  internalValue.value = value
  emit('update:modelValue', value)

  emit('findClosestSnapPoint', findClosestSnapPoint(value).closestSnap)
}

// Проверяем, попали ли на thumb
function isOnThumb(clientX, clientY) {
  if (!thumbRef.value) return false

  const thumbRect = thumbRef.value.getBoundingClientRect()
  // Увеличенная зона для удобства на мобильных
  const padding = 25

  const inX = clientX >= thumbRect.left - padding && clientX <= thumbRect.right + padding
  const inY = clientY >= thumbRect.top - padding && clientY <= thumbRect.bottom + padding

  return inX && inY
}

// ==================== Event Handlers ====================
function handleStart(event) {
  if (props.disabled) return

  // Останавливаем анимацию releasing если она идёт
  isReleasing.value = false

  const clientX = getClientX(event)
  const clientY = getClientY(event)
  const onThumb = isOnThumb(clientX, clientY)

  isDragging.value = true
  dragContext.value = {
    startX: clientX,
    startY: clientY,
    startValue: internalValue.value,
    touchedOnThumb: onThumb,
    lastClientX: clientX,
    lastClientY: clientY,
  }

  emit('dragStart', internalValue.value)

  // Добавляем Haptic feedback на мобильных (если поддерживается)
  if (navigator.vibrate && onThumb) {
    navigator.vibrate(10)
  }

  // Добавляем глобальные обработчики
  if (event.type === 'touchstart') {
    document.addEventListener('touchmove', handleMove, { passive: false })
    document.addEventListener('touchend', handleEnd)
    document.addEventListener('touchcancel', handleEnd)
  } else {
    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleEnd)
  }
}

function handleMove(event) {
  if (!isDragging.value) return

  // Предотвращаем скролл страницы
  if (event.cancelable) {
    event.preventDefault()
  }

  const clientX = getClientX(event)
  const clientY = getClientY(event)
  const ctx = dragContext.value

  let newValue

  if (ctx.touchedOnThumb) {
    // Классическое перетаскивание - позиция = позиция пальца
    newValue = getValueFromPosition(clientX, clientY)
  } else {
    // YouTube-style: относительное перемещение от начальной позиции thumb
    const deltaX = clientX - ctx.startX
    const deltaY = clientY - ctx.startY
    const deltaValue = getValueFromDelta(deltaX, deltaY)
    newValue = ctx.startValue + deltaValue
  }

  updateValue(newValue, false)
  ctx.lastClientX = clientX
  ctx.lastClientY = clientY
}

function handleEnd() {
  if (!isDragging.value) return

  isDragging.value = false

  // Включаем анимацию для плавного притяжения
  isReleasing.value = true

  // Финальный snap при отпускании
  updateValue(internalValue.value, true)

  // Haptic feedback при snap
  if (isSnapping.value && navigator.vibrate) {
    navigator.vibrate(15)
  }

  emit('dragEnd', internalValue.value)
  emit('change', internalValue.value)

  // Убираем состояние releasing после анимации
  setTimeout(() => {
    isReleasing.value = false
  }, props.snapAnimationDuration)

  // Убираем глобальные обработчики
  document.removeEventListener('touchmove', handleMove)
  document.removeEventListener('touchend', handleEnd)
  document.removeEventListener('touchcancel', handleEnd)
  document.removeEventListener('mousemove', handleMove)
  document.removeEventListener('mouseup', handleEnd)
}

// ==================== Watchers ====================
watch(
  () => props.modelValue,
  (newVal) => {
    if (!isDragging.value && !isReleasing.value) {
      internalValue.value = newVal
    }
  },
)

// ==================== Cleanup ====================
onUnmounted(() => {
  document.removeEventListener('touchmove', handleMove)
  document.removeEventListener('touchend', handleEnd)
  document.removeEventListener('touchcancel', handleEnd)
  document.removeEventListener('mousemove', handleMove)
  document.removeEventListener('mouseup', handleEnd)
})
</script>

<style scoped>
.slider {
  --slider-height: 4px;
  --slider-thumb-size: 24px;
  --slider-color-primary: #eee;
  --slider-color-track: #eee;
  --slider-color-snap: oklch(75% 0.183 55.934);
  --slider-color-snap-point: oklch(90.1% 0.076 70.697);
  --slider-vertical-height: 200px;
  --snap-animation-duration: 250ms;

  //position: relative;
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
  -webkit-touch-callout: none;
  -webkit-tap-highlight-color: transparent;
}

.slider--disabled {
  opacity: 0.5;
  pointer-events: none;
}

/* ==================== Горизонтальный режим ==================== */
.slider__touch-area {
  padding: 24px 0;
  cursor: pointer;
}

.slider__track {
  position: relative;
  height: var(--slider-height);
  background: var(--slider-color-track);
  border-radius: calc(var(--slider-height) / 2);
}

.slider__fill {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background: var(--slider-color-primary);
  border-radius: inherit;
  will-change: width;
}

.slider__thumb {
  position: absolute;
  top: 50%;
  width: var(--slider-thumb-size);
  height: var(--slider-thumb-size);
  transform: translate(-50%, -50%);
  will-change: left;
  z-index: 2;
}

.slider__snap-point {
  position: absolute;
  top: 50%;
  width: 10px;
  height: 10px;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.slider__snap-label {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  color: #aaa;
  white-space: nowrap;
}

.slider__snap-label--active {
  color: var(--slider-color-snap);
}

.slider__labels {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  font-size: 12px;
  color: #999;
}

/* ==================== Вертикальный режим ==================== */
.slider--vertical {
  width: auto;
  height: var(--slider-vertical-height);
  display: inline-flex;
  flex-direction: column;
}

.slider--vertical .slider__touch-area {
  padding: 0 24px;
  height: 100%;
  display: flex;
  align-items: center;
}

.slider--vertical .slider__track {
  width: var(--slider-height);
  height: 100%;
}

.slider--vertical .slider__fill {
  left: 0;
  bottom: 0;
  top: auto;
  width: 100%;
  height: 0;
  will-change: height;
}

.slider--vertical .slider__thumb {
  top: auto;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 50%);
  will-change: bottom;
}

.slider--vertical .slider__snap-point {
  top: auto;
  left: 50%;
  bottom: 0;
  transform: translate(-50%, 50%);
}

.slider--vertical .slider__snap-label {
  top: 50%;
  left: calc(100% + 8px);
  transform: translateY(-50%);
}

.slider--vertical .slider__labels {
  flex-direction: column;
  height: 100%;
  margin-top: 0;
  margin-left: 8px;
}

.slider--vertical .slider__tooltip {
  bottom: auto;
  left: calc(100% + 15px);
  top: 50%;
  transform: translateY(-50%);
}

.slider--vertical .slider__tooltip::after {
  top: 50%;
  left: auto;
  right: 100%;
  transform: translateY(-50%);
  border: 5px solid transparent;
  border-right-color: rgba(0, 0, 0, 0.8);
  border-top-color: transparent;
}

/* ==================== Анимации ==================== */

/* Без анимации во время перетаскивания */
.slider--dragging .slider__fill,
.slider--dragging .slider__thumb {
  transition: none !important;
}

/* Плавная анимация притяжения при отпускании */
.slider--releasing .slider__fill {
  transition:
    width var(--snap-animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1),
    height var(--snap-animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slider--releasing .slider__thumb {
  transition:
    left var(--snap-animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1),
    bottom var(--snap-animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* Небольшой bounce эффект для thumb при snap */
.slider--releasing .slider__thumb--snapping .slider__thumb-inner {
  animation: snap-bounce var(--snap-animation-duration) cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes snap-bounce {
  0% {
    transform: scale(1.25);
  }
  50% {
    transform: scale(1.4);
  }
  100% {
    transform: scale(1);
  }
}

/* ==================== Thumb стили ==================== */
.slider__thumb-inner {
  width: 100%;
  height: 100%;
  background: var(--slider-color-snap);
  border-radius: 50%;
  //box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.15s cubic-bezier(0.4, 0, 0.2, 1),
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.slider__thumb--active .slider__thumb-inner {
  transform: scale(1.25);
  //box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
}

.slider__thumb--snapping .slider__thumb-inner {
  background: var(--slider-color-snap);
}

.slider__thumb--snapping.slider__thumb--active .slider__thumb-inner {
  transform: scale(1.3);
}

/* ==================== Snap точки ==================== */
.slider__snap-point::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 8px;
  height: 8px;
  background: var(--slider-color-snap-point);
  border-radius: 50%;
  transform: translate(-50%, -50%);
  transition:
    background-color 0.15s ease,
    transform 0.15s ease;
}

.slider__snap-point--active::before {
  background: var(--slider-color-snap);
  transform: translate(-50%, -50%) scale(1.3);
}

/* ==================== Tooltip ==================== */
.slider__tooltip {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  transform: translateX(-50%);
  padding: 4px 10px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  white-space: nowrap;
  pointer-events: none;
  animation: tooltip-appear 0.15s ease;
}

.slider__tooltip::after {
  content: '';
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border: 5px solid transparent;
  border-top-color: rgba(0, 0, 0, 0.8);
}

@keyframes tooltip-appear {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

/* ==================== Адаптация для мобильных ==================== */
@media (pointer: coarse) {
  .slider {
    --slider-thumb-size: 14px;
  }

  .slider__touch-area {
    padding: 32px 0;
  }

  .slider--vertical .slider__touch-area {
    padding: 0 32px;
  }
}

/* Hover эффект только для десктопа */
@media (hover: hover) {
  .slider__thumb-inner:hover {
    transform: scale(1.1);
  }

  .slider__thumb--snapping .slider__thumb-inner:hover {
    transform: scale(1.35);
  }
}
</style>
