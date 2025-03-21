<script setup lang="ts">
import IntroComp from '@/components/IntroComp.vue';
import { onMounted, ref } from 'vue';

const timer = ref(0);

onMounted(() => {
    timer.value = setInterval(() => {
        console.log('Timer');
    }, 1000);
});
</script>

<template>
    <div class="container intro">
        <IntroComp text="Hallo" direction="right" :animation-duration="30" :anmation-stop="5">
            <template #content>
                <img src="/src/assets/intro/image.png" alt="Background" />
            </template>
            <template #background>
                <img src="/src/assets/intro/FC3EB5B1-EAD7-49E2-BC28-C6391DF64CAA_1_201_a.jpeg" alt="Background" />
            </template>
        </IntroComp>
    </div>
</template>

<style lang="css" scoped>
.container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100vw;
    height: 100vh;
    overflow: hidden;
}

.intro {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
}
</style>
