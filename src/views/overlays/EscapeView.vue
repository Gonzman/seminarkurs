<template>
    <div>


        <div v-if="state == State.SELECT">
            <button @click="escapeStore.escapeState = false" class="back up">&#8249;</button>
            <div class="list">
                <button @click="state = State.KNOWLEDGE" class="select">Informationen</button>
                <button @click="state = State.INTRODUCTION" class="select">Anleitung</button>
            </div>
        </div>

        <Knowledge v-else-if="state == State.KNOWLEDGE">
            <button @click="state = State.SELECT" class="back">&#8249;</button>
        </Knowledge>
        <Instrocution v-else-if="state == State.INTRODUCTION">
            <button @click="state = State.SELECT" class="back">&#8249;</button>
        </Instrocution>

        <div>
            {{ useKnowledgeStore().getGameKnowledges() }}
        </div>

    </div>
</template>

<script setup lang="ts">
import Instrocution from '@/components/overlays/Introduction.vue';
import Knowledge from '@/components/overlays/Knowledge.vue';
import { useGameStore } from '@/stores/game';
import { useKnowledgeStore } from '@/stores/knowledge';
import { ref } from 'vue';

const escapeStore = useGameStore();

enum State {
    SELECT,
    KNOWLEDGE,
    INTRODUCTION,
}

const state = ref<State>(State.SELECT);

</script>

<style lang="css" scoped>
.list {
    display: flex;
    justify-content: center;
    gap: 10px;
}

.select {
    font-size: 20px;
    font-weight: bold;
    font-family: Pixel;
    padding: 10px 20px;
    background-color: #00000000;
    color: #fff;
    border: 1mm solid #fff;
    cursor: pointer;
}

.back {
    font-size: 20px;
    font-weight: bold;
    font-family: Pixel;
    padding: 10px 20px;
    background-color: #00000000;
    color: #fff;
    border: none;
    cursor: pointer;
}

.up {
    position: absolute;
    top: 10px;
    left: 10px;
}
</style>
