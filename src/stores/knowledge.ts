import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { parse, stringify } from 'zipson/lib'

export interface KnowledgeItem {
    id: number
    image: string
    title: string
    description: string
    game?: games
}

export enum games {
    FINGER,
    CIRCUITBREAKER,
    ENCRYPTION,
    WIRE,
}

export const useKnowledgeStore = defineStore('knowledge', () => {
    const knowledges = ref<KnowledgeItem[]>([])
    const selectedKnowledge = ref<KnowledgeItem | null>(null)

    function loadKnowledges() {
        const stored = localStorage.getItem('knowledges')
        if (stored) {
            try {
                knowledges.value = parse(stored) || []
            } catch (error) {
                console.error('Error parsing knowledge data:', error)
            }
        }
    }

    function addKnowledge(knowledgeItem: KnowledgeItem) {
        knowledges.value.push(knowledgeItem)
    }

    function addRandomKnowledge() {
        const randomId = Math.floor(Math.random() * 1000)
        const randomKnowledge: KnowledgeItem = {
            id: randomId,
            image: `https://picsum.photos/200/300?random=${randomId}`,
            title: `Random Knowledge ${randomId}`,
            description: `This is a description for random knowledge item ${randomId}.`,
        }
        addKnowledge(randomKnowledge)
    }

    function removeAllKnowledges() {
        knowledges.value = []
    }

    function getAllKnowledges(): KnowledgeItem[] {
        return knowledges.value
    }

    watch(
        knowledges,
        (newKnowledges) => {
            console.log('New knowledges:', newKnowledges)
            localStorage.setItem('knowledges', stringify(newKnowledges))
        },
        { deep: true },
    )

    loadKnowledges()

    return {
        knowledges,
        selectedKnowledge,
        removeAllKnowledges,
        addKnowledge,
        addRandomKnowledge,
        getAllKnowledges,
    }
})
