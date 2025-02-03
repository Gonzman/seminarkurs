import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useEscapeStore = defineStore('escape', () => {
  const state = ref(false)

  return { state}
})
