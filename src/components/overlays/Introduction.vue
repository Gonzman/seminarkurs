<template>
    <p class="info">
        <slot></slot> Anleitung
    </p>
    <div class="container">
        <div class="list">
            <ul>
                <li v-for="item in introductionItems" :key="item.id" @click="selectIntroduction(item)"
                    :class="{ selected: item.id === introductionStore.selectedItem?.id }">
                    {{ item.title }}
                </li>
            </ul>
        </div>
        <div class="detail" v-if="introductionStore.selectedItem">
            <h1 class="heading">{{ introductionStore.selectedItem.title }}</h1>
            <img :src="introductionStore.selectedItem.imageSrc" alt="Anleitung" style="max-width: 100%">
            <p>{{ introductionStore.selectedItem.description }}</p>
        </div>
        <div class="detail" v-else>
            <p class="heading">Wähle eine Anleitung aus</p>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import jsonData from "@/data/anleitung.json"

// Define or import the IntroductionItem type
interface IntroductionItem {
    id: number;
    title: string;
    description: string;
    imageSrc: string;
}

const introductionItems = ref<IntroductionItem[]>([])

const introductionStore = reactive({
    selectedItem: null as IntroductionItem | null
})

const fetchIntroductionData = async () => {
    introductionItems.value = jsonData;
}

const selectIntroduction = (item: IntroductionItem) => {
    introductionStore.selectedItem = item
}

onMounted(() => {
    fetchIntroductionData()
})
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
