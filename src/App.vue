<script setup lang="ts">
import { ref, onMounted, onUnmounted, reactive } from 'vue'
import Graph from '@/views/main/Graph.vue'
import escapeView from './views/overlays/escapeView.vue'
import { useEscapeStore } from './stores/escape'
import { RouterView } from 'vue-router'

// Make 'esc' reactive
const escapeStore = useEscapeStore()

const handleKeyPress = (e: KeyboardEvent) => {
    if (e.code === 'Escape') {
        escapeStore.state = !escapeStore.state
    }
}

const isDarkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)

onMounted(() => {
    document.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyPress)
})
</script>

<template>
    <div v-if="escapeStore.state" class="overlay">
        <escapeView></escapeView>
    </div>
    <Graph></Graph>
</template>

<style scoped>
.overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
}
</style>
