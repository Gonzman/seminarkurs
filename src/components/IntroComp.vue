<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const props = defineProps({
    direction: {
        type: String,
        default: 'right',
        validator: (value: string) => ['up', 'down', 'left', 'right'].includes(value) //todo: position the text dependent on the direction
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

const backgroundStyle = computed(() => {
    const transformValue = {
        up: `translateY(${position.value / 2}%)`,
        down: `translateY(${-position.value / 2}%)`,
        left: `translateX(${position.value / 2}%)`,
        right: `translateX(${-position.value / 2}%)`
    }[props.direction] || 'none'

    return {
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        transform: transformValue,
        transition: `transform ${duration * 2}s linear`
    }
})

const contentStyle = computed(() => {
    const transformValue = {
        up: `translateY(${-position.value}%)`,
        down: `translateY(${position.value}%)`,
        left: `translateX(${-position.value}%)`,
        right: `translateX(${position.value}%)`
    }[props.direction] || 'none'

    return {
        transform: transformValue,
        willChange: 'transform',
        textAlign: 'center' as CanvasTextAlign
    }
})
</script>

<template>
    <div class="parallax-container">
        <div class="parallax-background" :style="backgroundStyle">
            <!-- Flex centering any background slot content -->
            <div class="background-inner">
                <slot name="background"></slot>
            </div>
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
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

/* Remove the transform from here and add flex centering */
.parallax-background {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

/* New inner wrapper to center background slot content */
.background-inner {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    width: 100%;
}

.parallax-content {
    position: relative;
    z-index: 2;
    color: white;
    transition: transform linear;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    text-align: center;
}
</style>
