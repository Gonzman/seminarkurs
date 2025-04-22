<template>
    <div class="finger-game">
        <div class="game-container">
            <h2>Match The Finger</h2>

            <div v-if="!gameWon" class="game-status">
                <p>Adjust your finger on the left to match the target finger on the right!</p>
            </div>

            <div v-else class="game-won">
                <p>Congratulations! Your finger matches the target!</p>
            </div>

            <div class="game-area">
                <!-- User's finger to adjust (left side) -->
                <div class="finger-section user-finger">
                    <h3>Your Finger</h3>
                    <div class="finger-parts">
                        <div v-for="partIndex in 5" :key="`part-${partIndex - 1}`" class="finger-part"
                            :class="{ 'correct': checkCorrect(currentFingerIndex, partIndex - 1) }"
                            @click="selectPart(currentFingerIndex, partIndex - 1)">
                            <img v-if="isImageAvailable(currentFingerIndex, partIndex - 1)"
                                :src="getImageSrc(currentFingerIndex, partIndex - 1)"
                                :alt="`Finger part ${partIndex}`" />
                            <div class="selection-controls">
                                <button @click.stop="cyclePart(currentFingerIndex, partIndex - 1, -1)">◀</button>
                                <span>{{ selected && selected[currentFingerIndex] ?
                                    selected[currentFingerIndex][partIndex - 1] : 1 }}</span>
                                <button @click.stop="cyclePart(currentFingerIndex, partIndex - 1, 1)">▶</button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Target finger to match (right side) -->
                <div class="finger-section target-finger">
                    <h3>Target Finger</h3>
                    <div class="finger-parts target-container">
                        <img v-if="isTargetImageAvailable()" :src="getTargetImageSrc()" :alt="'Target finger'"
                            class="target-image" />
                    </div>
                </div>
            </div>

            <div class="game-controls">
                <button @click="resetGame" class="reset-btn">Reset</button>
                <button @click="checkSolution" class="check-btn">Check Solution</button>
                <button v-if="gameWon" @click="nextFinger" class="next-btn">Next Finger</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Level from '../level'

const props = defineProps<{ level?: Level }>();

const images = import.meta.glob('@/assets/minigames/finger/*.webp', { eager: true })

const groupedImages: Record<string, string[]> = {}
const targetFingerImages: Record<string, string> = {} // Store target finger images (with single number)
const correctPositions = ref<number[][]>([]) // Correct positions for each finger
const selected = ref<number[][]>([]) // User's selected positions
const currentFingerIndex = ref(0) // Currently active finger index
const gameWon = ref(false) // Whether the current finger is matched correctly
const activeFingers = ref<number[]>([]) // Fingers that are active based on level

// Process the images and organize them
Object.entries(images).forEach(([path, data]) => {
    const fileName = path.split('/').pop() || ''
    const match = fileName.match(/finger-(\d+)(?:-(\d+))?\.webp/)

    if (match) {
        const groupIndex = match[1] // e.g., "1", "2"
        const subIndex = match[2] // e.g., "0", "1", "2" (or undefined for main image)

        const imgPath = (data as any).default

        if (!subIndex) {
            // This is a single-number image (e.g., finger-1.webp) - use for target
            targetFingerImages[groupIndex] = imgPath
            return;
        }

        if (!groupedImages[groupIndex]) {
            groupedImages[groupIndex] = []
        }

        // Use the actual path to the image
        // Skip index 0 by adding 1 to the position (now starts from 1 instead of 0)
        const position = parseInt(subIndex) + 1
        groupedImages[groupIndex][position] = imgPath
    }
})

// Get the number of fingers to use based on level
const getFingersCountByLevel = () => {
    switch (props.level) {
        case Level.EASY:
            return 1;
        case Level.MEDIUM:
            return 2;
        case Level.HARD:
            return 3;
        case Level.SUPER_HARD:
            return 4;
        default:
            return 1; // Default to EASY if no level provided
    }
}

// Convert object to a sorted 2D array
const imagesArray = computed(() => {
    return Object.keys(groupedImages)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => groupedImages[key])
})

// Helper function to safely get user's image source
const getImageSrc = (fingerIndex: number, partIndex: number) => {
    if (!selected.value || !selected.value[fingerIndex]) return ''

    // For HARD and SUPER_HARD, we might use images from other fingers for some parts
    const selectedValue = selected.value[fingerIndex][partIndex]

    // The fingerIndex from the active fingers array
    const actualFingerIndex = activeFingers.value[fingerIndex];

    // Use mixed images for HARD and SUPER_HARD levels
    if ((props.level === Level.HARD || props.level === Level.SUPER_HARD) && partIndex % 2 === 1) {
        // For every second part, use an image from a different finger
        const differentFingerIndex = (actualFingerIndex + 1) % imagesArray.value.length;
        return imagesArray.value[differentFingerIndex] && imagesArray.value[differentFingerIndex][selectedValue]
            ? imagesArray.value[differentFingerIndex][selectedValue]
            : '';
    }

    return imagesArray.value[actualFingerIndex] && imagesArray.value[actualFingerIndex][selectedValue]
        ? imagesArray.value[actualFingerIndex][selectedValue]
        : ''
}

// Helper function to get target image source
const getTargetImageSrc = () => {
    // Get the actual finger index from our active fingers array
    const actualFingerIndex = activeFingers.value[currentFingerIndex.value];
    const fingerIndex = (actualFingerIndex + 1).toString();
    return targetFingerImages[fingerIndex] || ''
}

// Check if target image is available
const isTargetImageAvailable = () => {
    const actualFingerIndex = activeFingers.value[currentFingerIndex.value];
    const fingerIndex = (actualFingerIndex + 1).toString();
    return !!targetFingerImages[fingerIndex]
}

// Check if user image is available
const isImageAvailable = (fingerIndex: number, partIndex: number) => {
    if (!selected.value || !selected.value[fingerIndex]) return false

    // The actual finger index from our active fingers array
    const actualFingerIndex = activeFingers.value[fingerIndex];

    // If using mixed images for hard difficulties
    if ((props.level === Level.HARD || props.level === Level.SUPER_HARD) && partIndex % 2 === 1) {
        const differentFingerIndex = (actualFingerIndex + 1) % imagesArray.value.length;
        const selectedValue = selected.value[fingerIndex][partIndex]
        return !!imagesArray.value[differentFingerIndex] && !!imagesArray.value[differentFingerIndex][selectedValue];
    }

    const selectedValue = selected.value[fingerIndex][partIndex]
    return !!imagesArray.value[actualFingerIndex] && !!imagesArray.value[actualFingerIndex][selectedValue]
}

const initializeGame = () => {
    // Get the finger count for this level
    const fingersCount = getFingersCountByLevel();

    // Select random fingers to use (based on difficulty)
    const totalFingerOptions = Object.keys(groupedImages).length;
    activeFingers.value = [];

    // Create an array of all possible finger indices
    const allFingerIndices = Array.from({ length: totalFingerOptions }, (_, i) => i);

    // Shuffle the array
    for (let i = allFingerIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allFingerIndices[i], allFingerIndices[j]] = [allFingerIndices[j], allFingerIndices[i]];
    }

    // Take the first n fingers based on level
    activeFingers.value = allFingerIndices.slice(0, fingersCount);

    // Initialize the selected parts randomly but start from 1 (skip index 0)
    selected.value = Array.from({ length: fingersCount }, () =>
        Array.from({ length: 5 }, () => Math.floor(Math.random() * 4) + 1) // Values 1-4 instead of 0-4
    )

    // Set correct positions for target fingers
    correctPositions.value = [];
    for (let i = 0; i < fingersCount; i++) {
        // For each finger, set a random but consistent target configuration
        const fingerParts = [];
        for (let j = 0; j < 5; j++) {
            fingerParts.push(j + 1); // Start from 1 instead of 0
        }
        correctPositions.value.push(fingerParts);
    }

    // Start with the first finger
    currentFingerIndex.value = 0;
    gameWon.value = false;
}

const selectPart = (fingerIndex: number, partIndex: number) => {
    // This is called when a user clicks on a part
    cyclePart(fingerIndex, partIndex, 1)
}

const cyclePart = (fingerIndex: number, partIndex: number, direction: number) => {
    if (!selected.value || !selected.value[fingerIndex]) {
        initializeGame()
        return
    }

    const minOption = 1 // Start from 1 now (skipping 0)
    const maxOptions = 5 // Still 5 options but now 1-5 instead of 0-4
    let newValue = selected.value[fingerIndex][partIndex] + direction

    // Wrap around the selection
    if (newValue < minOption) newValue = maxOptions
    if (newValue > maxOptions) newValue = minOption

    selected.value[fingerIndex][partIndex] = newValue
}

const checkCorrect = (fingerIndex: number, partIndex: number) => {
    // Add safety checks to prevent TypeError
    if (!selected.value || !correctPositions.value) return false
    if (!selected.value[fingerIndex] || !correctPositions.value[fingerIndex]) return false

    // Only show correct visual indication in EASY mode
    if (props.level === Level.EASY) {
        return selected.value[fingerIndex][partIndex] === correctPositions.value[fingerIndex][partIndex]
    }

    // For other difficulties, don't visually indicate correct selections
    return false
}

const checkSolution = () => {
    if (!selected.value || !correctPositions.value) return

    let allCorrect = true
    const currIndex = currentFingerIndex.value

    for (let j = 0; j < 5; j++) {
        // Check if the selected value matches the correct value
        if (selected.value[currIndex][j] !== correctPositions.value[currIndex][j]) {
            allCorrect = false
            break
        }
    }

    gameWon.value = allCorrect
}

const nextFinger = () => {
    // Move to the next finger if available
    currentFingerIndex.value = (currentFingerIndex.value + 1) % activeFingers.value.length
    gameWon.value = false
}

const resetGame = () => {
    initializeGame()
}

// Initialize the game on component mount
onMounted(() => {
    initializeGame()
})

// Watch for changes to selected and check if game is won
watch(selected, () => {
    checkSolution()
}, { deep: true })
</script>

<style lang="css" scoped>
.finger-game {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    font-family: 'QuinqueFive', sans-serif;
    color: #333;
}

.game-container {
    max-width: 1000px;
    width: 100%;
}

p {
    color: white;
}

h2 {
    text-align: center;
    margin-bottom: 1rem;
    color: white;
}

h3 {
    text-align: center;
    margin-bottom: 1rem;
    font-size: 1.1rem;
    color: white;
}

.game-status {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
}

.game-won {
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.2rem;
    color: green;
    font-weight: bold;
}

.game-area {
    display: flex;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 2rem;
}

.finger-section {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border: 1px solid #3b3b3b;
    border-radius: 8px;
    background-color: #3b3b3b;
}


.finger-parts {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    align-items: center;
}

.finger-part {
    position: relative;
    border: 2px solid #ccc;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.3s;
    width: 130px;
}

.finger-part.correct {
    border-color: green;
    box-shadow: 0 0 5px rgba(0, 128, 0, 0.5);
}

.finger-part.target {
    border-color: #3498db;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.5);
}

.finger-part img {
    width: 120px;
    height: auto;
    display: block;
}

.selection-controls {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.5rem;
}

.selection-controls button {
    background-color: #e0e0e0;
    border: none;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    border-radius: 4px;
}

.selection-controls button:hover {
    background-color: #d0d0d0;
}

.target-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 250px;
}

.target-image {
    width: auto;
    height: auto;
    max-width: 200px;
    max-height: 240px;
    object-fit: contain;
}

.target-finger .finger-part {
    cursor: default;
    /* No cursor change on target finger parts */
}

.game-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1.5rem;
}

.game-controls button {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 4px;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;
}

.reset-btn {
    background-color: #f44336;
    color: white;
}

.check-btn {
    background-color: #4CAF50;
    color: white;
}

.next-btn {
    background-color: #3498db;
    color: white;
}

.reset-btn:hover {
    background-color: #e53935;
}

.check-btn:hover {
    background-color: #43a047;
}

.next-btn:hover {
    background-color: #2980b9;
}
</style>
