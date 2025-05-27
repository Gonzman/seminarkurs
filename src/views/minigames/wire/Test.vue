<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { ref, watch, useTemplateRef } from 'vue'
import Timer from '../Timer.vue'
import Level from '../level'
import { useKnowledgeStore } from '@/stores/knowledge';
import { useGameStore } from '@/stores/game';

const props = defineProps<{ level: Level }>()

let colors: string[] = []
let start: number

switch (props.level) {
    default:
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
}

const space = 100 / (colors.length + 1)

const rect = '4dvh'
const spacing = (index: number) => (index + 1) * space

const spacingLine = (index: number) => (index + 1) * space

// Calculate center coordinates for boxes
function getBoxCenter(xPosition: string, yPosition: number) {
    // Assuming rect is in 'dvh' units and needs to be converted approximately for calculations
    // This is an approximation as exact pixel values would depend on actual rendering
    const rectNumeric = parseInt(rect)
    return {
        x: xPosition,
        y: `${yPosition + rectNumeric / 2}%`
    }
}

const colorsL = [...colors]
const colorsR = [...colors]

fisherYatesShuffle(colorsL)
fisherYatesShuffle(colorsR)

function fisherYatesShuffle(array: unknown[]): void {
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
const svgMousePos = ref({ x: 0, y: 0 })

// Function to convert global mouse coordinates to SVG coordinates
function updateSvgMousePosition() {
    if (!svg.value) return

    const svgElement = svg.value
    const svgRect = svgElement.getBoundingClientRect()

    // Calculate the relative position within the SVG
    svgMousePos.value = {
        x: mouse.x.value - svgRect.left,
        y: mouse.y.value - svgRect.top
    }
}

function selectLeftBox(index: number, color: string) {
    // Get center of the left box
    const leftCenter = getBoxCenter('10%', spacingLine(index))

    selectedBox.value = {
        x: leftCenter.x,
        y: leftCenter.y,
        color: color,
    }

    // Update SVG mouse position
    updateSvgMousePosition()

    // Start the temporary line from the box center
    tempLine.value = {
        x1: leftCenter.x,
        y1: leftCenter.y,
        x2: svgMousePos.value.x.toString(),
        y2: svgMousePos.value.y.toString(),
        color: color,
    }
    useTemp.value = true
}

function connectToRightBox(index: number, color: string) {
    useTemp.value = false

    // Get center of the right box
    const rightCenter = getBoxCenter('90%', spacingLine(index))

    if (
        !selectedBox.value ||
        selectedBox.value.color !== color ||
        lines.value.find((line) => line.color === color) ||
        tempLine.value!.color !== color
    ) {
        // Reset temporary line when connection fails
        tempLine.value = {
            x1: '10%',
            y1: spacingLine(index) + '%',
            x2: '0',
            y2: '0',
            color: 'none',
        }
        return
    }

    // Add the permanent line from left box center to right box center
    lines.value.push({
        x1: selectedBox.value!.x,
        y1: selectedBox.value!.y,
        x2: rightCenter.x,
        y2: rightCenter.y,
        color,
    })

    // Reset the temporary line
    tempLine.value = {
        x1: '10%',
        y1: spacingLine(index) + '%',
        x2: '0',
        y2: '0',
        color: 'none',
    }
    selectedBox.value = null

    if (lines.value.length === colors.length) {
        useGameStore().setMinigameWin(true);

    }
}

watch([mouse.x, mouse.y], () => {
    if (useTemp.value) {
        updateSvgMousePosition()

        tempLine.value = {
            x1: tempLine.value!.x1,
            y1: tempLine.value!.y1,
            x2: svgMousePos.value.x.toString(),
            y2: svgMousePos.value.y.toString(),
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
            <line v-for="(line, index) in lines" :key="'line-' + index" :x1="line.x1" :y1="line.y1" :x2="line.x2"
                :y2="line.y2" :stroke="line.color" stroke-width="3" />

            <line key="temp" :x1="tempLine?.x1" :y1="tempLine?.y1" :x2="tempLine?.x2" :y2="tempLine?.y2"
                :stroke="tempLine?.color" stroke-width="3" />

            <rect v-for="(color, index) in colorsL" :key="'L-' + index" @click="selectLeftBox(index, color)" x="10%"
                :y="`${spacing(index)}%`" :width="rect" :height="rect" :fill="color" class="clickable" />

            <rect v-for="(color, index) in colorsR" :key="'R-' + index" @click="connectToRightBox(index, color)" x="90%"
                :y="`${spacing(index)}%`" :width="rect" :height="rect" :fill="color" class="clickable" />
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
