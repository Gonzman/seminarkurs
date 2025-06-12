import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import stevie from '@/data/stevie.json'

export const useStevieStore = defineStore('stevie', () => {
    const stevieState: Ref<StevieStateType> = ref('normal')
    const watchedIntro = ref(false)
    const isVisible = ref(false)

    const monolog: Ref<Monolog | null> = ref(null)

    function triggerMonolog(title: string) {
        const searchMonolog = stevie.monolog.find((item) => {
            if (item.title == title) {
                return item
            }
        })
        if (searchMonolog != undefined) {
            monolog.value = searchMonolog
        } else {
            alert('Wrong monolog Title')
        }
    }

    function getMonolog() {
        return monolog
    }

    function clearMonolog() {
        monolog.value = null
    }

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

    return {
        stevieState,
        setStevieMood,
        getStevie,
        watchedIntro,
        setVisible,
        getVisible,
        getMonolog,
        triggerMonolog,
        clearMonolog,
    }
})

const stevieStateArray = ['normal', 'angry', 'happy', 'sad', 'confused', 'scared'] as const

export type StevieStateType = (typeof stevieStateArray)[number]

export type Monolog = (typeof stevie.monolog)[number]
