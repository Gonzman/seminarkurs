import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useGameStore = defineStore('game', () => {
    const escapeState = ref(false)
    const gameState: Ref<GameStateType> = ref('intro')
    const watchedIntro = ref(false)

    function toggleEscape() {
        escapeState.value = !escapeState.value
    }

    function getEscape() {
        return escapeState
    }

    return { escapeState, toggleEscape, getEscape, gameState }
})
const gameStateArray = [
    'intro',
    'selectScreen',
    'circuitbreaker',
    'ceaser',
    'finger',
    'wire',
] as const

export type GameStateType = (typeof gameStateArray)[number]
