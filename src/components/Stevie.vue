<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div @click="handleClick()">
        <speechBubble v-if="speeachText != ''">{{ speeachText }}</speechBubble>
        <img :src="imagePath" class="pixel-art" width="auto" height="200px" />
    </div>
</template>

<script lang="ts" setup>
import { useGameStore } from '@/stores/game';
import { useStevieStore } from '@/stores/stevie';
import speechBubble from '@/components/stevie/speechBubble.vue';
import { ref } from 'vue';
import stevie from '@/data/stevie.json';

const gameStore = useGameStore();
const stevieStore = useStevieStore();

const speeachText = ref('Hello, I am Stevie!');

const count = ref(0); // Changed to a number
const folder = ref('idle');

const imagePath = ref(`/src/assets/stevie/${folder.value}/frame_${String(count.value).padStart(2, '0')}.png`);

// Import all images from @/assets/stevie/ and its subfolders
const images = import.meta.glob('/src/assets/stevie/idle/*.png', { eager: true }) as Record<string, string>;

// Log the keys of the images object to debug
console.log(Object.keys(images));

function handleClick() {
    speeachText.value = 'You clicked me!';

    const stevieState = stevieStore.getStevie();
    const gameState = gameStore.getGameState();

    const message = stevie.ideen.find((item) => {
        if (item.gameState == gameState.value && item.stevieState == stevieState.value) {
            return item;
        }
    });

    if (!message) {
        console.error('Message not found!');
        return;
    }

    speeachText.value = message.message;

    setTimeout(() => {
        speeachText.value = '';
    }, message.duration * 1000);
}

async function startCounter() {
    try {
        while (true) {
            await idleAnim(); // Run idle animation
            await handyAnim(); // Run handy animation
            await idleAnim(); // Run idle animation again
        }
    } catch (error) {
        console.error('Animation error:', error);
    }
}

function handyAnim() {
    return new Promise((resolve) => {
        let currentCount = 0;
        const interval = 2000 / 12;
        folder.value = 'handy'; // Set the folder name here
        const counterInterval = setInterval(() => {
            count.value = currentCount;
            imagePath.value = `/src/assets/stevie/${folder.value}/frame_${String(count.value).padStart(2, '0')}.png`;

            if (currentCount >= 11) {
                clearInterval(counterInterval);
                resolve(); // Resolve the Promise when the animation ends
            } else {
                currentCount++;
            }
        }, interval);
    });
}

function idleAnim() {
    return new Promise((resolve) => {
        let currentCount = 0;
        const interval = 1000 / 6;
        folder.value = 'idle'; // Set the folder name here
        const counterInterval = setInterval(() => {
            count.value = currentCount;
            imagePath.value = `/src/assets/stevie/${folder.value}/frame_${String(count.value).padStart(2, '0')}.png`;

            if (currentCount >= 5) {
                clearInterval(counterInterval);
                resolve(); // Resolve the Promise when the animation ends
            } else {
                currentCount++;
            }
        }, interval);
    });
}

async function triggerMonolog(title: string) {
    const monolog = stevie.monolog.find((item) => {
        if (item.title == title) {
            return item;
        }
    });

    if (!monolog) {
        console.error('Monolog not found!');
        return;
    }

    for (let i = 0; i < monolog.messages.length; i++) {
        speeachText.value = monolog.messages[i].message;
        await new Promise((resolve) => setTimeout(resolve, monolog.messages[i].duration * 1000));
    }

    speeachText.value = '';
}

startCounter()

defineExpose({
    triggerMonolog,
    startCounter, // Expose the startCounter function
});
</script>

<style scoped>
.pixel-art {
    image-rendering: pixelated;
}
</style>
