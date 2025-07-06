<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import TaskList from '@tiptap/extension-task-list'
// import TaskItem from '@tiptap/extension-task-item'
import { TaskItemCustom } from './TaskItemCustom'
import { RouterLink } from 'vue-router'

import { Bold as LucideBold, Italic as LucideItalic, SquareCheck } from 'lucide-vue-next'
import { watch, ref, type Ref, onMounted, computed } from 'vue'
import { useDebounceFn } from '@vueuse/core'
import { useSelectedDateStore } from '@/app/stores/selectedDate'
import MonthCalendar from '../MonthCalendar/MonthCalendar.vue'
import { useNotesKeys } from '@/composables/useNotes'
import { format, startOfISOWeek, endOfISOWeek } from 'date-fns'
import { ru } from 'date-fns/locale'
import BaseIndicator from '../BaseIndicator/BaseIndicator.vue'

type PeriodType = 'day' | 'week' | 'month' | 'year'
type EditorData = Record<PeriodType, string>

const viewType: Ref<PeriodType> = ref('day')

const changeViewType = (type: PeriodType) => {
  viewType.value = type
}

const saveEditorData = useDebounceFn((key, value) => {
  localStorage.setItem(key, value)
}, 500)

const selectedDateStore = useSelectedDateStore()

const keysManager = useNotesKeys()

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
    const key = keysManager.getCurrentKeys(selectedDateStore.selectedDate)[viewType.value]

    editorData.value[viewType.value] = editor.getHTML()
    saveEditorData(key, JSON.stringify(editor.getJSON()))
  },
})

function initializeEditorData() {
  const currentKeys = keysManager.getCurrentKeys(selectedDateStore.selectedDate)

  Object.keys(editorData.value).forEach((type) => {
    const key = currentKeys[type as PeriodType]
    const note = keysManager.getNote(key)
    if (note) {
      editorData.value[type as PeriodType] = JSON.parse(note)
    } else {
      editorData.value[type as PeriodType] = ''
    }
  })
}

onMounted(() => {
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

const DATE_FORMATS = {
  day: 'd MMMM yyyy',
  week: 'd',
  month: 'LLLL yyyy',
  year: 'yyyy',
}

const formatStrategies = {
  day: (date: Date) => format(date, DATE_FORMATS.day, { locale: ru }),
  week: (date: Date) => formatWeekRange(date),
  month: (date: Date) => format(date, DATE_FORMATS.month, { locale: ru }),
  year: (date: Date) => format(date, DATE_FORMATS.year, { locale: ru }),
}

const formattedDate = computed(() => {
  const date = selectedDateStore.selectedDate
  const strategy = formatStrategies[viewType.value]

  return strategy ? strategy(date) : ''
})

function formatWeekRange(date: Date) {
  const startDate = format(startOfISOWeek(date), DATE_FORMATS.week, { locale: ru })
  const endDate = format(endOfISOWeek(date), DATE_FORMATS.week, { locale: ru })
  const month = format(endOfISOWeek(date), 'MMM', { locale: ru })
  const year = format(endOfISOWeek(date), 'yyyy', { locale: ru })
  return `${startDate} — ${endDate} ${month} ${year}`
}
</script>

<template>
  <div class="grid h-dvh grid-rows-[auto_1fr]">
    <div class="flex justify-between p-5">
      <RouterLink to="/yearView" class="text-gray-300">{{ formattedDate }}</RouterLink>
      <div class="flex gap-4">
        <button
          class="relative text-gray-300 transition-colors"
          :class="[{ 'text-orange-600': viewType === 'day' }]"
          @click="changeViewType('day')"
        >
          <BaseIndicator
            v-if="
              keysManager.getNote(keysManager.getKeyByType('day', selectedDateStore.selectedDate))
            "
            :customClass="'absolute top-0 right-0'"
          />
          день
        </button>
        <button
          class="relative text-gray-300 transition-colors"
          :class="[{ 'text-orange-600': viewType === 'week' }]"
          @click="changeViewType('week')"
        >
          <BaseIndicator
            v-if="
              keysManager.getNote(keysManager.getKeyByType('week', selectedDateStore.selectedDate))
            "
            :customClass="'absolute top-0 right-0'"
          />
          неделя
        </button>
        <button
          class="relative text-gray-300 transition-colors"
          :class="[{ 'text-orange-600': viewType === 'month' }]"
          @click="changeViewType('month')"
        >
          <BaseIndicator
            v-if="
              keysManager.getNote(keysManager.getKeyByType('month', selectedDateStore.selectedDate))
            "
            :customClass="'absolute top-0 right-0'"
          />
          месяц
        </button>
        <button
          class="relative text-gray-300 transition-colors"
          :class="[{ 'text-orange-600': viewType === 'year' }]"
          @click="changeViewType('year')"
        >
          <BaseIndicator
            v-if="
              keysManager.getNote(keysManager.getKeyByType('year', selectedDateStore.selectedDate))
            "
            :customClass="'absolute top-0 right-0'"
          />
          год
        </button>
      </div>
    </div>
    <div class="grid grid-rows-[1fr_auto_auto] gap-4">
      <template v-if="editor">
        <editor-content :editor="editor" class="editor-content" />
        <div class="mt-auto flex justify-center gap-4 bg-white py-3" style="touch-action: none">
          <button
            @click="editor.chain().focus().toggleBold().run()"
            :class="['rounded px-4 py-2', { 'bg-gray-200 font-bold': editor.isActive('bold') }]"
            aria-label="Bold"
          >
            <LucideBold :size="20" />
          </button>
          <button
            @click="editor.chain().focus().toggleItalic().run()"
            :class="['rounded px-4 py-2', { 'bg-gray-200 font-bold': editor.isActive('italic') }]"
            aria-label="Italic"
          >
            <LucideItalic :size="20" />
          </button>
          <button
            @click="editor.chain().focus().toggleTaskList().run()"
            :class="['rounded px-4 py-2', { 'bg-gray-200 font-bold': editor.isActive('taskList') }]"
            aria-label="Task List"
          >
            <SquareCheck :size="20" />
          </button>
        </div>
      </template>
      <MonthCalendar />
    </div>
  </div>
</template>

<style>
.tiptap ul[data-type='taskList'] li {
  display: flex;
  align-items: center;
}

.tiptap.ProseMirror {
  height: 100%;
  outline: none;
  padding: 20px;
  font-size: 20px;
}

.tiptap > p {
  padding-left: 10px;
}

.checkbox {
  position: relative;
  background: transparent;
}
.check {
  width: 50px;
  height: 50px;
  position: absolute;
  opacity: 0;
}
.path1 {
  stroke-dasharray: 400;
  stroke-dashoffset: 400;
  transition: 0.3s all;
}
.path2 {
  stroke-dasharray: 1800;
  stroke-dashoffset: 1800;
  transition: 0.3s all;
}
.check:checked + label svg g path {
  stroke-dashoffset: 0;
}
</style>
