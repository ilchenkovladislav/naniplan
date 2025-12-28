<script setup lang="ts">
import { onMounted, type Ref, ref, watch } from 'vue'

import { useDebounceFn } from '@vueuse/core'

import { useSelectedDateStore } from '@/app/stores/selectedDate'

import MyEditor from '@/components/MyEditor/MyEditor.vue'
import MonthCalendar from '@/components/EditorCalendar/EditorCalendar.vue'
import EditorDate from '@/components/EditorDate/EditorDate.vue'
import EditorPeriodSlider from '@/components/EditorPeriodSlider/EditorPeriodSlider.vue'

import { useEditor } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import TaskList from '@tiptap/extension-task-list'

import { TaskItemCustom } from '@/components/MyEditor/TaskItemCustom'

import type { EditorData, PeriodType } from './model/types'
import { createPlan, deletePlan, getAllPlans, updatePlan } from '@/app/db'
import { usePlansStore } from '@/app/stores/plans.ts'
import { getAllKeysForDate, getKeyByType } from '@/utils/keyUtils.ts'

const initViewType = (localStorage.getItem('viewType') as PeriodType) ?? 'day'
const viewType: Ref<PeriodType> = ref(initViewType)

const changeViewType = (type: PeriodType) => {
  viewType.value = type
  localStorage.setItem('viewType', type)
}

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

const editor = useEditor({
  content: '',
  extensions: [
    Document.extend({ content: 'block+' }),
    Paragraph,
    Text,
    Bold,
    Italic,
    TaskList,
    TaskItemCustom.extend({
      content: 'paragraph',
      HTMLAttributes: {
        class: 'custom-task-item',
      },
    }),
  ],

  onUpdate: ({ editor }) => {
    editorData.value[viewType.value] = editor.getHTML()
    saveEditorData(JSON.stringify(editor.getJSON()), editor.isEmpty)
  },
})

function initializeEditorData() {
  const currentKeys = getAllKeysForDate(selectedDateStore.selectedDate)

  Object.keys(editorData.value).forEach((type) => {
    const key = currentKeys[type as PeriodType]
    const plan = plansStore.plans.get(key)

    if (plan) {
      editorData.value[type as PeriodType] = JSON.parse(plan.content)
    } else {
      editorData.value[type as PeriodType] = ''
    }
  })
}

onMounted(async () => {
  const dbPlans = await getAllPlans()

  const mapPlans = new Map()

  for (const plan of dbPlans) {
    mapPlans.set(plan.key, plan)
  }

  plansStore.plans = mapPlans

  initializeEditorData()
  editor.value?.commands.setContent(editorData.value[viewType.value])
})

watch(viewType, (newVal) => {
  editor.value?.commands.setContent(editorData.value[newVal])
})

watch(selectedDateStore, () => {
  initializeEditorData()
  editor.value?.commands.setContent(editorData.value[viewType.value])
})
</script>

<template>
  <div
    class="fixed inset-0 grid grid-rows-[auto_1fr_auto_max-content] [&>*:nth-child(2)]:min-h-0 [&>*:nth-child(2)]:overflow-y-auto"
  >
    <div class="p-5">
      <EditorPeriodSlider
        :class="'absolute top-[35%] right-2 z-9999'"
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
          { value: 0, label: 'д' },
          { value: 33, label: 'н' },
          { value: 66, label: 'м' },
          { value: 100, label: 'г' },
        ]"
        :snap-threshold="17"
      />
      <EditorDate :viewType />
    </div>
    <MyEditor :editor="editor" />
    <MonthCalendar />
  </div>
</template>
