<template>
    <div class="full-screen">
        <div class="aspect-horizontal">
            <div class="aspect-vertical">
                <div class="base-div">
                    <div class="content-div">
                        <h2 class="title">Du hast diese Information extrahiert!</h2>
                        <div class="image-div">
                            <img class="image"
                                :src="knowledgeStore.getKnowledgeImagePath(currentKnowledge?.image ?? '')" />
                        </div>
                        <h2 class="subtitle">Willst du diese Info speichern? ({{ current + 1 }} / {{ max }})</h2>
                        <div class="size-text">({{ size }} KB)</div>
                        <div class="button-div">
                            <button class="button" :disabled="is_disabled" @click="save()">Speichern</button>
                            <button class="button" @click="del()">Löschen</button>
                        </div>
                        <div class="size-text">Speicher ({{ used_space.toFixed(2) }} / {{ max_space.toFixed(2) }} KB)
                        </div>
                        <div class="size-bar-div" ref="size_bar_div">
                            <div v-for="_ in 40" class="size-bar-module"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, ref } from 'vue';
import { useKnowledgeStore, type KnowledgeItem } from '@/stores/knowledge';
import { useRouter } from 'vue-router';

const size_bar_div = ref<HTMLElement | null>(null);
const is_disabled = ref(false);
const router = useRouter()

const { max_space, min_size, max_size } = defineProps<{
    max_space: number,
    min_size: number,
    max_size: number,
}>()

let used_space = ref(0)
let size = ref(0)

const knowledgeStore = useKnowledgeStore()
const knowledges = ref(knowledgeStore.getGameKnowledges())
// const knowledges = ref<KnowledgeItem[]>([]);
// for (let i = 0; i < 20; i++) {
//     const knowledge = getKnowledgeById(i)
//     if (knowledge) knowledges.value.push(knowledge);
// }
const saved_knowledges: KnowledgeItem[] = []
const all_knowledges: KnowledgeItem[] = knowledgeStore.getAllKnowledges()
const current = ref(0)
all_knowledges.forEach(knowledge => {
    current.value += hashTitleToSize(knowledge.title, min_size, max_size);
})
const max = ref(knowledges.value.length)
const currentKnowledge = ref<KnowledgeItem | null>(knowledges.value[0])
size.value = hashTitleToSize(currentKnowledge.value?.title || "default", min_size, max_size)

const save = () => {
    if (used_space.value + size.value <= max_space) {
        used_space.value += size.value
        update_bar();
        if (currentKnowledge.value) {
            saved_knowledges.push(currentKnowledge.value)
        }
        next()
    } else {
        alert("Nicht genug Speicherplatz!")
    }
}

const del = () => {
    next()
}

const update_bar = () => {
    const bar_count = used_space.value / max_space * 40
    if (size_bar_div.value && size_bar_div.value.children.length > 0) {
        for (let i = 0; i < size_bar_div.value.children.length; i++) {
            const child = size_bar_div.value.children[i] as HTMLElement;
            if (i <= bar_count - 1) {
                child.style.opacity = '1';
            } else {
                child.style.opacity = '0';
            }
        }
    }
}

const next = () => {
    if (current.value < max.value - 1) {
        current.value++;
        currentKnowledge.value = knowledges.value[current.value];
        size.value = hashTitleToSize(currentKnowledge.value.title, min_size, max_size);
        if (used_space.value + size.value <= max_space) {
            is_disabled.value = false;
        } else {
            is_disabled.value = true;
        }
    } else {
        knowledgeStore.moveGameKnowledgeToKnowledges(saved_knowledges);
        router.push("/graph")
    }
}

function hashTitleToSize(str: string, min_size: number, max_size: number): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    let norm = (hash >>> 0) / 0xFFFFFFFF;
    return Math.round((norm * (max_size - min_size) + min_size) * 100) / 100;
}

onMounted(() => {
    update_bar();
})
</script>

<style scoped>
.full-screen {
    width: 100vw;
    height: 100vh;
    display: flex;
    justify-content: center;
}

.aspect-vertical,
.aspect-horizontal {
    --ar: calc(3 / 4);
    aspect-ratio: var(--ar);
    max-width: 100vw;
    display: flex;
    align-items: center;
}

.aspect-horizontal {
    width: auto;
    height: 100%;
}

.aspect-vertical {
    width: 100%;
    height: auto;
}

.base-div {
    width: 100%;
    height: 100%;
    padding: 3%;
}

.content-div {
    width: 100%;
    height: 100%;
    background-color: #11131d;
    --br: 5%;
    border-radius: var(--br) / calc(var(--br) * var(--ar));
    overflow: hidden;
}

.image-div {
    aspect-ratio: 1;
    height: 50%;
    margin: 0 auto;
}

.image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.size-text {
    color: #8a518a;
    text-align: center;
}

h2 {
    color: #fff;
    text-align: center;
}

.title {
    margin: 2rem 0;
}

.subtitle {
    margin: 2rem 0 0 0;
}

.size-bar-div {
    width: 80%;
    height: 3%;
    margin: 0 auto;
    background-color: #62708b;
    display: grid;
    grid-template-columns: repeat(40, 1fr);
    gap: 0.7%;
    padding: 0.7%;
}

.size-bar-module {
    width: 100%;
    height: 100%;
    margin: auto;
    background-color: #1f1391;
}

.button-div {
    display: flex;
    justify-content: center;
    gap: 25%;
    margin: 7% 25%;
    height: 5%;
}

.button-div>* {
    flex: 1;
}

button {
    height: 100%;
    width: 100%;
    background-color: #62708b;
    border: none;
    color: black;
}

button:disabled {
    opacity: 0.5;
    color: black;
}
</style>
