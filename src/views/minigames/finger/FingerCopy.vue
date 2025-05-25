<template>
    <div class="finger-game">
        <div class="game-container">
            <h2>Match The Finger</h2>

            <div v-if="!gameWon" class="game-status">
                <p>Passen Sie Ihren Finger auf der linken Seite dem Zielfinger auf der rechten Seite an!</p>
            </div>

            <div v-else class="game-won">
                <p>Herzlichen Glückwunsch! Ihr Finger stimmt mit dem Zielfinger überein!</p>
            </div>

            <div class="game-area">
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

                                <button @click.stop="cyclePart(currentFingerIndex, partIndex - 1, 1)">▶</button>
                            </div>
                        </div>
                    </div>
                </div>

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
import { useRouter } from 'vue-router'
import { useGameStore } from '@/stores/game'

const router = useRouter()
const gameStore = useGameStore()

const props = defineProps<{ level?: Level }>();

const images = import.meta.glob('@/assets/minigames/finger/*.webp', { eager: true })

const groupedImages: Record<string, string[]> = {}
const targetFingerImages: Record<string, string> = {}
const correctPositions = ref<number[][]>([])
const selected = ref<number[][]>([])
const currentFingerIndex = ref(0)
const gameWon = ref(false)
const activeFingers = ref<number[]>([])

Object.entries(images).forEach(([path, data]) => {
    const fileName = path.split('/').pop() || ''
    const match = fileName.match(/finger-(\d+)(?:-(\d+))?\.webp/)

    if (match) {
        const groupIndex = match[1]
        const subIndex = match[2]

        const imgPath = (data as any).default

        if (!subIndex) {
            targetFingerImages[groupIndex] = imgPath
            return;
        }

        if (!groupedImages[groupIndex]) {
            groupedImages[groupIndex] = []
        }

        const position = parseInt(subIndex) + 1
        groupedImages[groupIndex][position] = imgPath
    }
})

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
            return 1;
    }
}

const imagesArray = computed(() => {
    return Object.keys(groupedImages)
        .sort((a, b) => Number(a) - Number(b))
        .map((key) => groupedImages[key])
})

const getImageSrc = (fingerIndex: number, partIndex: number) => {
    if (!selected.value || !selected.value[fingerIndex]) return ''

    const selectedValue = selected.value[fingerIndex][partIndex]

    const actualFingerIndex = activeFingers.value[fingerIndex];

    if ((props.level === Level.HARD || props.level === Level.SUPER_HARD) && partIndex % 2 === 1) {
        const differentFingerIndex = (actualFingerIndex + 1) % imagesArray.value.length;
        return imagesArray.value[differentFingerIndex] && imagesArray.value[differentFingerIndex][selectedValue]
            ? imagesArray.value[differentFingerIndex][selectedValue]
            : '';
    }

    return imagesArray.value[actualFingerIndex] && imagesArray.value[actualFingerIndex][selectedValue]
        ? imagesArray.value[actualFingerIndex][selectedValue]
        : ''
}

const getTargetImageSrc = () => {
    const actualFingerIndex = activeFingers.value[currentFingerIndex.value];
    const fingerIndex = (actualFingerIndex + 1).toString();
    return targetFingerImages[fingerIndex] || ''
}

const isTargetImageAvailable = () => {
    const actualFingerIndex = activeFingers.value[currentFingerIndex.value];
    const fingerIndex = (actualFingerIndex + 1).toString();
    return !!targetFingerImages[fingerIndex]
}

const isImageAvailable = (fingerIndex: number, partIndex: number) => {
    if (!selected.value || !selected.value[fingerIndex]) return false

    const actualFingerIndex = activeFingers.value[fingerIndex];

    if ((props.level === Level.HARD || props.level === Level.SUPER_HARD) && partIndex % 2 === 1) {
        const differentFingerIndex = (actualFingerIndex + 1) % imagesArray.value.length;
        const selectedValue = selected.value[fingerIndex][partIndex]
        return !!imagesArray.value[differentFingerIndex] && !!imagesArray.value[differentFingerIndex][selectedValue];
    }

    const selectedValue = selected.value[fingerIndex][partIndex]
    return !!imagesArray.value[actualFingerIndex] && !!imagesArray.value[actualFingerIndex][selectedValue]
}

const initializeGame = () => {
    const fingersCount = getFingersCountByLevel();

    const totalFingerOptions = Object.keys(groupedImages).length;
    activeFingers.value = [];

    const allFingerIndices = Array.from({ length: totalFingerOptions }, (_, i) => i);

    for (let i = allFingerIndices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allFingerIndices[i], allFingerIndices[j]] = [allFingerIndices[j], allFingerIndices[i]];
    }

    activeFingers.value = allFingerIndices.slice(0, fingersCount);

    selected.value = Array.from({ length: fingersCount }, () =>
        Array.from({ length: 5 }, () => Math.floor(Math.random() * 4) + 1)
    )

    correctPositions.value = [];
    for (let i = 0; i < fingersCount; i++) {
        const fingerParts = [];
        for (let j = 0; j < 5; j++) {
            fingerParts.push(j + 1);
        }
        correctPositions.value.push(fingerParts);
    }

    currentFingerIndex.value = 0;
    gameWon.value = false;
}

const selectPart = (fingerIndex: number, partIndex: number) => {
    cyclePart(fingerIndex, partIndex, 1)
}

const cyclePart = (fingerIndex: number, partIndex: number, direction: number) => {
    if (!selected.value || !selected.value[fingerIndex]) {
        initializeGame()
        return
    }

    const minOption = 1
    const maxOptions = 5
    let newValue = selected.value[fingerIndex][partIndex] + direction

    if (newValue < minOption) newValue = maxOptions
    if (newValue > maxOptions) newValue = minOption

    selected.value[fingerIndex][partIndex] = newValue
}

const checkCorrect = (fingerIndex: number, partIndex: number) => {
    if (!selected.value || !correctPositions.value) return false
    if (!selected.value[fingerIndex] || !correctPositions.value[fingerIndex]) return false

    if (props.level === Level.EASY) {
        return selected.value[fingerIndex][partIndex] === correctPositions.value[fingerIndex][partIndex]
    }

    return false
}

const checkSolution = () => {
    if (!selected.value || !correctPositions.value) return

    let allCorrect = true
    const currIndex = currentFingerIndex.value

    for (let j = 0; j < 5; j++) {
        if (selected.value[currIndex][j] !== correctPositions.value[currIndex][j]) {
            allCorrect = false
            break
        }
    }

    gameWon.value = allCorrect
    gameStore.setMinigameWin(true);
}

const completeGame = () => {
    const allFingersComplete = currentFingerIndex.value === activeFingers.value.length - 1 && gameWon.value;

    if (allFingersComplete) {
        const currentMinigame = localStorage.getItem('current-minigame');
        if (currentMinigame) {
            try {
                const minigameData = JSON.parse(currentMinigame);

                const completedData = {
                    nodeId: minigameData.nodeId,
                    minigame: minigameData.minigame,
                    success: true,
                    timestamp: Date.now()
                };

                localStorage.setItem('completed-minigame', JSON.stringify(completedData));

                localStorage.removeItem('current-minigame');

                console.log('Game completed successfully!', completedData);

                setTimeout(() => {
                    router.push('/graph');
                }, 2000);
            } catch (e) {
                console.error('Error processing minigame completion:', e);
            }
        } else {
            console.log('Game completed, but no current minigame data found.');

            const completedData = {
                nodeId: 'node2',
                minigame: {
                    title: "Finger Game",
                    knowledge: {
                        id: Date.now(),
                        title: "Finger Manipulation",
                        description: "The ability to precisely manipulate and match finger patterns is essential for biometric authentication systems.",
                        image: ""
                    },
                    newStatus: 3
                },
                success: true,
                timestamp: Date.now()
            };

            localStorage.setItem('completed-minigame', JSON.stringify(completedData));

            setTimeout(() => {
                router.push('/graph');
            }, 2000);
        }
    }
}

const nextFinger = () => {
    currentFingerIndex.value = (currentFingerIndex.value + 1) % activeFingers.value.length
    gameWon.value = false
}

const resetGame = () => {
    initializeGame()
}

onMounted(() => {
    initializeGame()
})

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
