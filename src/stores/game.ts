/* eslint-disable @typescript-eslint/no-unused-vars */
import { set } from '@vueuse/core'
import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'
import { useKnowledgeStore } from './knowledge'
import { useStevieStore } from './stevie'
import type { scenes } from '@/views/scenes/scenes'

export const useGameStore = defineStore('game', () => {
    const escapeState = ref(false)
    const gameState: Ref<GameStateType> = ref('scene')
    const watchedIntro = ref(false)

    const minigameNode: Ref<string> = ref('')

    const router = useRouter()
    const knowledgeStore = useKnowledgeStore()
    const stevie = useStevieStore()
    const minigameWin = ref(false)

    const dangerLevel = ref(0)

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
            case 'scene':
            case 'wire':
                stevie.setVisible(false)
                break
            default:
                stevie.setVisible(true)
                break
        }
    }

    function getGameState() {
        return gameState
    }

    function setMinigameWin(value: boolean) {
        minigameWin.value = value

        if (minigameNode.value == '7Fx5i') {
            router.push('/scenes/outro3')
            return
        }
        if (!value) {
            knowledgeStore.gameFailed()

            if (minigameNode.value == 'HrBHB' || minigameNode.value == '8vHeQ') {
                router.push('/scenes/outro2')
                return
            }

            router.push('/graph')
            const lossKey = `loss_${minigameNode.value}`
            const losses = localStorage.getItem(lossKey)
            dangerLevel.value++
            if (losses == null) {
                localStorage.setItem(lossKey, '1')
            } else {
                let lossCount = Number(losses)
                lossCount++
                localStorage.setItem(lossKey, lossCount.toString())

                if (lossCount >= 3) {
                    router.push('/scenes/outro1')
                }
            }

            if (dangerLevel.value >= 6) {
                router.push('/scenes/outro1')
            }
        } else {
            //TODO: losscount to localstorage
            const gameKnowledges = knowledgeStore.getGameKnowledges()
            if (gameKnowledges.length == 0) {
                setTimeout(() => {
                    router.push('/graph')
                }, 1000)
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

    return {
        escapeState,
        toggleEscape,
        getEscape,
        gameState,
        setGameState,
        getGameState,
        watchedIntro,
        setMinigameWin,
        getMinigameWin,
        setLastMinigameNode,
        getLastMinigameNode,
    }
})
const gameStateArray = [
    'graph',
    'circuitbreaker',
    'ceasar',
    'finger',
    'wire',
    'tinder',
    'scene',
] as const

export type GameStateType = (typeof gameStateArray)[number]
