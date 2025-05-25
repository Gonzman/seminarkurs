/* eslint-disable @typescript-eslint/no-unused-vars */
import Stevie from '@/components/Stevie.vue'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { useStevieStore } from './stevie'

export const useGameStore = defineStore('game', () => {
    const escapeState = ref(false)
    const gameState: Ref<GameStateType> = ref('intro')
    const watchedIntro = ref(false)
    const stevie = useStevieStore()

    function toggleEscape() {
        escapeState.value = !escapeState.value
    }

    function getEscape() {
        return escapeState
    }

    function setGameState(value: GameStateType) {
        gameState.value = value

        switch (value) {
            case 'circuitbreaker':
            case 'intro':
            case 'wire':
                stevie.setVisible(false)
                break
        }
    }

    function getGameState() {
        return gameState
    }

    return {
        escapeState,
        toggleEscape,
        getEscape,
        gameState,
        setGameState,
        getGameState,
        watchedIntro,
    }
})
const gameStateArray = [
    'intro',
    'graph',
    'circuitbreaker',
    'ceaser',
    'finger',
    'wire',
    'tinder',
] as const

export type GameStateType = (typeof gameStateArray)[number]
