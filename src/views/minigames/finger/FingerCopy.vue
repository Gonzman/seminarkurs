<template>
    {{ imagesArray.length }}
    <div v-for="index in imagesArray.length">
        <div v-for="number in selected.length">
            <img :src="imagesArray[index - 1][number]" />
        </div>
    </div>
</template>

<script setup lang="ts">
const images = import.meta.glob('@/assets/minigames/finger/*.webp', { eager: true })

const groupedImages: Record<string, string[]> = {}

let selected: number[] = new Array(5)

for (let index = 0; index < selected.length; index++) {
    selected[index] = Math.floor(Math.random() * 6)
}

Object.entries(images).forEach(([path, data]) => {
    const fileName = path.split('/').pop() || ''
    const match = fileName.match(/finger-(\d+)(?:-(\d+))?\.webp/)

    if (match) {
        const groupIndex = match[1] // e.g., "1", "2"
        const subIndex = match[2] // e.g., "0", "1", "2" (or undefined for main image)

        if (!groupedImages[groupIndex]) {
            groupedImages[groupIndex] = []
        }

        const position = subIndex ? parseInt(subIndex) + 1 : 0
        groupedImages[groupIndex][position] = path
    }
})

// Convert object to a sorted 2D array
const imagesArray = Object.keys(groupedImages)
    .sort((a, b) => Number(a) - Number(b))
    .map((key) => groupedImages[key])

console.log(imagesArray)
</script>

<style lang="css" scoped></style>
