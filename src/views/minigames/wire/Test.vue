<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { useMouse } from '@vueuse/core'
import { ref, watch, useTemplateRef, onBeforeMount } from 'vue'
import Timer from '../Timer.vue'
import Level from '../level'
import { useKnowledgeStore } from '@/stores/knowledge';
import { useGameStore } from '@/stores/game';

interface LeftItem {
    displayText: string;
    actualColor: string;
    displayColor: string;
}

const germanColorNames: Record<string, string> = {
    'red': 'Rot',
    'green': 'Grün',
    'blue': 'Blau',
    'purple': 'Lila',
    'yellow': 'Gelb',
    'teal': 'Türkis',
};

const props = defineProps<{ level: Level }>()

let gameColors: string[] = []
let start: number
let leftRenderItems: Array<string | LeftItem>
let rightRenderItems: string[]

switch (props.level) {
    default:
    case Level.EASY:
        gameColors = ['red', 'green', 'blue', 'purple']
        start = 25
        leftRenderItems = [...gameColors]
        break

    case Level.MEDIUM:
        gameColors = ['red', 'green', 'blue', 'purple']
        start = 20
        leftRenderItems = [...gameColors]
        break

    case Level.HARD:
        gameColors = ['red', 'green', 'blue', 'purple', 'yellow']
        start = 15
        leftRenderItems = [...gameColors]
        break

    case Level.SUPER_HARD:
        gameColors = ['red', 'green', 'blue', 'purple', 'yellow']
        start = 15
        {
            const shuffledDisplayColors = [...gameColors];
            fisherYatesShuffle(shuffledDisplayColors);
            leftRenderItems = gameColors.map((color, index) => ({
                displayText: germanColorNames[color] || color.toUpperCase(),
                actualColor: color,
                displayColor: shuffledDisplayColors[index % shuffledDisplayColors.length]
            }));
        }
        break
    case Level.IMPOSSIBLE:
        gameColors = ['red', 'green', 'blue', 'purple', 'yellow', 'teal']
        start = 15
        {
            const shuffledDisplayColors = [...gameColors];
            fisherYatesShuffle(shuffledDisplayColors);
            leftRenderItems = gameColors.map((color, index) => ({
                displayText: germanColorNames[color] || color.toUpperCase(),
                actualColor: color,
                displayColor: shuffledDisplayColors[index % shuffledDisplayColors.length]
            }));
        }
        break
}

rightRenderItems = [...gameColors]

const space = 100 / (gameColors.length + 1)

const rect = '4dvh'
const spacing = (index: number) => (index + 1) * space

// Calculate center coordinates for boxes/texts
function getBoxCenter(xPosition: string, yPositionPercentage: number) {
    const rectNumeric = parseInt(rect) // e.g., 4 from '4dvh'
    return {
        x: xPosition,
        y: `${yPositionPercentage + rectNumeric / 2}%`
    }
}

fisherYatesShuffle(leftRenderItems)
fisherYatesShuffle(rightRenderItems)

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
    // Get center of the left box/text
    const leftCenter = getBoxCenter('10%', spacing(index))

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
    const rightCenter = getBoxCenter('90%', spacing(index))

    if (
        !selectedBox.value ||
        selectedBox.value.color !== color ||
        lines.value.find((line) => line.color === color) ||
        tempLine.value!.color !== color
    ) {
        // Reset temporary line when connection fails
        tempLine.value = {
            x1: '10%',
            y1: spacing(index) + '%',
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
        y1: spacing(index) + '%',
        x2: '0',
        y2: '0',
        color: 'none',
    }
    selectedBox.value = null

    if (lines.value.length === gameColors.length) {
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

onBeforeMount(() =>{
    useGameStore().setGameState('wire');
})

</script>

<template>
    <Timer :sekunden="start" @time-over="timerFertig"></Timer>
    <div class="svg-container">
        <svg ref="svg">
            <line v-for="(line, index) in lines" :key="'line-' + index" :x1="line.x1" :y1="line.y1" :x2="line.x2"
                :y2="line.y2" :stroke="line.color" stroke-width="3" />

            <line key="temp" :x1="tempLine?.x1" :y1="tempLine?.y1" :x2="tempLine?.x2" :y2="tempLine?.y2"
                :stroke="tempLine?.color" stroke-width="3" />

            <!-- Left side items -->
            <template v-for="(item, index) in leftRenderItems" :key="'L-' + index">
                <rect v-if="typeof item === 'string'" @click="selectLeftBox(index, item)" x="10%"
                    :y="`${spacing(index)}%`" :width="rect" :height="rect" :fill="item" class="clickable" />
                <text v-else @click="selectLeftBox(index, item.actualColor)" x="2%"
                    :y="`${spacing(index) + parseInt(rect) / 2}%`" :fill="item.displayColor" font-size="2dvh"
                    text-anchor="start" dominant-baseline="middle" class="clickable">
                    {{ item.displayText }}
                </text>
            </template>

            <!-- Right side items -->
            <rect v-for="(color, index) in rightRenderItems" :key="'R-' + index"
                @click="connectToRightBox(index, color)" x="90%" :y="`${spacing(index)}%`" :width="rect" :height="rect"
                :fill="color" class="clickable" />
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
