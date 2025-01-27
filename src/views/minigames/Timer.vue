<script setup lang="ts">
import { onUnmounted, ref } from 'vue'
const props = defineProps<{ sekunden: number; fertig: Boolean }>()
const emits = defineEmits(['timeOver'])
const timer = ref<number>(props.sekunden)
let interval: number
const max: number = props.sekunden
let firstClick: boolean = false

function clickEvent() {
  if (!firstClick) {
    firstClick = !firstClick
    interval = setInterval(() => {
      timer.value--

      if (props.fertig) {
        clearInterval(interval)
      }

      if (timer.value <= -1) {
        clearInterval(interval)
        emits('timeOver')
      }
    }, 1000)
  }
}

document.addEventListener('click', clickEvent)
document.addEventListener('keypress', clickEvent)

onUnmounted(() => clearInterval(interval))
</script>

<template>
  <div class="timer">
    <div for="timer-bar">
      <span :style="{ color: timer % 2 === 0 && timer < 30 ? 'red' : '' }">{{ timer }}s</span>
    </div>
    <progress :value="timer" :max="max" id="timer-bar"></progress>
  </div>
</template>

<style scoped>
.timer {
  text-align: center;
}
</style>
