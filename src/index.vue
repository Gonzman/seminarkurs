<template>
    <div class="container">
        <p>STUXNET</p>
        <button @click="start" class="select">Start</button>
    </div>
</template>

<script setup lang="ts">
import { onBeforeMount } from 'vue';
import { useGameStore } from './stores/game';
import router from './router';


const game = useGameStore()

game.setGameState('intro');

onBeforeMount(() => {
    const watched = localStorage.getItem("intro");
    if (watched == "1") {
        router.push('graph')
    }
})

function start() {
    router.push('/scenes/INTRO')
}

</script>

<style>
body {
    background: #0a0f0a;
    margin: 0;
    padding: 0;
}

.container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    gap: 40px;

}

@keyframes flicker {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.95;
    }
}

.select {
    font-size: 24px;
    font-weight: bold;
    font-family: Pixel, monospace;
    padding: 15px 30px;
    background-color: transparent;
    color: #00ff41;
    border: 2px solid #00ff41;
    cursor: pointer;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.3s ease;
}

.select:hover {
    background-color: rgba(0, 255, 65, 0.15);
    color: #fff;
    border-color: #4dff4d;
    transform: scale(1.05);
}
</style>
