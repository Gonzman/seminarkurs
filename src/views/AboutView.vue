<script setup lang="ts">
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore();
</script>

<template>
  <div class="about">
    <button @click="counter.increment">{{ counter.count }}</button>
    <h1>This is an about page</h1>
  </div>
</template>

<style>
@media (min-width: 1024px) {
  .about {
    min-height: 100vh;
    display: flex;
    align-items: center;
  }
}
</style>
