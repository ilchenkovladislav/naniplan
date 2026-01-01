<template>
  <div
    ref="editorRef"
    class="editor overscroll-none [overflow-anchor:none]"
    contenteditable="true"
  ></div>

  <div
    v-if="isFocused"
    class="fixed inset-x-0 bottom-0 mt-auto flex translate-y-[calc(var(--keyboard-height,0)*-1)] justify-center gap-4 bg-white py-3 will-change-transform"
    style="touch-action: none"
  >
    <button @click="toggleBold" :class="['rounded px-4 py-2', { 'bg-gray-200 font-bold': isBold }]">
      <LucideBold :size="20" />
    </button>
    <button
      @click="toggleItalic"
      :class="['rounded px-4 py-2', { 'bg-gray-200 font-bold': isItalic }]"
    >
      <LucideItalic :size="20" />
    </button>
    <button
      @click="toggleCheckList"
      :class="['rounded px-4 py-2', { 'bg-gray-200 font-bold': isCheckList }]"
    >
      <SquareCheck :size="20" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, inject } from 'vue'
import {
  $getSelection,
  $isRangeSelection,
  FORMAT_TEXT_COMMAND,
  $createParagraphNode,
  SKIP_SELECTION_FOCUS_TAG,
  $addUpdateTag,
  type LexicalEditorWithDispose,
} from 'lexical'

import { ListItemNode, INSERT_CHECK_LIST_COMMAND } from '@lexical/list'

import { $getNearestNodeOfType } from '@lexical/utils'
import { $setBlocksType } from '@lexical/selection'
import { Bold as LucideBold, Italic as LucideItalic, SquareCheck } from 'lucide-vue-next'

const editorRef = ref(null)
const isBold = ref(false)
const isItalic = ref(false)
const isCheckList = ref(false)

defineExpose({
  editorRef,
})

const { editor } = defineProps<{ editor: LexicalEditorWithDispose }>()

let unregist: () => void

onMounted(() => {
  if (!editor) return
  editor.setRootElement(editorRef.value)

  unregist = editor.registerUpdateListener(() => {
    editor.read(() => {
      updateToolbar()
    })
  })
})

const isFocused = inject('focus')

onUnmounted(() => {
  unregist?.()
})

function updateToolbar() {
  const selection = $getSelection()

  if ($isRangeSelection(selection)) {
    isBold.value = selection.hasFormat('bold')
    isItalic.value = selection.hasFormat('italic')

    const anchorNode = selection.anchor.getNode()
    const listItem = $getNearestNodeOfType(anchorNode, ListItemNode)
    isCheckList.value = listItem !== null
  }
}

function toggleBold() {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
  editorRef.value?.focus()
}

function toggleItalic() {
  editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
  editorRef.value?.focus()
}

function toggleCheckList() {
  editor.update(() => {
    const selection = $getSelection()

    if (!$isRangeSelection(selection)) return

    const anchorNode = selection.anchor.getNode()
    const listItem = $getNearestNodeOfType(anchorNode, ListItemNode)

    if (listItem) {
      $addUpdateTag(SKIP_SELECTION_FOCUS_TAG)
      $setBlocksType(selection, () => $createParagraphNode())
    } else {
      $addUpdateTag(SKIP_SELECTION_FOCUS_TAG)
      editor.dispatchCommand(INSERT_CHECK_LIST_COMMAND, undefined)
    }
  })

  editorRef.value?.focus()
}
</script>

<style>
.editor-container {
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.editor {
  min-height: 250px;
  height: 100%;
  padding: 16px;
  padding-bottom: 60px;
  outline: none;
  line-height: 1.6;
  font-size: 18px;
}

.editor-paragraph {
  margin: 0 0 8px 0;
}

.text-bold {
  font-weight: 700;
}

.text-italic {
  font-style: italic;
}

.checklist {
  list-style: none;
  padding: 0;
  margin: 8px 0;
}

.listitem {
  outline: none;
}

.listitem-checked,
.listitem-unchecked {
  position: relative;
  padding-left: 40px;
  margin: 18px 0;
  min-height: 22px;
  line-height: 22px;
}

.listitem-checked::before,
.listitem-unchecked::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 30px;
  height: 30px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.listitem-checked::before {
  background: white;
  border-color: oklch(75% 0.183 55.934);
  animation: pulse 0.4s ease;
}
.listitem::after {
  content: '';
  position: absolute;
  left: 13px;
  top: 50%;
  width: 6px;
  height: 12px;
  border: solid oklch(75% 0.183 55.934);
  border-width: 0 3px 3px 0;
  transform: translateY(-60%) rotate(45deg) scale(0);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.listitem-checked::after {
  transform: translateY(-60%) rotate(45deg) scale(1);
  opacity: 1;
}

.listitem-unchecked:hover::before {
  border-color: #6b7280;
}

@keyframes pulse {
  0% {
    transform: translateY(-50%) scale(1);
  }
  50% {
    transform: translateY(-50%) scale(1.1);
  }
  100% {
    transform: translateY(-50%) scale(1);
  }
}
</style>
