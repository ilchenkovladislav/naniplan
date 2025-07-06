<script lang="ts" setup>
const classes = defineProps<{
  customClass?: string
}>()
</script>

<template>
  <div :class="classes.customClass" class="size-1 rounded-full bg-gray-400"></div>
</template>
