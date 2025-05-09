<template>
    <div class="full-screen">
        <div class="aspect-horizontal">
            <div class="aspect-vertical">
                <div class="base-div">
                    <div class="content-div">
                        <h2 class="title">Du hast diese Information extrahiert!</h2>
                        <div class="image-div">
                            <img class="image"
                                src="https://www.robinage.com/wp-content/uploads/2024/05/water-800x534.jpg" />
                        </div>
                        <h2 class="subtitle">Willst du diese Info speichern?</h2>
                        <div class="size-text">({{ size }} KB)</div>
                        <div class="button-div">
                            <button class="button" @click="save()">Speichern</button>
                            <button class="button" @click="del()">Löschen</button>
                        </div>
                        <div class="size-text">Speicher ({{ used_space }} / {{ max_space }} KB)</div>
                        <div class="size-bar-div" ref="size_bar_div">
                            <div v-for="i in 40" class="size-bar-module"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from 'vue';

const size_bar_div = ref<HTMLElement | null>(null);

const { max_space } = defineProps<{
    max_space: number
}>()

let used_space = 0
let size = 4.54

const save = () => {
    if (used_space + size <= max_space) {
        used_space += size
        update_bar();
    } else {
        alert("Nicht genug Speicherplatz")
    }
}

const del = () => {

}

const update_bar = () => {
    const bar_count = used_space / max_space * 40
    if (size_bar_div.value && size_bar_div.value.children.length > 0) {
        for (let i = 0; i < size_bar_div.value.children.length; i++) {
            if (i <= bar_count - 1) {
                size_bar_div.value.children[i].style.opacity = '1'
            } else {
                size_bar_div.value.children[i].style.opacity = '0'
            }
        }
    }
}

const next = () => {

}

onMounted(() => {
    update_bar();
});
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
}
</style>
