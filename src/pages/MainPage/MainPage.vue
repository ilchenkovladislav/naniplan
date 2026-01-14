<script setup lang="ts">
import { onMounted, type Ref, ref, watch, provide, onUnmounted } from 'vue'

import { useDebounceFn } from '@vueuse/core'

import { useSelectedDateStore } from '@/app/stores/selectedDate'

import MonthCalendar from '@/components/EditorCalendar/EditorCalendar.vue'
import EditorDate from '@/components/EditorDate/EditorDate.vue'
import EditorPeriodSlider from '@/components/EditorPeriodSlider/EditorPeriodSlider.vue'

import type { EditorData, PeriodType } from './model/types'
import { createPlan, deletePlan, getAllPlans, updatePlan } from '@/app/db'
import { usePlansStore } from '@/app/stores/plans.ts'
import { getAllKeysForDate, getKeyByType } from '@/utils/keyUtils.ts'
import LexicalEditor from '@/components/LexicalEditor/LexicalEditor.vue'
import { buildEditorFromExtensions } from '@lexical/extension'
import { $createParagraphNode, $getRoot, defineExtension } from 'lexical'
import { CheckListExtension } from '@lexical/list'
import { mergeRegister } from '@lexical/utils'
import { registerRichText } from '@lexical/rich-text'
import ToggleTheme from '@/components/ToggleTheme/ToggleTheme.vue'

const editor = ref()
let unregisterAll = null
const editorRef = ref()

const initViewType = (localStorage.getItem('viewType') as PeriodType) ?? 'day'
const viewType: Ref<PeriodType> = ref(initViewType)

const changeViewType = (type: PeriodType) => {
  viewType.value = type
  localStorage.setItem('viewType', type)
  sliderValue.value = typeToValue[type]
}

provide('changeViewType', changeViewType)

const valueToType = {
  0: 'day',
  33: 'week',
  66: 'month',
  100: 'year',
}

const typeToValue = {
  day: 0,
  week: 33,
  month: 66,
  year: 100,
}

const selectedDateStore = useSelectedDateStore()

const plansStore = usePlansStore()

const sliderValue = ref(typeToValue[localStorage.getItem('viewType')] ?? typeToValue['day'])

const saveEditorData = useDebounceFn((value: string, isEmpty = false) => {
  const key = getKeyByType(selectedDateStore.selectedDate, viewType.value)
  const plan = plansStore.plans.get(key)

  if (isEmpty) {
    if (!plan) return

    deletePlan(plan.id).then(() => {
      plansStore.plans.delete(key)
    })
    return
  }

  if (plan) {
    updatePlan({ ...plan, content: value }).then(() => {
      plan.content = value
    })
  } else {
    createPlan({
      key,
      content: value,
      type: 'week',
      timestamp: new Date().getDate(),
    }).then((res) => {
      plansStore.plans.set(key, res)
    })
  }
}, 500)

const editorData: Ref<EditorData> = ref({
  day: '',
  week: '',
  month: '',
  year: '',
})

function initializeEditorData() {
  const currentKeys = getAllKeysForDate(selectedDateStore.selectedDate)

  Object.keys(editorData.value).forEach((type) => {
    const key = currentKeys[type as PeriodType]
    const plan = plansStore.plans.get(key)

    if (plan) {
      editorData.value[type as PeriodType] = plan.content
    } else {
      editorData.value[type as PeriodType] =
        '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}'
    }
  })
}

const isFocused = ref(false)
provide('focus', isFocused)

const initialHeight = window.innerHeight

const handleResize = () => {
  if (!window.visualViewport) return

  const vv = window.visualViewport
  const height = initialHeight - vv.height

  const keyboardHeight = window.innerHeight - vv.height - vv.offsetTop

  document.documentElement.style.setProperty(
    '--keyboard-height',
    `${Math.max(0, keyboardHeight)}px`,
  )

  document.documentElement.style.setProperty(
    '--content-height',
    `${window.visualViewport.height}px`,
  )

  isFocused.value = height > 100
}

function handleTouchMove(e) {
  if (!isScrollableElement(e.target)) {
    e.preventDefault()
  }
}

function isScrollableElement(element) {
  while (element && element !== document.body) {
    const style = window.getComputedStyle(element)
    const overflowY = style.getPropertyValue('overflow-y')

    if (
      (overflowY === 'auto' || overflowY === 'scroll') &&
      element.scrollHeight > element.clientHeight
    ) {
      return true
    }
    element = element.parentElement
  }
  return false
}

onMounted(async () => {
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', handleResize)
    window.visualViewport.addEventListener('scroll', handleResize)
  }

  document.addEventListener('touchmove', handleTouchMove, { passive: false })

  editor.value = buildEditorFromExtensions(
    defineExtension({
      name: 'LexicalEditor',
      namespace: 'LexicalEditor',
      dependencies: [CheckListExtension],
      theme: {
        paragraph: 'editor-paragraph',
        text: {
          bold: 'text-bold',
          italic: 'text-italic',
        },
        list: {
          checklist: 'checklist',
          listitem: 'listitem',
          listitemChecked: 'listitem-checked',
          listitemUnchecked: 'listitem-unchecked',
        },
      },
    }),
  )

  editor.value.update(() => {
    const root = $getRoot()
    if (root.isEmpty()) {
      const paragraph = $createParagraphNode()
      root.append(paragraph)
    }
  })

  unregisterAll = mergeRegister(
    registerRichText(editor.value),

    editor.value.registerUpdateListener(({ editorState }) => {
      let isEmpty = false

      if (editorState._nodeMap.size === 2) {
        isEmpty = true
      }

      saveEditorData(JSON.stringify(editorState.toJSON()), isEmpty)
    }),
  )

  const dbPlans = await getAllPlans()

  const mapPlans = new Map()

  for (const plan of dbPlans) {
    mapPlans.set(plan.key, plan)
  }

  plansStore.plans = mapPlans

  initializeEditorData()
  const editorState = editor.value.parseEditorState(editorData.value[viewType.value])
  editor.value.setEditorState(editorState)
})

onUnmounted(() => {
  unregisterAll?.()

  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', handleResize)
    window.visualViewport.removeEventListener('scroll', handleResize)
  }

  document.removeEventListener('touchmove', handleTouchMove)
})

watch(viewType, (newVal) => {
  initializeEditorData()
  const editorState = editor.value.parseEditorState(editorData.value[newVal])
  editor.value.setEditorState(editorState)
})

watch(selectedDateStore, () => {
  initializeEditorData()
  const editorState = editor.value.parseEditorState(editorData.value[viewType.value])
  editor.value.setEditorState(editorState)
})
</script>

<template>
  <div
    :class="'relative grid h-[var(--content-height,100svh)] max-h-svh grid-rows-[auto_1fr_auto] overscroll-none [&>*:nth-child(2)]:min-h-0 [&>*:nth-child(2)]:overflow-y-auto'"
  >
    <div
      class="flex items-center justify-between p-5 text-gray-300 dark:bg-slate-800 dark:text-slate-400"
    >
      <EditorDate :viewType />
      <ToggleTheme />
    </div>

    <LexicalEditor v-if="editor" :editor="editor" ref="editorRef" />
    <MonthCalendar />
  </div>
  <EditorPeriodSlider
    :class="'fixed top-[35%] right-2 z-9999'"
    v-model="sliderValue"
    @change="
      (value) => {
        changeViewType(valueToType[value])
      }
    "
    @findClosestSnapPoint="
      (value) => {
        changeViewType(valueToType[value])
      }
    "
    :min="0"
    :max="100"
    :height="150"
    vertical
    :snap-points="[
      { value: 0, label: 'день' },
      { value: 33, label: 'нед.' },
      { value: 66, label: 'мес.' },
      { value: 100, label: 'год' },
    ]"
    :snap-threshold="17"
  />
</template>
