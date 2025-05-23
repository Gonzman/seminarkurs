<template>
    <div class="knowledge-overlay">
        <div class="info-header">
            <slot></slot>
            <span class="info-text">Informationen</span>
        </div>
        <div class="container">
            <div class="list">
                <div class="knowledge-header">
                    <h2>Gesammelte Informationen</h2>
                    <div class="buttons-row">
                        <button @click="addRandomKnowledge" class="add-btn" v-if="isDebug">Add Random Knowledge</button>
                        <button @click="removeAllKnowledges" class="clear-btn" v-if="isDebug">Clear All</button>
                    </div>
                </div>

                <div v-if="knowledges.length === 0" class="no-knowledge">
                    <p>Du hast keine Informationen gesammelt</p>
                </div>

                <ul v-else class="knowledge-list">
                    <li v-for="knowledge in knowledges" :key="knowledge.id" @click="selectKnowledge(knowledge)"
                        :class="{ selected: knowledge.id === knowledgeStore.selectedKnowledge?.id }">
                        <div class="knowledge-item">
                            <span class="knowledge-title">{{ knowledge.title }}</span>
                            <span v-if="knowledge.sources && knowledge.sources.length > 0" class="knowledge-source">
                                {{ knowledge.sources.length > 1 ? `${knowledge.sources.length} sources` :
                                    knowledge.sources[0] }}
                            </span>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="detail" v-if="knowledgeStore.selectedKnowledge">
                <h3 class="heading">{{ knowledgeStore.selectedKnowledge.title }}</h3>
                <div class="knowledge-content">
                    <img :src="getKnowledgeImagePath(knowledgeStore.selectedKnowledge.image)" alt="Knowledge Image" />
                    <p class="description">{{ knowledgeStore.selectedKnowledge.description }}</p>
                    <div class="source" v-if="knowledgeStore.selectedKnowledge.sources?.length">
                        <span v-if="knowledgeStore.selectedKnowledge.sources.length === 1">
                            Vom: {{ knowledgeStore.selectedKnowledge.sources[0] }}
                        </span>
                        <span v-else>
                            Vom:
                            <ul class="source-list">
                                <li v-for="(source, index) in knowledgeStore.selectedKnowledge.sources" :key="index">
                                    {{ source }}
                                </li>
                            </ul>
                        </span>
                    </div>
                </div>
            </div>
            <div class="detail" v-else>
                <div class="empty-detail">
                    <p class="placeholder-text">Wähle eine Information aus</p>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useKnowledgeStore, type KnowledgeItem } from '@/stores/knowledge'

const knowledgeStore = useKnowledgeStore()
const isDebug = ref(import.meta.env.DEV || window.location.href.includes('debug'))

const knowledges = computed<KnowledgeItem[]>(() => Array.from(knowledgeStore.knowledges.values()))

// Import all images from assets/images directory
const imageModules = import.meta.glob('@/assets/images/*', { eager: true })
const imagePaths = ref<Record<string, string>>({})

onMounted(() => {
    // Create a mapping of image filenames to their actual URLs
    Object.entries(imageModules).forEach(([path, module]) => {
        const fileName = path.split('/').pop() || ''
        // @ts-ignore - Vite's module type doesn't match TypeScript's expectations
        imagePaths.value[fileName] = module.default
    })
})

function selectKnowledge(knowledge: KnowledgeItem) {
    knowledgeStore.selectedKnowledge = knowledge
}

function addRandomKnowledge() {
    knowledgeStore.addRandomKnowledge()
}

function removeAllKnowledges() {
    knowledgeStore.removeAllKnowledges()
}

// Function to resolve image paths using Vite's asset handling
export function getKnowledgeImagePath(imagePath: string): string {
    if (!imagePath) return '';

    // If it's an absolute URL (starts with http or https)
    if (imagePath.startsWith('http')) {
        return imagePath;
    }

    // Extract just the filename if it includes a path
    const fileName = imagePath.includes('/') ? imagePath.split('/').pop() || '' : imagePath;

    // If we have the image in our mapped paths
    if (fileName && imagePaths.value[fileName]) {
        return imagePaths.value[fileName];
    }

    // Fallback: try direct access through assets
    return new URL(`/src/assets/images/${fileName}`, import.meta.url).href;
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
</style>
