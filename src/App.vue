<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import EscapeView from './views/overlays/EscapeView.vue'
import { useGameStore } from './stores/game'
import { RouterView } from 'vue-router'
import Stevie from './components/Stevie.vue'
// Make 'esc' reactive
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
let offsetX = 0
let offsetY = 0

const onDragStart = (e: MouseEvent) => {
    if (stevieRef.value) {
        offsetX = e.clientX - stevieRef.value.getBoundingClientRect().left
        offsetY = e.clientY - stevieRef.value.getBoundingClientRect().top
        document.addEventListener('mousemove', onDrag)
        document.addEventListener('mouseup', onDragEnd)
    }
}

const onDrag = (e: MouseEvent) => {
    if (stevieRef.value) {
        stevieRef.value.style.left = `${e.clientX - offsetX}px`
        stevieRef.value.style.top = `${e.clientY - offsetY}px`
    }
}

const onDragEnd = () => {
    document.removeEventListener('mousemove', onDrag)
    document.removeEventListener('mouseup', onDragEnd)
}
</script>

<template>
    <div v-if="gameStore.escapeState" class="overlay">
        <EscapeView></EscapeView>
    </div>
    <RouterView></RouterView>
    <div ref="stevieRef" class="stevie" @mousedown="onDragStart">
        <Stevie v-if="gameStore.gameState != 'intro'"></Stevie>
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
    position: absolute;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    cursor: grab;
}
</style>
