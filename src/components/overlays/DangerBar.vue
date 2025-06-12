<template>
    <span class="progress-label">Geschätzes Risikolevel:</span>
    <div class="progress-container">
        <div class="progress-bar" :class="barClass" :style="{ width: progress + '%' }"></div>
    </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue'

const props = defineProps({
    value: {
        type: Number,
        default: 0
    },
    max: {
        type: Number,
        default: 100
    }
})

const progress = computed(() => {
    return Math.min(100, Math.max(0, (props.value / props.max) * 100))
})

const barClass = computed(() => {
    const p = progress.value
    if (p < 50) return 'green'
    if (p < 80) return 'yellow'
    return 'red'
})
</script>

<style scoped>
.progress-container {
    height: 20px;
    width: 100%;
    background: rgba(0, 0, 0, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.2);
    box-shadow: none;
}

.progress-bar {
    height: 100%;
    position: relative;
}

.progress-bar::after {
    content: "";
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: repeating-linear-gradient(45deg,
            rgba(255, 255, 255, 0.1) 0,
            rgba(255, 255, 255, 0.1) 2px,
            transparent 2px,
            transparent 4px);
    pointer-events: none;
}

.progress-bar.green,
.progress-bar.yellow {
    animation: none;
}

@keyframes pulsate {

    0%,
    100% {
        box-shadow: inset 0 0 10px rgba(255, 0, 0, 0.5);
        transform: scaleY(1);
    }

    50% {
        box-shadow: inset 0 0 30px rgba(255, 0, 0, 0.9);
        transform: scaleY(1.1);
    }
}

@keyframes flicker {

    0%,
    100% {
        opacity: 1;
    }

    50% {
        opacity: 0.9;
    }
}

.progress-bar.green {
    background: linear-gradient(to right, #4caf50, #087f23);
}

.progress-bar.yellow {
    background: linear-gradient(to right, #ffeb3b, #c9b037);
}

.progress-bar.red {
    background: linear-gradient(to right, #f44336, #a40f0f);
    animation: pulsate 0.8s ease-in-out infinite, flicker 0.3s infinite;
}

.progress-label {
    transform: translate(-50%, -50%);
    font-size: 0.75rem;
    font-weight: bold;
    color: #fff;
    text-shadow: 0 0 2px #000;
    text-transform: uppercase;
    letter-spacing: 1px;
}
</style>
