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
    <IntroComp text="Hallo" direction="right">
        <template #content>
            <h1>Intro</h1>
            <p>Das ist ein Intro</p>
        </template>
        <template #background>
            <img src="/src/assets/intro/image.png" alt="Background" />
        </template>
    </IntroComp>
</template>


<style lang="css" scoped></style>
