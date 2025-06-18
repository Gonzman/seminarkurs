<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <div @click="handleClick()" class="stevie">
        <speechBubble v-if="speeachText != ''" class="speech-bubble-container">
            <p>{{ speeachText }}</p>
        </speechBubble>
        <img :src="imagePath" class="pixel-art" width="auto" height="200px" draggable="false" @dragstart.prevent />
    </div>
</template>

<script lang="ts" setup>
import { useGameStore } from '@/stores/game';
import { useStevieStore, type Monolog, type StevieStateType } from '@/stores/stevie';
import speechBubble from '@/components/stevie/speechBubble.vue';
import { onMounted, ref, watch } from 'vue';
import stevie from '@/data/stevie.json';

const gameStore = useGameStore();
const stevieStore = useStevieStore();

const speeachText = ref('Hello, Ich bin Stevie');

const count = ref(0);
const folder = ref('idle');
const isInMonolog = ref(false);
const animationStopped = ref(false);
const currentAnimationInterval = ref<number | null>(null);
const animationQueue = ref<{ folder: string, duration: number }[]>([]);
const isAnimating = ref(false);

const imagePath = ref(`/stevie/${folder.value}/frame_${String(count.value).padStart(2, '0')}.png`);

const stevieState = stevieStore.getStevie();
const gameState = gameStore.getGameState();


function handleClick() {
    if (stevieStore.monolog != null) {
        return;
    }

    const currentGameState = gameState.value;
    console.log("Current game state:", currentGameState);

    const tipMapping: Record<string, string[]> = {
        'graph': ['Graph1', 'Graph2', 'Graph3'],
        'caesar': ['Encryption1', 'Encryption2', 'Encryption3', 'Encryption4'],
        'finger': ['FingerGame1', 'FingerGame2', 'FingerGame3', 'FingerGame4'],
        'tinder': ['InfoTinder1', 'InfoTinder2', 'InfoTinder3', 'InfoTinder4']
    };

    const availableTips = tipMapping[currentGameState];

    if (availableTips && availableTips.length > 0) {
        const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)];
        console.log("Triggering tip:", randomTip);
        stevieStore.triggerMonolog(randomTip);
    } else {
        console.log("No tips available for game state:", currentGameState);
        stevieStore.triggerMonolog('Happy1');
    }
}

async function startCounter() {
    try {
        while (!animationStopped.value) {
            if (!isInMonolog.value && !isAnimating.value) {
                const currentState = stevieState.value;

                if (currentState === 'normal') {
                    await playAnimation('idle', 1000);
                    if (animationStopped.value || isInMonolog.value) break;
                    await playAnimation('handy', 2000);
                    if (animationStopped.value || isInMonolog.value) break;
                    await playAnimation('idle', 1000);
                } else {
                    const animationFolder = getAnimationFolder(currentState);
                    await playAnimation(animationFolder, 3000);
                    if (animationStopped.value || isInMonolog.value) break;
                }
            } else {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }
    } catch (error) {
        console.error('Animation error:', error);
    }
}

function getFrameCount(folderName: string): number {
    switch (folderName) {
        case 'idle':
            return 6;
        case 'handy':
            return 12;
        case 'exclamation':
            return 6;
        case 'happy':
            return 6;
        case 'mad':
            return 6;
        case 'sad':
            return 6;
        default:
            return 6;
    }
}

function getAnimationFolder(stevieState: StevieStateType): string {
    switch (stevieState) {
        case 'happy':
            return 'happy';
        case 'angry':
            return 'mad';
        case 'sad':
            return 'sad';
        case 'scared':
        case 'exclamation':
            return 'exclamation';
        case 'normal':
        default:
            return 'idle';
    }
}

function playAnimation(folderName: string, duration: number) {
    return new Promise<void>((resolve) => {
        if (animationStopped.value || isAnimating.value) {
            resolve();
            return;
        }

        isAnimating.value = true;
        let currentCount = 0;
        const imageCount = getFrameCount(folderName);

        if (imageCount === 0) {
            console.error(`No images found for folder: ${folderName}`);
            isAnimating.value = false;
            resolve();
            return;
        }

        const interval = duration / imageCount;
        const counterInterval = setInterval(() => {
            if (animationStopped.value || isInMonolog.value) {
                clearInterval(counterInterval);
                currentAnimationInterval.value = null;
                isAnimating.value = false;
                resolve();
                return;
            }

            count.value = currentCount;
            imagePath.value = `/stevie/${folderName}/frame_${String(currentCount).padStart(2, '0')}.png`;

            if (currentCount >= (imageCount - 1)) {
                clearInterval(counterInterval);
                currentAnimationInterval.value = null;
                isAnimating.value = false;
                resolve();
            } else {
                currentCount++;
            }
        }, interval);

        currentAnimationInterval.value = counterInterval;
    });
}

function anim(sec: number, folder: string) {
    return new Promise<void>((resolve) => {
        if (animationStopped.value) {
            resolve();
            return;
        }

        let currentCount = 0;
        const imageCount = getFrameCount(folder);

        if (imageCount === 0) {
            console.error(`No images found for folder: ${folder}`);
            resolve();
            return;
        }

        const interval = sec / imageCount;
        const counterInterval = setInterval(() => {
            if (animationStopped.value) {
                clearInterval(counterInterval);
                currentAnimationInterval.value = null;
                resolve();
                return;
            }

            count.value = currentCount;
            imagePath.value = `/stevie/${folder}/frame_${String(currentCount).padStart(2, '0')}.png`;

            if (currentCount >= (imageCount - 1)) {
                clearInterval(counterInterval);
                currentAnimationInterval.value = null;
                resolve();
            } else {
                currentCount++;
            }
        }, interval);

        currentAnimationInterval.value = counterInterval;
    });
}

async function triggerMonolog(monolog: Monolog) {
    const oldStateValue = stevieStore.getStevie().value;
    console.log("oldState before monolog:", oldStateValue);

    if (currentAnimationInterval.value) {
        clearInterval(currentAnimationInterval.value);
        currentAnimationInterval.value = null;
    }

    isInMonolog.value = true;
    isAnimating.value = false;
    stevieStore.setStevieMood(monolog.stevieState as StevieStateType);

    const animationFolder = getAnimationFolder(monolog.stevieState as StevieStateType);

    for (let i = 0; i < monolog.messages.length; i++) {
        if (animationStopped.value) break;

        speeachText.value = monolog.messages[i].message;

        const messageDuration = monolog.messages[i].duration * 1000;
        await playMonologAnimation(animationFolder, messageDuration);
    }

    speeachText.value = '';
    isInMonolog.value = false;
    stevieStore.clearMonolog();

    console.log("restoring state to:", oldStateValue);
    if (monolog.stevieState as StevieStateType === 'angry') {
        stevieStore.setStevieMood(monolog.stevieState as StevieStateType)
    } else {
        stevieStore.setStevieMood(oldStateValue);
    }
    if (!animationStopped.value) {
        await new Promise(resolve => setTimeout(resolve, 100));
        startCounter();
    }
}

async function playMonologAnimation(folderName: string, duration: number) {
    return new Promise<void>((resolve) => {
        if (animationStopped.value) {
            resolve();
            return;
        }

        let currentCount = 0;
        const imageCount = getFrameCount(folderName);

        if (imageCount === 0) {
            console.error(`No images found for folder: ${folderName}`);
            resolve();
            return;
        }

        const interval = duration / imageCount;
        const counterInterval = setInterval(() => {
            if (animationStopped.value || !isInMonolog.value) {
                clearInterval(counterInterval);
                currentAnimationInterval.value = null;
                resolve();
                return;
            }

            count.value = currentCount;
            imagePath.value = `/stevie/${folderName}/frame_${String(currentCount).padStart(2, '0')}.png`;

            if (currentCount >= (imageCount - 1)) {
                clearInterval(counterInterval);
                currentAnimationInterval.value = null;
                resolve();
            } else {
                currentCount++;
            }
        }, interval);

        currentAnimationInterval.value = counterInterval;
    });
}

function stopAnimations() {
    animationStopped.value = true;
    if (currentAnimationInterval.value) {
        clearInterval(currentAnimationInterval.value);
        currentAnimationInterval.value = null;
    }
    isInMonolog.value = false;
    isAnimating.value = false;
    speeachText.value = '';
    animationQueue.value = [];
}

function startAnimations() {
    animationStopped.value = false;
    isAnimating.value = false;
    isInMonolog.value = false;
    startCounter();
}

onMounted(() => {
    startCounter()
})

watch(() => stevieStore.monolog, async (newVal) => {
    console.log(newVal)
    if (newVal == null) {
        speeachText.value = ''
    } else {
        await triggerMonolog(newVal)
    }
}, { immediate: true })

defineExpose({
    startCounter,
    stopAnimations,
    startAnimations,
});
</script>

<style scoped>
.pixel-art {
    image-rendering: pixelated;
}

.stevie {
    user-select: none;
    position: relative;
}

.speech-bubble-container {
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    margin-bottom: 15px;
    z-index: 10;
}

p {
    font-size: 12px;
    font-family: Pixel;
    text-rendering: optimizeLegibility;
}
</style>
