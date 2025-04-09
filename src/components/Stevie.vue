<template>
    <div @click="handleClick">
        <h1>Stevie</h1>
    </div>
</template>

<script lang="ts" setup>
import { useGameStore } from '@/stores/game';
import { useStevieStore } from '@/stores/stevie';


const gameStore = useGameStore();
const stevieStore = useStevieStore();

function handleClick() {

}
</script>

<style scoped></style>
