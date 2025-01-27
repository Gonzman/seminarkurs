<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore();

</script>

<template>
  <main>
   {{ counter.count}}
    <!--<TheWelcome />-->
  </main>
</template>
