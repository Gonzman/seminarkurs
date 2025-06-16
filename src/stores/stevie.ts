import { defineStore } from 'pinia'
import { ref, type Ref } from 'vue'
import stevie from '@/data/stevie.json'

export const useStevieStore = defineStore('stevie', () => {
    const stevieState: Ref<StevieStateType> = ref('normal')
    const watchedIntro = ref(false)
    const isVisible = ref(false)

    const monolog: Ref<Monolog | null> = ref(null)

    function triggerMonolog(title: string) {
        const searchMonolog = stevie.monolog.find((item) => item.title === title)
        if (searchMonolog) {
            console.log(searchMonolog)
            monolog.value = searchMonolog
        } else {
            alert('Fehler: Monolog')
        }
    }

    function triggerSad() {
        triggerMonolog('Sad' + Math.floor(Math.random() * 4 + 1))
    }

    function triggerHappy() {
        triggerMonolog('Happy' + Math.floor(Math.random() * 4 + 1))
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
        monolog,
        getMonolog,
        setStevieMood,
        getStevie,
        watchedIntro,
        setVisible,
        getVisible,
        triggerMonolog,
        clearMonolog,
        triggerHappy,
        triggerSad,
    }
})

const stevieStateArray = ['normal', 'angry', 'happy', 'sad', 'confused', 'scared'] as const

export type StevieStateType = (typeof stevieStateArray)[number]

export type Monolog = (typeof stevie.monolog)[number]
