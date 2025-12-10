<script setup lang="ts">
import { onMounted, type Ref, ref, watch } from 'vue'

import { useDebounceFn } from '@vueuse/core'

import { useNotesKeys } from '@/composables/useNotes'
import { useSelectedDateStore } from '@/app/stores/selectedDate'

import MyEditor from '@/components/MyEditor/MyEditor.vue'
import MonthCalendar from '@/components/EditorCalendar/EditorCalendar.vue'
import EditorDate from '@/components/EditorDate/EditorDate.vue'
import EditorPeriodSwitcher from '@/components/EditorPeriodSwitcher/EditorPeriodSwitcher.vue'

import { useEditor } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import TaskList from '@tiptap/extension-task-list'

import { TaskItemCustom } from '@/components/MyEditor/TaskItemCustom'

import type { EditorData, PeriodType } from './model/types'

const initViewType = (localStorage.getItem('viewType') as PeriodType) ?? 'day'
const viewType: Ref<PeriodType> = ref(initViewType)

const changeViewType = (type: PeriodType) => {
  viewType.value = type
  localStorage.setItem('viewType', type)
}

const keysManager = useNotesKeys()
const selectedDateStore = useSelectedDateStore()

const notes = ref({
  day: keysManager.getNote(keysManager.getKeyByType('day', selectedDateStore.selectedDate)),
  week: keysManager.getNote(keysManager.getKeyByType('week', selectedDateStore.selectedDate)),
  month: keysManager.getNote(keysManager.getKeyByType('month', selectedDateStore.selectedDate)),
  year: keysManager.getNote(keysManager.getKeyByType('year', selectedDateStore.selectedDate)),
})

const saveEditorData = useDebounceFn((value: string, isEmpty = false) => {
  const key = keysManager.getCurrentKeys(selectedDateStore.selectedDate)[viewType.value]

  if (isEmpty) {
    localStorage.removeItem(key)
  } else {
    localStorage.setItem(key, value)
  }

  notes.value = {
    day: keysManager.getNote(keysManager.getKeyByType('day', selectedDateStore.selectedDate)),
    week: keysManager.getNote(keysManager.getKeyByType('week', selectedDateStore.selectedDate)),
    month: keysManager.getNote(keysManager.getKeyByType('month', selectedDateStore.selectedDate)),
    year: keysManager.getNote(keysManager.getKeyByType('year', selectedDateStore.selectedDate)),
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
</script>

<template>
  <div
    class="fixed inset-0 grid grid-rows-[auto_1fr_auto_auto] [&>*:nth-child(2)]:min-h-0 [&>*:nth-child(2)]:overflow-y-auto"
  >
    <div class="flex justify-between p-5">
      <EditorDate :viewType />
      <EditorPeriodSwitcher
        :viewType
        :indicator="{
          day: !!notes.day,
          week: !!notes.week,
          month: !!notes.month,
          year: !!notes.year,
        }"
        :onChangeViewType="changeViewType"
      />
    </div>
    <MyEditor
      :editor="editor"
    />
    <MonthCalendar />
  </div>
</template>
