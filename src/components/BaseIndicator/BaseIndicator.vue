<script lang="ts" setup>
const classes = defineProps<{
  customClass?: string
}>()
</script>

<template>
  <div :class="classes.customClass" class="size-[5px] rounded-full bg-orange-600"></div>
</template>
