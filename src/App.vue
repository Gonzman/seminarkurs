<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import EscapeView from './views/overlays/escapeView.vue'
import { useGameStore } from './stores/game'
import { RouterView } from 'vue-router'
import Stevie from './components/Stevie.vue'

const gameStore = useGameStore()

const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
        gameStore.toggleEscape()
    }
}

const isDarkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

onMounted(() => {
    document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress)
})

// Draggable functionality
const stevieRef = ref<HTMLElement | null>(null)
const posX = ref(100) // initial X position
const posY = ref(100) // initial Y position
let offsetX = 0
let offsetY = 0
let animationFrameId: number | null = null

const onDragStart = (e: MouseEvent) => {
    if (stevieRef.value) {
        offsetX = e.clientX - stevieRef.value.getBoundingClientRect().left
        offsetY = e.clientY - stevieRef.value.getBoundingClientRect().top
        document.addEventListener('mousemove', onDrag)
        document.addEventListener('mouseup', onDragEnd)
    }
}

const onDrag = (e: MouseEvent) => {
    if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => {
            posX.value = e.clientX - offsetX
            posY.value = e.clientY - offsetY
            animationFrameId = null
        })
    }
}

const onDragEnd = () => {
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', onDragEnd)
    if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId)
        animationFrameId = null
    }
}
</script>

<template>
    <div v-if="gameStore.escapeState" class="overlay">
        <EscapeView></EscapeView>
    </div>
    <RouterView></RouterView>
    <div ref="stevieRef" class="stevie" @mousedown="onDragStart" :style="{ top: posY + 'px', left: posX + 'px' }">
        <Stevie v-if="gameStore.gameState != 'intro'" />
    </div>
</template>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
}

.stevie {
    position: fixed;
    z-index: 1000;
    cursor: grab;
    transition: top 0.05s ease-out, left 0.05s ease-out;
}
</style>
