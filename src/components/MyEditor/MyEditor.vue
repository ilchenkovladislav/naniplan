<script setup lang="ts">
import { toRef } from 'vue'

import { EditorContent, type Editor } from '@tiptap/vue-3'

import EditorToolbar from '../EditorToolbar/EditorToolbar.vue'

const props = defineProps<{
  editor: Editor | undefined
}>()

const editor = toRef(props, 'editor')

const commands = {
  toggleBold: () => editor.value?.chain().focus().toggleBold().run(),
  toggleItalic: () => editor.value?.chain().focus().toggleItalic().run(),
  toggleTaskList: () => editor.value?.chain().focus().toggleTaskList().run(),
  isActive: (type: string) => editor.value?.isActive(type),
}
</script>

<template>
  <template v-if="editor">
    <EditorContent :editor="editor" class="editor-content" />
    <EditorToolbar :commands="commands" />
  </template>
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
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  transition: 0.3s all;
}
.check:checked + label svg g path {
  stroke-dashoffset: 0;
}
</style>
