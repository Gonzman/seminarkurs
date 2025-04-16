/* eslint-disable @typescript-eslint/no-unused-vars */
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

    function setGameState(value: GameStateType) {
        gameState.value = value
    }

    function getGameState() {
        return gameState
    }

    return { escapeState, toggleEscape, getEscape, gameState, setGameState, getGameState, watchedIntro}
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
