<script lang="ts" setup>
import { onMounted, ref } from 'vue'

const input = ref()
const checked = ref(localStorage.getItem('theme') === 'dark')

onMounted(() => {
  document.documentElement.className = checked.value ? 'dark' : ''
  setStatusBarColor(checked.value ? 'oklch(27.9% 0.041 260.031)' : '#fff')
})

function toggleTheme() {
  const theme = document.documentElement.className

  if (theme === 'dark') {
    checked.value = true
    localStorage.setItem('theme', 'light')
    setStatusBarColor('#fff')
  } else {
    checked.value = false
    localStorage.setItem('theme', 'dark')
    setStatusBarColor('oklch(27.9% 0.041 260.031)')
  }

  document.documentElement.classList.toggle('dark')
}

function setStatusBarColor(color: string) {
  const meta =
    document.getElementById('theme-color-meta') ||
    document.querySelector('meta[name="theme-color"]')

  if (meta) meta.setAttribute('content', color)

  document.documentElement.style.backgroundColor = color
}
</script>

<template>
  <label class="relative inline-flex cursor-pointer items-center">
    <input :checked :ref="input" class="peer sr-only" type="checkbox" />
    <div
      @click="toggleTheme"
      class="h-7 w-14 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 transition-all duration-500 peer-checked:from-blue-400 peer-checked:to-indigo-500 after:absolute after:top-1 after:left-1 after:flex after:h-5 after:w-5 after:items-center after:justify-center after:rounded-full after:bg-white after:text-sm after:shadow-md after:transition-all after:duration-500 after:content-['☀️'] peer-checked:after:translate-x-7 peer-checked:after:content-['🌙']"
    ></div>
  </label>
</template>
