<script setup lang="ts">
import router from '@/router';
import { scenes } from './scenes';


const props = defineProps<{ scene?: scenes, debug?: boolean }>();


const sceneNames = ['intro', 'outro1', 'outro2', 'outro3', 'outro4'] as const;
const filepath = "/videos/" + sceneNames[props.scene ?? scenes.INTRO] + ".mp4"

console.log(props.debug);

function handleEnd() {
    if (props.debug) {
        router.push("/graph");
        return;
    }
    const currentSceneName = sceneNames[props.scene ?? scenes.INTRO];
    switch (currentSceneName) {
        case "intro":
            router.push("/graph");
            localStorage.setItem("intro", "1");
            break;
        case "outro1":
        case "outro2":
        case "outro3":
        case "outro4":
            router.push("/ende")
            break;
    }
}

</script>

<template>
    <div class="video-container">
        <video autoplay @ended="handleEnd">
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
