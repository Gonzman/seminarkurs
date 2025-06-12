<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div @click="handleClick()" class="stevie">
        <speechBubble v-if="speeachText != ''" class="speech-bubble-container">
            <p>{{ speeachText }}</p>
        </speechBubble>
        <img :src="imagePath" class="pixel-art" width="auto" height="200px" draggable="false" @dragstart.prevent />
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

const count = ref(0);
const folder = ref('idle');

const imagePath = ref(`/stevie/${folder.value}/frame_${String(count.value).padStart(2, '0')}.png`);

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
            await idleAnim();
            await anim(2000, 'handy');
            await idleAnim();
        }
    } catch (error) {
        console.error('Animation error:', error);
    }
}

function handyAnim() {
    return new Promise<void>((resolve) => {
        let currentCount = 0;
        const interval = 2000 / 12;
        folder.value = 'handy';
        const counterInterval = setInterval(() => {
            count.value = currentCount;
            imagePath.value = `/stevie/${folder.value}/frame_${String(count.value).padStart(2, '0')}.png`;

            if (currentCount >= 11) {
                clearInterval(counterInterval);
                resolve();
            } else {
                currentCount++;
            }
        }, interval);
    });
}

function idleAnim() {
    return new Promise<void>((resolve) => {
        let currentCount = 0;

        const interval = 1000 / 6;
        folder.value = 'idle';
        const counterInterval = setInterval(() => {
            count.value = currentCount;
            imagePath.value = `/stevie/${folder.value}/frame_${String(count.value).padStart(2, '0')}.png`;

            if (currentCount >= 5) {
                clearInterval(counterInterval);
                resolve();
            } else {
                currentCount++;
            }
        }, interval);
    });
}

function getFrameCount(folderName: string): number {
    switch (folderName) {
        case 'idle':
            return 6;
        case 'handy':
            return 12;
        case 'exclamation':
            return 10;
        default:
            return 6;
    }
}

function anim(sec: number, folder: string) {
    return new Promise<void>((resolve) => {
        let currentCount = 0;
        const imageCount = getFrameCount(folder);

        if (imageCount === 0) {
            console.error(`No images found for folder: ${folder}`);
            resolve();
            return;
        }

        const interval = sec / imageCount;
        const counterInterval = setInterval(() => {
            count.value = currentCount;
            imagePath.value = `/stevie/${folder}/frame_${String(currentCount).padStart(2, '0')}.png`;

            if (currentCount >= (imageCount - 1)) {
                clearInterval(counterInterval);
                resolve();
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
    startCounter,
});
</script>

<style scoped>
.pixel-art {
    image-rendering: pixelated;
}

.stevie {
    user-select: none;
    position: relative;
}

.speech-bubble-container {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 15px;
    z-index: 10;
}

p {
    font-size: 12px;
    font-family: Pixel;
    text-rendering: optimizeLegibility;
}
</style>
