<script setup lang="ts">
import { scenes } from './scenes';


const props = defineProps<{ scene?: scenes }>();


const sceneNames = ['intro', 'outro1', 'outro2', 'outro3', 'outro4'];
const filepath = "/videos/" + sceneNames[props.scene ?? scenes.INTRO] + ".mp4"

</script>

<template>
    <div class="video-container">
        <video autoplay>
            <source :src=filepath type="video/mp4">
        </video>
    </div>
</template>

<style lang="css" scoped>
.video-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    width: auto;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
}

video {
    height: 100vh;
    object-fit: contain;
}
</style>
