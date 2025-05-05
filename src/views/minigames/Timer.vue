<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useGameStore } from '@/stores/game'
import { onUnmounted, ref, computed } from 'vue'
const props = defineProps<{ sekunden: number; fertig?: boolean }>()
const emits = defineEmits(['timeOver'])
const timer = ref<number>(props.sekunden)
let interval: number
const max: number = props.sekunden
let firstClick: boolean = false
const escapeStore = useGameStore()

const progressPercentage = computed(() => {
  return (timer.value / max) * 100
})

function addTime(seconds: number) {
  timer.value += seconds
}

function clickEvent() {
    if (!firstClick) {
        firstClick = !firstClick
        interval = setInterval(() => {
            if (!escapeStore.escapeState) {
                timer.value--
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

defineExpose({
  addTime
})
</script>

<template>
    <div class="timer">
        <div for="timer-bar">
            <span :style="{ color: timer % 2 === 0 && timer < 30 ? 'red' : '' }">{{ timer }}s</span>
        </div>
        <div class="win95-progress-container">
            <div
                class="win95-progress-bar"
                :style="{ width: `${progressPercentage}%` }">
            </div>
        </div>
    </div>
</template>

<style scoped>
.timer {
    margin-top: 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: 'Pixel';
}

.win95-progress-container {
    width: 15%;
    min-width: 150px;
    height: 30px;
    border: 2px solid;
    margin-top: 10px;
    border-color: #808080 #fff #fff #808080;
    padding: 1px;
    position: relative;
    overflow: hidden;
}

.win95-progress-bar {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background-color: #0000aa;
    transition: width 0.3s linear;
}
</style>
