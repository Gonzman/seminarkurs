<template>
    <div class="knowledge-overlay">
        <div class="info-header">
            <slot></slot>
            <span class="info-text">Debug</span>
        </div>
        <div class="container">
            <div class="debug-section">
                <h3>Szene</h3>
                <div class="button-grid">
                    <button @click="jumpToScene('INTRO')" class="scene-btn intro-btn">
                        Intro
                    </button>
                    <button @click="jumpToScene('OUTRO1')" class="scene-btn outro-btn">
                        Outro 1
                    </button>
                    <button @click="jumpToScene('OUTRO2')" class="scene-btn outro-btn">
                        Outro 2
                    </button>
                    <button @click="jumpToScene('OUTRO3')" class="scene-btn outro-btn">
                        Outro 3
                    </button>
                    <button @click="jumpToScene('OUTRO4')" class="scene-btn outro-btn">
                        Outro 4
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

function jumpToScene(sceneName: string) {
    gameStore.escapeState = false
    router.push(`/scenes/${sceneName}/true`)
}
</script>

<style lang="css" scoped>
.knowledge-overlay {
    display: flex;
    flex-direction: column;
    height: 100vh;
    width: 100vw;
}

.info-header {
    display: flex;
    align-items: center;
    padding: 10px;
    z-index: 20;
}

.info-text {
    font-size: 20px;
    font-weight: bold;
    font-family: Pixel;
    color: white;
    margin-left: 10px;
}

.container {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.list {
    width: 30%;
    min-width: 430px;
    border-right: 1px solid var(--color-border);
    padding: 20px;
    overflow-y: auto;
    height: 100%;
}

.detail {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
}

.knowledge-header {
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.knowledge-header h2 {
    margin: 0;
    color: var(--green);
    font-family: 'Pixel', monospace;
    font-size: 1.5rem;
}

.buttons-row {
    display: flex;
    gap: 10px;
}

.buttons-row button {
    padding: 8px 12px;
    font-family: 'Pixel', monospace;
    font-size: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.add-btn {
    background-color: var(--green);
    color: black;
}

.clear-btn {
    background-color: #ff4757;
    color: white;
}

.no-knowledge {
    text-align: center;
    padding: 40px 20px;
    color: var(--color-text);
    font-style: italic;
    border: 3.5px dashed var(--color-border);
    margin: 20px 0;
}

.knowledge-list {
    list-style: none;
    padding: 0;
    margin: 0;
}

.knowledge-list li {
    padding: 12px;
    margin-bottom: 10px;
    border-radius: 6px;
    background-color: var(--color-background-mute);
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
}

.knowledge-list li:hover {
    background-color: var(--color-background);
    transform: translateX(2px);
}

.knowledge-list li.selected {
    background-color: var(--color-background);
    border-left: 3px solid var(--green);
}

.knowledge-item {
    display: flex;
    flex-direction: column;
}

.knowledge-title {
    font-weight: bold;
    margin-bottom: 5px;
    color: var(--color-heading);
}

.knowledge-source {
    font-size: 0.8rem;
    color: var(--green);
}

.heading {
    color: var(--green);
    font-family: 'Pixel', monospace;
    margin-top: 0;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--color-border);
}

.knowledge-content {
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.detail img {
    max-width: 100%;
    object-fit: contain;
    margin: 0 auto;
    border-radius: 8px;
    border: 1px solid var(--color-border);
}

.description {
    line-height: 1.6;
    font-size: 1.1rem;
}

.source {
    font-style: italic;
    opacity: 0.8;
    margin-top: 20px;
    padding-top: 10px;
    border-top: 1px dashed var(--color-border);
}

.source-list {
    list-style: none;
    padding: 0;
    margin: 5px 0 0 0;
}

.source-list li {
    padding: 3px 0;
    font-size: 0.9rem;
    color: var(--green);
}

.empty-detail {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
}

.placeholder-text {
    color: var(--color-text);
    opacity: 0.5;
    font-size: 1.2rem;
    text-align: center;
}

.debug-section {
    padding: 20px;
    width: 100%;
}

.debug-section h3 {
    color: var(--green);
    font-family: 'Pixel', monospace;
    margin-bottom: 20px;
    font-size: 1.2rem;
}

.button-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 15px;
}

.scene-btn {
    padding: 12px 20px;
    font-family: 'Pixel', monospace;
    font-size: 14px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.intro-btn {
    background-color: var(--green);
    color: black;
}

.intro-btn:hover {
    background-color: #2ecc71;
    transform: translateY(-2px);
}

.outro-btn {
    background-color: #3498db;
    color: white;
}

.outro-btn:hover {
    background-color: #2980b9;
    transform: translateY(-2px);
}
</style>
