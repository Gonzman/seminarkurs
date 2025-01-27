<template>
  <Timer :sekunden="start" :fertig="finished" @time-over="timeOver" />
  <div>
    <canvas
      ref="canvasRef"
      @mousedown="handleMouseDown"
      @mouseup="handleMouseUp"
      @mousemove="handleMouseMove"
    ></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted } from 'vue'
import Timer from '../Timer.vue'
import Level from '../level'

const props = defineProps<{ level: Level }>()

let start: number
let colors: string[] = []

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

function timeOver() {
  alert('Test')
}

type Box = {
  x: number
  y: number
  w: number
  color: string
}

type Line = {
  a: number
  b: number
  c: number
  d: number
  color: string // Add color to Line type
}

function fisherYatesShuffle(array: any[]): void {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const ctx = ref<CanvasRenderingContext2D | null>(null)

const total = colors.length
let colorsL = JSON.parse(JSON.stringify(colors))
let colorsR = JSON.parse(JSON.stringify(colors))
fisherYatesShuffle(colorsL)
fisherYatesShuffle(colorsR)

const leftBoxes = reactive<Box[]>([])
const rightBoxes = reactive<Box[]>([])
const lines = reactive<Line[]>([])

const tempLine = reactive({ a: 0, b: 0, active: false, color: '' })

const mouseX = ref(0)
const mouseY = ref(0)

const gap = ref(0)
const boxWidth = ref(0)
const vertOffset = ref(0)

const resizeCanvas = () => {
  const canvas = canvasRef.value
  if (canvas) {
    canvas.width = window.innerWidth * 0.9
    canvas.height = window.innerHeight * 0.9
    gap.value = canvas.height / total
    boxWidth.value = 150 / total
    vertOffset.value = gap.value / 4
    initBoxes()
  }
}

const initBoxes = () => {
  leftBoxes.length = 0
  rightBoxes.length = 0
  for (let i = 0; i < total; i++) {
    leftBoxes.push({ x: 25, y: i * gap.value, w: boxWidth.value, color: colorsL[i] })
    rightBoxes.push({
      x: window.innerWidth * 0.9 - (boxWidth.value + 25),
      y: i * gap.value,
      w: boxWidth.value,
      color: colorsR[i],
    })
  }
}

let finished: boolean = false

const draw = () => {
  const canvas = canvasRef.value
  if (ctx.value && canvas) {
    ctx.value.clearRect(0, 0, canvas.width, canvas.height)

    ctx.value.translate(0, vertOffset.value)

    // Draw boxes
    ;[...leftBoxes, ...rightBoxes].forEach((box) => {
      ctx.value!.fillStyle = box.color
      ctx.value!.fillRect(box.x, box.y, box.w, box.w)
    })

    // Draw permanent lines
    lines.forEach((line) => {
      ctx.value!.strokeStyle = line.color // Use the line's color
      ctx.value!.lineWidth = 4
      ctx.value!.beginPath()
      ctx.value!.moveTo(line.a, line.b)
      ctx.value!.lineTo(line.c, line.d)
      ctx.value!.stroke()
    })

    if (lines.length == colors.length) {
      finished = true
      alert('Richtig')
    }

    // Draw temporary line
    if (tempLine.active) {
      ctx.value!.strokeStyle = tempLine.color
      ctx.value!.lineWidth = 4
      ctx.value!.beginPath()
      ctx.value!.moveTo(tempLine.a, tempLine.b)
      ctx.value!.lineTo(mouseX.value, mouseY.value - vertOffset.value)
      ctx.value!.stroke()
    }

    ctx.value.translate(0, -vertOffset.value)
  }
  if (!finished) {
    requestAnimationFrame(draw)
  }
}

const handleMouseMove = (event: MouseEvent) => {
  const rect = canvasRef.value!.getBoundingClientRect()
  mouseX.value = event.clientX - rect.left
  mouseY.value = event.clientY - rect.top
}

const handleMouseDown = () => {
  const clickedBox = leftBoxes.find(
    (box) =>
      mouseX.value > box.x &&
      mouseX.value < box.x + box.w &&
      mouseY.value > box.y + vertOffset.value &&
      mouseY.value < box.y + box.w + vertOffset.value,
  )

  if (clickedBox) {
    tempLine.a = clickedBox.x + clickedBox.w / 2
    tempLine.b = clickedBox.y + clickedBox.w / 2
    tempLine.color = clickedBox.color
    tempLine.active = true
  }
}

const handleMouseUp = () => {
  if (!tempLine.active) return

  const targetBox = rightBoxes.find(
    (box) =>
      mouseX.value > box.x &&
      mouseX.value < box.x + box.w &&
      mouseY.value > box.y + vertOffset.value &&
      mouseY.value < box.y + box.w + vertOffset.value,
  )

  if (targetBox && targetBox.color === tempLine.color) {
    lines.push({
      a: tempLine.a,
      b: tempLine.b,
      c: targetBox.x + targetBox.w / 2,
      d: targetBox.y + targetBox.w / 2,
      color: tempLine.color, // Store the color of the line
    })
  }

  tempLine.active = false
}

onMounted(() => {
  const canvas = canvasRef.value
  if (canvas) {
    ctx.value = canvas.getContext('2d')
    resizeCanvas()
    draw()
    window.addEventListener('resize', resizeCanvas)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', resizeCanvas)
})
</script>

<style scoped>
canvas {
  display: block;
  margin: 0 auto;
  border: 1px solid black;
}
</style>
