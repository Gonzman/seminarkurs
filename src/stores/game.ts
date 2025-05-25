/* eslint-disable @typescript-eslint/no-unused-vars */
import { set } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useKnowledgeStore } from './knowledge'
import { useStevieStore } from './stevie'

export const useGameStore = defineStore('game', () => {
    const escapeState = ref(false)
    const gameState: Ref<GameStateType> = ref('intro')
    const watchedIntro = ref(false)

    const minigameNode: Ref<string> = ref("")

    const router = useRouter()
    const knowledgeStore = useKnowledgeStore()
    const stevie = useStevieStore()
    const minigameWin = ref(false);

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

    function setMinigameWin(value: boolean) {
        minigameWin.value = value

        if(!value) {
            knowledgeStore.gameFailed()
            router.push('/graph')
        }else {
            if (knowledgeStore.getGameKnowledges().length == 0) {
                router.push('/graph')
                return
            }
            router.push('/infotinder')
        }
    }

    function getMinigameWin() {
        return minigameWin.value
    }

    function setLastMinigameNode(node: string) {
        minigameNode.value = node
    }

    function getLastMinigameNode() {
        return minigameNode.value
    }

    return { escapeState, toggleEscape, getEscape, gameState, setGameState, getGameState, watchedIntro, setMinigameWin, getMinigameWin, setLastMinigameNode, getLastMinigameNode }
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
