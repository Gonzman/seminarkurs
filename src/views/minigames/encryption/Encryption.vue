<template>
  <Timer :sekunden="start" :fertig="finished" />

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

  <button @click="reset" style="display: flex; text-align: center; align-self: center">
    reset
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import Timer from '../Timer.vue'

const inputs = ref<HTMLInputElement[]>([]) // Array of input elements

function caesarCipher(str: string, shift: number, decrypt: Boolean = false): string {
  const s = decrypt ? (26 - shift) % 26 : shift
  const n = s > 0 ? s : 26 + (s % 26)
  return [...str]
    .map((l, i) => {
      const c = str.charCodeAt(i)
      if (c >= 65 && c <= 90) return String.fromCharCode(((c - 65 + n) % 26) + 65)
      if (c >= 97 && c <= 122) return String.fromCharCode(((c - 97 + n) % 26) + 97)
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

let finished: boolean = false

function onInputChange(event: Event, index: number) {
  const input = event.target as HTMLInputElement
  input.value = input.value.replace(/[^a-zA-Z]/g, '') // Allow only letters

  // Move focus to the next input if the input has a value
  if (input.value && inputs.value[index + 1]) {
    inputs.value[index + 1].focus()
  }

  if (index === inputs.value.length - 1) {
    let userInput: string = ''
    for (const inputElement of inputs.value) {
      userInput += inputElement.value // Concatenate the values of all input elements
    }
    if (userInput == selectedWord) {
      finished = true
      alert('Entschlüsselt')
    }
  }
}

const start: number = 100

const wordList: string[] = ['WhoAreYou', 'DDoS', 'Overflow']

const selectedWord = wordList[Math.floor(Math.random() * wordList.length)]
const encryptSelectedWord = caesarCipher(selectedWord, Math.floor(Math.random() * 25))
</script>

<style scoped>
h1 {
  text-align: center;
}

fieldset {
  display: flex;
  column-gap: 0.5rem;
  justify-content: center;
  border: none;
  padding: 0;
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
/* To remove prev next arrow from number input */
/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
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

button {
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  margin-left: auto;
  margin-right: auto;
  margin-top: 10mm;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  border: none;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.2s,
    box-shadow 0.2s;
}

button:hover {
  transform: translateY(-2px);
  box-shadow: 0px 6px 8px rgba(0, 0, 0, 0.15);
}
</style>
