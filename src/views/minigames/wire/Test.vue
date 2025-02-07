<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { ref, watch, useTemplateRef } from 'vue'
import Timer from '../Timer.vue'
import Level from '../level'

const props = defineProps<{ level: Level }>()

let colors: string[] = []
let start: number

switch (props.level) {
    case Level.EASY:
        colors = ['red', 'green', 'blue', 'purple']
        start = 25
        break
    case Level.MEDIUM:
        colors = ['red', 'green', 'blue', 'purple']
        start = 20
        break

    case Level.HARD:
        colors = ['red', 'green', 'blue', 'purple', 'yellow']
        start = 15
        break

    case Level.SUPER_HARD:
        colors = ['red', 'green', 'blue', 'purple', 'yellow', 'teal']
        start = 15
        break
    default:
        break
}

let space = 100 / (colors.length + 1)

const rect = '4vh'
const spacing = (index: number) => (index + 1) * space

let colorsL = [...colors]
let colorsR = [...colors]

fisherYatesShuffle(colorsL)
fisherYatesShuffle(colorsR)

function fisherYatesShuffle(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
}

const selectedBox = ref<{ x: string; y: string; color: string } | null>(null)
const lines = ref<{ x1: string; y1: string; x2: string; y2: string; color: string }[]>([])
const tempLine = ref<{
    x1: string
    y1: string
    x2: string
    y2: string
    color: string
}>()

const svg = useTemplateRef('svg')
const useTemp = ref<boolean>(false)

const mouse = useMouse()

function selectLeftBox(index: number, color: string) {
    selectedBox.value = {
        x: '10%',
        y: spacing(index) + '%',
        color: color,
    }

    tempLine.value = {
        x1: mouse.x.value.toString(),
        y1: (mouse.y.value - 42).toString(),
        x2: mouse.x.value.toString(),
        y2: (mouse.y.value - 42).toString(),
        color: color,
    }
    useTemp.value = true
}

function connectToRightBox(index: number, color: string) {
    useTemp.value = false

    if (!selectedBox.value || selectedBox.value.color !== color) return
    if (tempLine.value!.color !== color) {
        tempLine.value = {
            x1: '10%',
            y1: spacing(index) + '%',
            x2: '0',
            y2: '0',
            color: 'none',
        }
    }

    lines.value.push({
        x1: selectedBox.value!.x,
        y1: selectedBox.value!.y,
        x2: '90%',
        y2: spacing(index) + '%',
        color,
    })

    tempLine.value = {
        x1: '10%',
        y1: spacing(index) + '%',
        x2: '0',
        y2: '0',
        color: 'none',
    }
    selectedBox.value = null

    if (lines.value.length === colors.length) {
        alert('Gewonnen')
    }
}

watch([mouse.x, mouse.y], () => {
    if (useTemp.value) {
        tempLine.value = {
            x1: tempLine.value!.x1,
            y1: tempLine.value!.y1,
            x2: mouse.x.value.toString(),
            y2: (mouse.y.value - 42).toString(),
            color: tempLine.value!.color,
        }
    }
})

function timerFertig() {
    alert('Verloren')
}
</script>

<template>
    <Timer :sekunden="start" @time-over="timerFertig"></Timer>
    <div class="svg-container">
        <svg ref="svg">
            <line
                v-for="(line, index) in lines"
                :key="'line-' + index"
                :x1="line.x1"
                :y1="line.y1"
                :x2="line.x2"
                :y2="line.y2"
                :stroke="line.color"
                stroke-width="3"
            />

            <line
                key="temp"
                :x1="tempLine?.x1"
                :y1="tempLine?.y1"
                :x2="tempLine?.x2"
                :y2="tempLine?.y2"
                :stroke="tempLine?.color"
                stroke-width="3"
            />

            <rect
                v-for="(color, index) in colorsL"
                :key="'L-' + index"
                @click="selectLeftBox(index, color)"
                x="10%"
                :y="`${spacing(index)}%`"
                :width="rect"
                :height="rect"
                :fill="color"
                class="clickable"
            />

            <rect
                v-for="(color, index) in colorsR"
                :key="'R-' + index"
                @click="connectToRightBox(index, color)"
                x="90%"
                :y="`${spacing(index)}%`"
                :width="rect"
                :height="rect"
                :fill="color"
                class="clickable"
            />
        </svg>
    </div>
</template>

<style scoped>
svg {
    width: 100%;
    height: 84.5dvh;
}
.clickable {
    cursor: pointer;
}
</style>
