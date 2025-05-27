<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import EscapeView from './views/overlays/EscapeView.vue'
import { useGameStore } from './stores/game'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Stevie from './components/Stevie.vue'

const gameStore = useGameStore()
const route = useRoute()
const router = useRouter()
const showContextMenu = ref(false)

const transitionName = computed(() => {
    return route.meta.transition || 'fade'
})

function navigateToStevieGenerator() {
    router.push('/stevie-generator')
    showContextMenu.value = false
}

const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
        gameStore.toggleEscape()
    }
}

const isDarkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

onMounted(() => {
    document.addEventListener('keydown', handleKeyPress)
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress)
    document.removeEventListener('click', handleClickOutside)
})

const stevieRef = ref<HTMLElement | null>(null)
const posX = ref(100)
const posY = ref(100)
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

// Close context menu when clicking outside
const handleClickOutside = (e: MouseEvent) => {
    if (showContextMenu.value && stevieRef.value && !stevieRef.value.contains(e.target as Node)) {
        showContextMenu.value = false
    }
}
</script>

<template>
    <div v-if="gameStore.escapeState" class="overlay">
        <EscapeView></EscapeView>
    </div>
    <transition name="fade" mode="out-in">
        <router-view></router-view>
    </transition>    <div ref="stevieRef" class="stevie" @mousedown="onDragStart" @contextmenu.prevent="showContextMenu = true" :style="{ top: posY + 'px', left: posX + 'px' }">
        <Stevie v-if="gameStore.gameState != 'intro'" />
        <div v-if="showContextMenu" class="context-menu" @click.stop>
            <div class="menu-item" @click="navigateToStevieGenerator">Stevie Generator</div>
            <div class="menu-item" @click="showContextMenu = false">Close</div>
        </div>
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
    z-index: 999;
    cursor: grab;
    transition: top 0.05s ease-out, left 0.05s ease-out;
}

.context-menu {
    position: absolute;
    top: 100%;
    left: 0;
    background-color: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 5px 0;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    min-width: 150px;
}

.menu-item {
    padding: 8px 15px;
    cursor: pointer;
    font-size: 14px;
    color: #333;
    transition: background-color 0.2s;
}

.menu-item:hover {
    background-color: #f5f5f5;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

.slide-left-enter-active,
.slide-left-leave-active {
    transition: transform 0.5s ease;
}

.slide-left-enter-from {
    transform: translateX(100%);
}

.slide-left-leave-to {
    transform: translateX(-100%);
}

.slide-right-enter-active,
.slide-right-leave-active {
    transition: transform 0.5s ease;
}

.slide-right-enter-from {
    transform: translateX(-100%);
}

.slide-right-leave-to {
    transform: translateX(100%);
}

.slide-up-enter-active,
.slide-up-leave-active {
    transition: transform 0.5s ease;
}

.slide-up-enter-from {
    transform: translateY(100%);
}

.slide-up-leave-to {
    transform: translateY(-100%);
}

.slide-down-enter-active,
.slide-down-leave-active {
    transition: transform 0.5s ease;
}

.slide-down-enter-from {
    transform: translateY(-100%);
}

.slide-down-leave-to {
    transform: translateY(100%);
}
</style>
