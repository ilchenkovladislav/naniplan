<script setup lang="ts">
import { useEditor, EditorContent } from '@tiptap/vue-3'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { Bold as LucideBold, Italic as LucideItalic, SquareCheck } from 'lucide-vue-next'

const editor = useEditor({
  extensions: [
    Document.extend({ content: 'block+' }),
    Paragraph,
    Text,
    Bold,
    Italic,
    TaskList,
    TaskItem.extend({
      content: 'paragraph',
    }),
  ],
})
</script>

<template>
  <template v-if="editor">
    <editor-content :editor="editor" class="editor-content h-dvh" />
    <div
      class="fixed bottom-0 left-0 right-0 z-50 bg-white flex justify-center gap-4 py-3"
      style="touch-action: none"
    >
      <button
        @click="editor.chain().focus().toggleBold().run()"
        :class="['px-4 py-2 rounded', { 'bg-gray-200 font-bold': editor.isActive('bold') }]"
        aria-label="Bold"
      >
        <LucideBold :size="20" />
      </button>
      <button
        @click="editor.chain().focus().toggleItalic().run()"
        :class="['px-4 py-2 rounded', { 'bg-gray-200 font-bold': editor.isActive('italic') }]"
        aria-label="Italic"
      >
        <LucideItalic :size="20" />
      </button>
      <button
        @click="editor.chain().focus().toggleTaskList().run()"
        :class="['px-4 py-2 rounded', { 'bg-gray-200 font-bold': editor.isActive('taskList') }]"
        aria-label="Task List"
      >
        <SquareCheck :size="20" />
      </button>
    </div>
  </template>
</template>

<style>
.tiptap ul[data-type='taskList'] li {
  display: flex;
  align-items: center;
}

.tiptap ul[data-type='taskList'] li > label {
  margin-right: 0.5rem;
  user-select: none;
  width: 24px;
  height: 24px;
}

.tiptap ul[data-type='taskList'] input[type='checkbox'] {
  cursor: pointer;
  width: 100%;
  height: 100%;
}

.tiptap.ProseMirror {
  height: 100%;
  outline: none;
  padding: 20px;
  font-size: 20px;
}
</style>
