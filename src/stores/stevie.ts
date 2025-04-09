import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useStevieStore = defineStore('stevie', () => {
    const stevieState: Ref<StevieStateType> = ref('normal')
    const watchedIntro = ref(false)

    function getStevie() {
        return stevieState
    }

    function setStevie(value: StevieStateType) {
        stevieState.value = value
    }

    return { getStevie, setStevie }
})

const stevieStateArray = ['normal', 'angry', 'happy', 'sad', 'confused', 'scared'] as const

export type StevieStateType = (typeof stevieStateArray)[number]
