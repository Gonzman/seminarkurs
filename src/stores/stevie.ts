import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'

export const useStevieStore = defineStore('stevie', () => {
    const stevieState: Ref<StevieStateType> = ref('normal')
    const watchedIntro = ref(false)


    function setStevie(value: StevieStateType) {
        stevieState.value = value
    }

    function getStevie() {
        return stevieState
    }

    return { stevieState, setStevie, getStevie, watchedIntro }
})

const stevieStateArray = ['normal', 'angry', 'happy', 'sad', 'confused', 'scared'] as const

export type StevieStateType = (typeof stevieStateArray)[number]
