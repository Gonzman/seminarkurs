import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useStevieStore = defineStore('stevie', () => {
    const stevieState: Ref<StevieStateType> = ref('normal')
    const watchedIntro = ref(false)
    const isVisible = ref(false)

    function setStevieMood(value: StevieStateType) {
        stevieState.value = value
    }

    function getStevie() {
        return stevieState
    }

    function setVisible(state: boolean) {
        isVisible.value = state
    }

    function getVisible(): boolean {
        return isVisible.value
    }

    return { stevieState, setStevieMood, getStevie, watchedIntro, setVisible, getVisible }
})

const stevieStateArray = ['normal', 'angry', 'happy', 'sad', 'confused', 'scared'] as const

export type StevieStateType = (typeof stevieStateArray)[number]
