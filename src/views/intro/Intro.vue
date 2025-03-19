<script setup lang="ts">
import IntroComp from '@/components/IntroComp.vue';

</script>

<template>
    <IntroComp text="Hallo">
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
