<template>
    <div class="grid grid-cols-10 gap-2 p-4">
        <img v-for="(sprite, index) in sprites" :key="index" :src="sprite" class="border rounded" />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const sprites = ref([]);

const splitImage = () => {
    const img = new Image();
    img.src = '@/assets/stevie/Bob_phone_16x16.png'; // Update the path if necessary
    img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const spriteWidth = 16;
        const spriteHeight = 16;
        const numSprites = img.width / spriteWidth;
        canvas.width = spriteWidth;
        canvas.height = spriteHeight;

        for (let i = 0; i < numSprites; i++) {
            ctx.clearRect(0, 0, spriteWidth, spriteHeight);
            ctx.drawImage(img, i * spriteWidth, 0, spriteWidth, spriteHeight, 0, 0, spriteWidth, spriteHeight);
            sprites.value.push(canvas.toDataURL());
        }
    };
};

onMounted(splitImage);
</script>

<style scoped>
.grid img {
    width: 32px;
    height: 32px;
}
</style>
