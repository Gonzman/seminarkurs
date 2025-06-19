<!-- eslint-disable @typescript-eslint/no-unused-vars -->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue'
import EscapeView from './views/overlays/EscapeView.vue'
import { useGameStore } from './stores/game'
import { RouterView, useRoute, useRouter } from 'vue-router'
import Stevie from './components/Stevie.vue'

const gameStore = useGameStore()
const route = useRoute()
const router = useRouter()
const transitionName = computed(() => {
    return route.meta.transition || 'fade'
})

const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
        gameStore.toggleEscape()
    }
}

const isDarkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress)
    window.removeEventListener('resize', handleResize)
})

const stevieRef = ref<HTMLElement | null>(null)
const posX = ref(100)
const posY = ref(window.innerHeight - 220)
let offsetX = 0
let offsetY = 0
let animationFrameId: number | null = null

const constrainPosition = () => {
    if (stevieRef.value) {
        const stevieWidth = 200
        const stevieHeight = 200
        const speechBubblePadding = 400

        const speechBubbleElement = stevieRef.value.querySelector('.speech-bubble-container') as HTMLElement
        let speechBubbleWidth = 0
        let speechBubbleHeight = 0
        let isBubbleVisible = false

        if (speechBubbleElement) {
            const bubbleRect = speechBubbleElement.getBoundingClientRect()
            const computedStyle = window.getComputedStyle(speechBubbleElement)
            isBubbleVisible = bubbleRect.width > 0 && bubbleRect.height > 0 && computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden'

            if (isBubbleVisible) {
                speechBubbleWidth = bubbleRect.width
                speechBubbleHeight = bubbleRect.height
            }
        }

        const maxX = window.innerWidth - stevieWidth
        const maxY = window.innerHeight - stevieHeight

        let minX = 0
        let maxXWithBubble = maxX
        let minY = 0

        if (isBubbleVisible) {
            const speechBubbleHalfWidth = speechBubbleWidth / 2
            minX = Math.max(0, speechBubbleHalfWidth - (stevieWidth / 2))
            maxXWithBubble = Math.min(maxX, window.innerWidth - speechBubbleHalfWidth - (stevieWidth / 2))
            minY = Math.max(speechBubblePadding, speechBubbleHeight)
        }

        posX.value = Math.max(minX, Math.min(posX.value, maxXWithBubble))
        posY.value = Math.max(minY, Math.min(posY.value, maxY))
    }
}

const handleResize = () => {
    posY.value = window.innerHeight - 220
    constrainPosition()
}

onMounted(() => {
    document.addEventListener('keydown', handleKeyPress)
    window.addEventListener('resize', handleResize)
    posY.value = window.innerHeight - 220
    setTimeout(constrainPosition, 500)
})

watch(() => gameStore.gameState, () => {
    setTimeout(constrainPosition, 100)
}, { immediate: true })

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
            if (stevieRef.value) {
                const stevieWidth = 200
                const stevieHeight = 200
                const speechBubblePadding = 400

                const speechBubbleElement = stevieRef.value.querySelector('.speech-bubble-container') as HTMLElement
                let speechBubbleWidth = 0
                let speechBubbleHeight = 0
                let isBubbleVisible = false

                if (speechBubbleElement) {
                    const bubbleRect = speechBubbleElement.getBoundingClientRect()
                    const computedStyle = window.getComputedStyle(speechBubbleElement)
                    isBubbleVisible = bubbleRect.width > 0 && bubbleRect.height > 0 && computedStyle.display !== 'none' && computedStyle.visibility !== 'hidden'

                    if (isBubbleVisible) {
                        speechBubbleWidth = bubbleRect.width
                        speechBubbleHeight = bubbleRect.height
                    }
                }

                const maxX = window.innerWidth - stevieWidth
                const maxY = window.innerHeight - stevieHeight

                let minX = 0
                let maxXWithBubble = maxX
                let minY = 0

                if (isBubbleVisible) {
                    const speechBubbleHalfWidth = speechBubbleWidth / 2
                    minX = Math.max(0, speechBubbleHalfWidth - (stevieWidth / 2))
                    maxXWithBubble = Math.min(maxX, window.innerWidth - speechBubbleHalfWidth - (stevieWidth / 2))
                    minY = Math.max(speechBubblePadding, speechBubbleHeight)
                }

                let newX = e.clientX - offsetX
                let newY = e.clientY - offsetY

                newX = Math.max(minX, Math.min(newX, maxXWithBubble))
                newY = Math.max(minY, Math.min(newY, maxY))

                posX.value = newX
                posY.value = newY
            }
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
const audioSrc = ref('/audio/game.mp3')

const bgAudio = ref<HTMLAudioElement | null>(null)

onMounted(() => {
    document.addEventListener('click', () => {

        if (gameStore.getGameState().value == 'scene') {
            return
        }

        if (!bgAudio.value) {
            return
        }
        bgAudio.value.play().catch((err) => {
            console.warn('Autoplay blocked:', err)
        })

        bgAudio.value.volume = 0.2
    }, { once: true })
})

watch(() => gameStore.audioMute, (newVal) => {
    console.log('Audio muted')
    if (!bgAudio.value) {
        return
    }
    if (newVal) {
        bgAudio.value.pause()
        console.log('Audio muted')
    } else {
        bgAudio.value.play().catch((err) => {
            console.warn('Autoplay blocked:', err)
        })
    }
}, { immediate: true })

</script>

<template>
    <div v-if="gameStore.escapeState" class="overlay">
        <EscapeView></EscapeView>
    </div>
    <router-view></router-view>
    <div ref="stevieRef" class="stevie" @mousedown="onDragStart" :style="{ top: posY + 'px', left: posX + 'px' }">
        <Stevie
            v-if="gameStore.gameState != 'scene' && gameStore.gameState != 'circuitbreaker' && gameStore.gameState != 'wire' && gameStore.gameState != 'start'" />
    </div>
    <audio ref="bgAudio" :src="audioSrc" loop></audio>
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
