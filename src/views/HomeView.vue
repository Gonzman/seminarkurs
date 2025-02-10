<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCounterStore } from '@/stores/counter'

const counter = useCounterStore()
const router = useRouter()

const routes = computed(() => router.getRoutes())
</script>

<template>
    <nav class="nav-container">
        <ul>
            <li v-for="r in routes" :key="r.path">
                <router-link :to="r.path" class="nav-link">
                    {{ r.name || 'Unnamed Route' }}
                </router-link>
            </li>
        </ul>
    </nav>
</template>

<style scoped>
/* Navigation container */
.nav-container {
    background: var(--color-background);
    padding: 15px;
    border-radius: 8px;

    max-width: 300px;
}

/* Unordered list reset */
ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

/* List item styling */
li {
    margin-bottom: 10px;
}

/* Link styling */
.nav-link {
    display: block;
    padding: 10px 15px;
    background: var(--color-background);
    color: white;
    text-decoration: none;
    border-radius: 6px;
    transition:
        background 0.3s,
        transform 0.2s;
}

/* Hover effect */
.nav-link:hover {
    background: #1abc9c;
    transform: translateY(-2px);
}
</style>
