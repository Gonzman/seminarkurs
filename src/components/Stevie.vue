<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div @click="handleClick()">
        <speechBubble v-if="speeachText != ''">{{ speeachText}}</speechBubble>
        stevie
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

function handleClick() {
    speeachText.value = 'You clicked me!';

    const stevieState = stevieStore.getStevie();
    const gameState = gameStore.getGameState();

    const message = stevie.ideen.find((item) => {
        if(item.gameState == gameState.value && item.stevieState == stevieState.value) {
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

defineExpose({
    triggerMonolog,
});
</script>

<style scoped></style>
