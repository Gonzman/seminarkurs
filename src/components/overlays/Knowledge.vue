<template>

    <p class="info">
        <slot></slot> Informationen
    </p>
    <div class="container">
        <div class="list">
            <button @click="addRandomKnowledge">Add Random Knowledge</button>
            <button @click="removeAllKnowledges">remove all Knowledge</button>
            <ul>
                <li v-for="knowledge in knowledges" :key="knowledge.id" @click="selectKnowledge(knowledge)"
                    :class="{ selected: knowledge.id === knowledgeStore.selectedKnowledge?.id }">
                    {{ knowledge.title }}
                </li>
            </ul>
        </div>
        <div class="detail" v-if="knowledgeStore.selectedKnowledge">
            <p class="heading">{{ knowledgeStore.selectedKnowledge.title }}</p>
            <img :src="knowledgeStore.selectedKnowledge.image" alt="Knowledge Image" />
            <p>{{ knowledgeStore.selectedKnowledge.description }}</p>
        </div>
        <div class="detail" v-else>
            <p class="heading">Select a knowledge to view</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useKnowledgeStore, type KnowledgeItem } from '@/stores/knowledge'

const knowledgeStore = useKnowledgeStore()

// Use computed for reactivity
const knowledges = computed<KnowledgeItem[]>(() => Array.from(knowledgeStore.knowledges.values()))

function selectKnowledge(knowledge: KnowledgeItem) {
    knowledgeStore.selectedKnowledge = knowledge
}

function addRandomKnowledge() {
    knowledgeStore.addRandomKnowledge()
}

function removeAllKnowledges() {
    knowledgeStore.removeAllKnowledges()
}
</script>

<style lang="css" scoped>
.container {
    display: flex;
    height: 100vh;
    width: 100vw;
    position: relative;
}

.info {
    font-size: 20px;
    font-weight: bold;
    font-family: Pixel;
    margin-bottom: 20px;
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 20;
    color: white;
}

.list {
    width: 20%;
    border-right: 1px solid #ccc;
    padding: 20px;
    overflow-y: auto;
    /* Makes the list scrollable */
    max-height: 100vh;
    margin-top: 50px;
    /* Adjust for the info text */
}

.list ul {
    list-style: none;
    padding: 0;
}

.list li {
    padding: 8px;
    cursor: pointer;
    transition: background 0.2s;
    text-align: left;
    border-radius: 5px;
}

.list li:hover {
    background-color: #644a4a;
}

.selected {
    background-color: #644a4a;
}

.detail {
    width: 70%;
    padding: 20px;
    overflow-y: auto;
    /* Makes the detail section scrollable */
    max-height: 100vh;
    margin-top: 40px;
    /* Adjust for the info text */
}

.heading {
    font-size: 22px;
    font-weight: bold;
    margin: 10px 0;
    text-align: left;
}

.detail p {
    text-align: left;
}
</style>
