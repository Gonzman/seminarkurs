import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import { parse, stringify } from 'zipson/lib'
import router from '@/router'
import knowledgeData from '@/data/knowledge.json'

export interface KnowledgeItem {
    id: number
    image: string
    title: string
    description: string
    sources?: string[]
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

    const gameKnowledges = ref<KnowledgeItem[]>([])

    const imageModules = import.meta.glob('@/assets/images/*', { eager: true })
    const imagePaths = ref<Record<string, string>>({})

    function loadKnowledges() {
        const stored = localStorage.getItem('knowledges')
        if (stored) {
            try {
                knowledges.value = parse(stored) || []

                knowledges.value = knowledges.value.map((knowledge) => {
                    if ('source' in knowledge && !knowledge.sources) {
                        const oldSource = knowledge.source as string
                        return {
                            ...knowledge,
                            sources: oldSource ? [oldSource] : [],
                            source: undefined,
                        }
                    }
                    return knowledge
                })
            } catch (error) {
                console.error('Error parsing knowledge data:', error)
                initializeFromJsonData() //FIXME dev
            }
        } else {
            initializeFromJsonData() //FIXME dev
        }

        Object.entries(imageModules).forEach(([path, module]) => {
            const fileName = path.split('/').pop() || ''
            imagePaths.value[fileName] = (module as { default: string }).default
        })
    }

    function addKnowledge(knowledgeItem: KnowledgeItem) {
        const existingIndex = knowledges.value.findIndex((item) => item.id === knowledgeItem.id)

        if (existingIndex >= 0) {
            const existing = knowledges.value[existingIndex]

            if (!existing.sources) {
                existing.sources = []
            }

            if (knowledgeItem.sources?.length) {
                knowledgeItem.sources.forEach((source) => {
                    if (!existing.sources!.includes(source)) {
                        existing.sources!.push(source)
                    }
                })
            } else if ('source' in knowledgeItem && knowledgeItem.source) {
                const source = knowledgeItem.source as string
                if (!existing.sources.includes(source)) {
                    existing.sources.push(source)
                }
            }
        } else {
            if (!knowledgeItem.sources) {
                knowledgeItem.sources = []

                if ('source' in knowledgeItem && knowledgeItem.source) {
                    knowledgeItem.sources.push(knowledgeItem.source as string)
                }
            }

            knowledges.value.push(knowledgeItem)
        }
    }

    function addRandomKnowledge() {
        const randomId = Math.floor(Math.random() * 1000)
        const randomKnowledge: KnowledgeItem = {
            id: randomId,
            image: `https://picsum.photos/200/300?random=${randomId}`,
            title: `Random Knowledge ${randomId}`,
            description: `This is a description for random knowledge item ${randomId}.`,
            sources: ['Random Generator'],
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

    function addGameKnowledges(knowledges: KnowledgeItem[]) {
        knowledges.forEach((item) => {
            const existingIndex = gameKnowledges.value.findIndex((k) => k.id === item.id)
            if (existingIndex === -1) {
                gameKnowledges.value.push(item)
            }
        })
    }

    function gameFailed() {
        gameKnowledges.value = []
    }

    function getGameKnowledges() {
        return gameKnowledges.value
    }

    function moveGameKnowledgeToKnowledges(knowledge: KnowledgeItem[]) {
        knowledge.forEach((item) => {
            const existingIndex = gameKnowledges.value.findIndex((k) => k.id === item.id)
            const existingIndexInKnowledges = knowledges.value.findIndex((k) => k.id === item.id)
            if (existingIndex !== -1 && existingIndexInKnowledges === -1) {
                knowledges.value.push(item)
            }
        })
        gameKnowledges.value = []
    }

    function getKnowledgeImagePath(imagePath: string): string {
        if (!imagePath) return ''

        // If it's an absolute URL (starts with http or https)
        if (imagePath.startsWith('http')) {
            return imagePath
        }

        // Extract just the filename if it includes a path
        const fileName = imagePath.includes('/') ? imagePath.split('/').pop() || '' : imagePath

        // If we have the image in our mapped paths
        if (fileName && imagePaths.value[fileName]) {
            return imagePaths.value[fileName]
        }

        // Fallback: try direct access through assets
        return new URL(`/src/assets/images/${fileName}`, import.meta.url).href
    }

    loadKnowledges()

    return {
        knowledges,
        selectedKnowledge,
        removeAllKnowledges,
        addKnowledge,
        addRandomKnowledge,
        getAllKnowledges,
        addGameKnowledges,
        gameFailed,
        getGameKnowledges,
        moveGameKnowledgeToKnowledges,
        getKnowledgeImagePath,
    }
})

export function getKnowledgeById(id: number): KnowledgeItem | null {
    const knowledge = initializeFromJsonData().find((k) => k.id === id)
    return knowledge || null
}

function initializeFromJsonData(): KnowledgeItem[] {
    console.log('Initializing knowledge store from knowledge.json file')
    return (knowledgeData as KnowledgeItem[]).map((item) => ({
        ...item,
        sources: item.sources || [],
    }))
}
