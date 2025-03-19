<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    direction: {
        type: String,
        default: 'right',
        validator: (value: string) => ['up', 'down', 'left', 'right'].includes(value)
    },
    text: {
        type: String,
        required: true
    },
    animationDuration: {
        type: Number,
        default: 2
    },
    anmationStop: {
        type: Number,
        default: 90
    }

})

const position = ref(0)
let animationFrame: number | null = null
const startTime = ref(performance.now())
const duration = props.animationDuration

const updateAnimation = (timestamp: number) => {
    const elapsedTime = (timestamp - startTime.value) / 1000
    if (elapsedTime < duration) {
        position.value = (elapsedTime / duration) * props.anmationStop
        animationFrame = requestAnimationFrame(updateAnimation)
    } else {
        position.value = props.anmationStop
    }
}

onMounted(() => {
    animationFrame = requestAnimationFrame(updateAnimation)
})

onUnmounted(() => {
    if (animationFrame) cancelAnimationFrame(animationFrame)
})

const backgroundStyle = computed(() => ({
    backgroundAttachment: 'fixed',
    backgroundPosition: 'center',
    backgroundSize: 'cover'
}))

const contentStyle = computed(() => {
    const transformValue = {
        up: `translateY(${-position.value}%)`,
        down: `translateY(${position.value}%)`,
        left: `translateX(${-position.value}%)`,
        right: `translateX(${position.value}%)`
    }[props.direction] || 'none'

    return {
        transform: transformValue,
        willChange: 'transform'
    }
})
</script>

<template>
    <div class="parallax-container">
        <div class="parallax-background" :style="backgroundStyle">
            <slot name="background"></slot>
        </div>
        <div class="parallax-content" :style="contentStyle">
            <slot name="content"></slot>
            {{ text }}
        </div>
    </div>
</template>

<style scoped>
.parallax-container {
    position: relative;
    overflow: hidden;
    height: 400px;
}

.parallax-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.parallax-content {
    position: relative;
    z-index: 2;
    padding: 20px;
    color: white;
    transition: transform linear;
}
</style>
