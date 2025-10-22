<script lang="ts" setup>
import { Bold as LucideBold, Italic as LucideItalic, SquareCheck } from 'lucide-vue-next'

const { commands } = defineProps<{
  commands: {
    toggleBold: () => boolean | undefined
    toggleItalic: () => boolean | undefined
    toggleTaskList: () => boolean | undefined
    isActive: (type: string) => boolean | undefined
  }
}>()
</script>

<template>
  <div class="mt-auto flex justify-center gap-4 bg-white py-3" style="touch-action: none">
    <button
      @click="commands.toggleBold()"
      :class="['rounded px-4 py-2', { 'bg-gray-200 font-bold': commands.isActive('bold') }]"
      aria-label="Bold"
    >
      <LucideBold :size="20" />
    </button>
    <button
      @click="commands.toggleItalic()"
      :class="['rounded px-4 py-2', { 'bg-gray-200 font-bold': commands.isActive('italic') }]"
      aria-label="Italic"
    >
      <LucideItalic :size="20" />
    </button>
    <button
      @click="commands.toggleTaskList()"
      :class="['rounded px-4 py-2', { 'bg-gray-200 font-bold': commands.isActive('taskList') }]"
      aria-label="Task List"
    >
      <SquareCheck :size="20" />
    </button>
  </div>
</template>
