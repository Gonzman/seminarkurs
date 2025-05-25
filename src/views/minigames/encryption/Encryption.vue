<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <Timer :sekunden="start" :fertig="finished" ref="timer" />
    <div class="encryption-container">
        <h1>{{ encryptSelectedWord }}</h1>
        <fieldset>
            <div v-for="(char, index) in encryptSelectedWord.length" :key="index">
                <div>
                    <input
                        ref="inputs"
                        type="text"
                        maxlength="1"
                        autofocus
                        @input="onInputChange($event, index)"
                    />
                </div>
            </div>
        </fieldset>

        <div class="button-container">
            <button class="reset-button" @click="reset">
                <p style="font-family: 'Pixel'; color: white;">Reset</p>
            </button>
            <button class="confirm-button" @click="checkAnswer">
                <p style="font-family: 'Pixel'; color: black;">Confirm</p>
            </button>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Timer from '../Timer.vue'
import { useGameStore } from '@/stores/game'

const inputs = ref<HTMLInputElement[]>([])
const finished = ref(false)
const timer = ref<InstanceType<typeof Timer> | null>(null)
const start: number = 100
const gameStore = useGameStore()

function caesarCipher(str: string, shift: number, decrypt: boolean = false): string {
    const s = decrypt ? (26 - shift) % 26 : shift
    const n = s > 0 ? s : 26 + (s % 26)
    return [...str]
        .map((l, i) => {
            const c = str.charCodeAt(i)
            if (c >= 65 && c <= 90) return String.fromCharCode(((c - 65 + n) % 26) + 65)
            if (c >= 97 && c <= 122) return String.fromCharCode(((c - 97 + n) % 26) + 97)
            if (c >= 48 && c <= 57) return l
            return l
        })
        .join('')
}

function reset() {
    for (const inputL of inputs.value) {
        inputL.value = ''
    }

    inputs.value[0].focus()
}

function onInputChange(event: Event, index: number) {
    const input = event.target as HTMLInputElement
    input.value = input.value.replace(/[^a-zA-Z0-9]/g, '')

    if (input.value && inputs.value[index + 1]) {
        inputs.value[index + 1].focus()
    }
}

function checkAnswer() {
    let userInput: string = ''
    for (const inputElement of inputs.value) {
        userInput += inputElement.value
    }
    if (userInput == selectedWord) {
        finished.value = true
        gameStore.setMinigameWin(true);
    } else if (timer.value) {
        timer.value.addTime(-5)
    }
}

const wordList: string[] = ['WhoAreYou', 'DDoS', 'Overflow']

const selectedWord = wordList[Math.floor(Math.random() * wordList.length)]
const encryptSelectedWord = caesarCipher(selectedWord, Math.floor(Math.random() * 25))
</script>

<style scoped>
.encryption-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
}

h1 {
    text-align: center;
}

fieldset {
    display: flex;
    column-gap: 0.5rem;
    justify-content: center;
    border: none;
    padding: 0;
    margin: 2rem 0;
}
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    border: 0;
}
input {
    border-radius: 8px;
    border: 2px solid var(--green);
    padding: 0.75rem 0.5rem;
    font-size: 1rem;
    font-weight: 700;
    text-align: center;
    width: 45px;
    font-family: inherit;
}
input:focus,
input:focus-within {
    border: none;
    outline-color: var(--green);
    box-shadow: 1px 2px 13px 4px var(--green);
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

input[type='number'] {
    appearance: textfield;
    -moz-appearance: textfield;
}
.btn-wrapper {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    margin-top: 2rem;
}
#paste-btn {
    color: var(--green);
}

.button-container {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
}

button {
    display: flex;
    justify-content: center;
    align-items: center;
    text-align: center;
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    border: none;
    box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
    transition:
        transform 0.2s,
        box-shadow 0.2s;
}

.reset-button {
    background-color: red;
    color: white;
}

.confirm-button {
    background-color: var(--green);
    color: black;
}

button:hover {
    transform: translateY(-2px);
    box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.15);
}
</style>
