<template>
    <div class="cb-base-div" ref="baseContainer">
        <div class="cb-content-div" ref="contentContainer">
            <div class="cb-game-div" ref="gameContainer">
                <div class="cb-grid" ref="gridContainer">
                    <div v-for="index in totalCells" :key="index" class="cb-cell cb-bcell"></div>
                </div>
                <div class="cb-vingette"></div>
                <div class="cb-laser-div" ref="laserContainer">
                    <svg class="cb-laser-svg" ref="laserSvg" width="1" height="1" xmlns="http://www.w3.org/2000/svg">
                        <polyline class="cb-laser-polyline" ref="laserPolyline" points="" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/game';
import { games } from '@/stores/knowledge';
import { defineProps, onBeforeMount, onMounted, onUnmounted, ref } from 'vue';
import Level from '../level';

const { level } = defineProps<{
    level: Level
}>()

enum Direction {
    Up,
    Left,
    Down,
    Right,
}

let sizeX: number = 0;
let sizeY: number = 0;
let startX: number = 0;
let startY: number = 0;
let startDirection: Direction = Direction.Left;
let speed: number = 0;
let map: string;

switch (level) {
    case Level.EASY:
        sizeX = 50;
        sizeY = 26;
        startX = 2;
        startY = 21;
        startDirection = Direction.Right;
        speed = 0.13;
        map = "///4/////4f+P////+H/j+AP//h///gD//4f//4A/////8AAAf////AAAH+P/8AAAB/j//AA/4Hg//wAP+B4MAAA//geDAAAP/4HgwAA///h4MAAP//4f/AAD/8eH/wAH//HgP8AB//x4D/AAfwAfg8AAH8AH4PAD//AB/+AA//wAf/gD//8AB/4A//gAAf////4AAH////+AAB/////gAAf8A==";
        break;
    case Level.MEDIUM:
        sizeX = 66;
        sizeY = 36;
        startX = 9;
        startY = 3;
        startDirection = Direction.Down;
        speed = 0.16;
        map = "/////B//////h///B//////h///B/D////h///B/D////gD//BgD////gD//BgD////gD//BgD4Af/g///B/D4Af/g///B/D4Af/g///H/D4Af/g/wfH//4Af/g/wfH///8f/g/wfH///8f/x/wfA//+Af/x+AfA//+H//x+Afg//+H//x+AfgwH+H//x/wfgAAAH//x/wfgAAAH//x//////+B//w//////+B//w///////5//w///////5//4///////5//4///////5//4+AAAf/+B//4+AAAf/+B//4AH/gAfgB//4AH/gAAAB//4AAAAAAAf///+AAPAAAf///////+P///Af////+P///Af////+P///AAH////////AAH////////";
        break;
    case Level.HARD:
        sizeX = 66;
        sizeY = 36;
        startX = 4;
        startY = 19;
        startDirection = Direction.Up;
        speed = 0.18;
        map = "////////////8A/APGf/+Z/8AAAPGf/+Z/88ADAGf/+Z/8//zAAeMYB/8f//4AeMYB/8YA/7geMAB/8AA//geAAH///8APj+A4H///8APj+A4H/////Pj+P/H/////Pj+P/BgD///PgeP/BgD///PgAP/BgAB/gPgAP/xgAB/gP+AGfxgAB/n/+AGfxgPwAH/+AGfxgPwAH/hz4fBgPwAH/hz4fBgP//8AB/4fP/8f/4AB/4fP/8f4Abx/4fP/8D5gbx/4HP8MD/gbh+BwB8AD/gYD+B/BAH4/h7j+B/BAH4/x7j4B/BAH4/x7g4B/5AH8Px7A4B/58H8AADA4AGB8AAA8DABwGB8OBj/7+B+AH8OBj/7+B/wf//x7/7+B/wf///////////";
        break;
    case Level.SUPER_HARD:
        sizeX = 70;
        sizeY = 42;
        startX = 7;
        startY = 2;
        startDirection = Direction.Down;
        speed = 0.20;
        map = "////h///////8f/+H///////x4A4f/////j/HgDh4AHgf+P8AAOHgAeADA/wB8+OAAAAMD/AHz44/gAAB////P/j+APgH///8/+P/4+Af///z/4P/j/B8//HPnw/+P8fwD8c+fD/4/h/APxj58P//+H/4/GDnwD//4//j8YOfwAA/j/+MBg5/AAD+P/4wGDn/8AB4B/jAYOH//8HgH+MZgAf//wfwH4xmAAD//B/AfjGYAAP//H/x4MZ//A//8f/Hgxn/8AB/xgAeDGf/wAH/GAB48Z///8AAfwGDxn///wAB/8YPGAH///AH/xg8YAf////+AGPx+B+AAf/4A4/H+H4AB//gDj8P4Pj8AP+B+Pw/g+PwA/5/4/D+D4//APn/g+A8Pj/8AGf/j4Dw+P//gY/+Pj/D4//+Bj/4+P8Pj/B/GP/gA/wAAAH8A/+AD/AAAAfwD4///wD/+B/APj///H//////+P//////////4A=";
        break;
    case Level.IMPOSSIBLE:
        sizeX = 70;
        sizeY = 42;
        startX = 67;
        startY = 12;
        startDirection = Direction.Left;
        speed = 0.23;
        map = "j//////j///+P/////+P//w4//wD/A4wHgD7//Hh8BjGAAPv4B+Dzmc4B4+/gH/POZz//j4//f+85/P/+fz/8f7zn8//5/P/x/vOfz+AH8//Aw84DPx//4P/jbzgM/P//g/+NvP4z8wB/7/+w8/zDzAH/gf7Lj/MPE4efx/PuP84+T/5/39+4/zj5P/n/P37znGPkB+OA/fnOcB+QH44D9+eB4P7+fjjPz55///v5//8/PP3//wwH//z88/f/8DAf/+fz79/hw8///5/Dvx+Afz//gv/O/A/xgMPw4/85/z/eAw/P//zn/B97/L+//Aef9H3v8vD/wPx40De/y9//fgfifN4ALmB9+f/J83//uYHxh/8Hzf/+5gfGf/9/N/Ab388Z//H8x95vHzxngB/Dn3mcfPGeAH8+PeZ4cR4D+Pz495nh5HwP4/HzwGfgAf//gAfAeD+P////wB8B4P///////////////////////A=";
        break;
}

const shadowPercentage = 0.2;

const totalCells = sizeX * sizeY;

const baseContainer = ref<HTMLElement | null>(null);
const contentContainer = ref<HTMLElement | null>(null);
const gameContainer = ref<HTMLElement | null>(null);
const gridContainer = ref<HTMLElement | null>(null);
const laserContainer = ref<HTMLElement | null>(null);
const laserSvg = ref<HTMLElement | null>(null);
const laserPolyline = ref<HTMLElement | null>(null);

let gridResizeObserver: ResizeObserver;

const simpleOffsets = [{ x: -1, y: 0 }, { x: 1, y: 0 }, { x: 0, y: -1 }, { x: 0, y: 1 }];

const borderClassNames = [
    'cb-fcell-left',
    'cb-fcell-right',
    'cb-fcell-top',
    'cb-fcell-bottom',
];

const grid = Array.from({ length: sizeX }, () => Array(sizeY).fill(0));

const createGrid = () => {
    if (baseContainer.value && contentContainer.value && gameContainer.value && gridContainer.value && laserContainer.value && laserSvg.value) {
        gridContainer.value.innerHTML = '';
        gameContainer.value.style.setProperty('--aspect-ratio', `calc(${sizeX} / ${sizeY})`);
        gridContainer.value.style.setProperty('grid-template-columns', `repeat(${sizeX}, 1fr)`);
        gridContainer.value.style.setProperty('grid-template-rows', `repeat(${sizeY}, 1fr)`);
        laserSvg.value.setAttribute('width', `${sizeX}`);
        laserSvg.value.setAttribute('height', `${sizeY}`);

        gridResizeObserver = new ResizeObserver((entries) => {
            if (gridContainer.value && laserSvg.value) {
                for (let entry of entries) {
                    const cellSize = entry.contentRect.width / sizeX;
                    gridContainer.value.style.setProperty('--shadow-size', `${cellSize * shadowPercentage}px`);
                    laserSvg.value.style.setProperty('--svg-scale', `${cellSize * 100}%`);
                }
            }
        });
        gridResizeObserver.observe(gridContainer.value);
        const decodedString = atob(map);
        let index = 0;
        outer: for (let i = 0; i < decodedString.length; i++) {
            const bits = decodedString.charCodeAt(i).toString(2).padStart(8, '0');
            for (let j = 0; j < bits.length; j++) {
                const bit = Number(bits[j]);
                const cell = document.createElement('div');
                cell.classList.add('cb-cell', bit === 1 ? 'cb-fcell' : 'cb-bcell');
                gridContainer.value.appendChild(cell);
                if (bit === 1) {
                    grid[index % sizeX][Math.floor(index / sizeX)] = 1;
                }
                if (++index == totalCells) {
                    break outer;
                }
            }
        }
        if (index < totalCells) {
            for (; index < totalCells; index++) {
                const cell = document.createElement('div');
                cell.classList.add('cb-cell', 'cb-bcell');
                gridContainer.value.appendChild(cell);
            }
        }
        index = 0;
        for (let y = 0; y < sizeY; y++) {
            for (let x = 0; x < sizeX; x++) {
                if (grid[x][y] === 1) {
                    for (let j = 0; j < simpleOffsets.length; j++) {
                        const offset = simpleOffsets[j];
                        const newX = x + offset.x;
                        const newY = y + offset.y;
                        if (newX < 0 || newX >= sizeX || newY < 0 || newY >= sizeY || grid[newX][newY] === 1) {
                            gridContainer.value.children[index].classList.add(borderClassNames[j]);
                        }
                    }
                }
                index++;
            }
        }
        createBackground();
        window.addEventListener("keydown", onKeydown);
    }
};

const createBackground = () => {
    if (gridContainer.value) {
        type Location = {
            x: number;
            y: number;
        }

        const getRandomFreeLocation = () => {
            if (freeFields > 0) {
                let randomIndex = Math.floor(Math.random() * freeFields);
                let c = 0;
                for (let x = 0; x < sizeX; x++) {
                    for (let y = 0; y < sizeY; y++) {
                        if (grid[x][y] === 0) {
                            if (c++ === randomIndex) {
                                return { x, y };
                            }
                        }
                    }
                }
            }
            return null;
        };

        const grid = Array.from({ length: sizeX }, () => Array(sizeY).fill(0));
        let paths: Location[][] = [];
        let freeFields = sizeX * sizeY;

        let currentLocation;
        while ((currentLocation = getRandomFreeLocation()) !== null) {
            let path: Location[] = [];
            path.push(currentLocation);
            grid[currentLocation.x][currentLocation.y] = 1;
            freeFields--;

            let otherDir = false;
            const maxLength = Math.floor(Math.random() * 16 + 8);
            for (let i = 0; i < maxLength; i++) {
                let possibleMoves: Location[] = [];
                const x = currentLocation.x;
                const y = currentLocation.y;
                for (let j = 0; j < simpleOffsets.length; j++) {
                    const offset = simpleOffsets[j];
                    const newX = x + offset.x;
                    const newY = y + offset.y;
                    if (newX >= 0 && newX < sizeX && newY >= 0 && newY < sizeY) {
                        if (grid[newX][newY] === 0) {
                            possibleMoves.push({ x: newX, y: newY });
                        }
                    }
                }
                if (possibleMoves.length === 0) {
                    if (!otherDir) {
                        break;
                    }
                    for (let j = 0; j < path.length; j++) {
                        const location = path[j];
                        grid[location.x][location.y] = 0;
                        freeFields++;
                    }
                    currentLocation = path[path.length - 1];
                    path = [currentLocation];
                    grid[currentLocation.x][currentLocation.y] = 1;
                    freeFields--;
                    i = 0;
                    otherDir = true;
                    continue;
                }
                const nextLocation = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
                path.push(nextLocation);
                grid[nextLocation.x][nextLocation.y] = 1;
                freeFields--;
                currentLocation = nextLocation;
            }
            if (path.length > 1) {
                if (path.length >= 8) {
                    paths.push(path);
                    const startLocation = path[0];
                    grid[startLocation.x][startLocation.y] = 2;
                    grid[currentLocation.x][currentLocation.y] = 2;
                }
            } else {
                grid[currentLocation.x][currentLocation.y] = -1;
            }
        }

        const addTrack = (index: number, diffX: number, diffY: number, long: boolean) => {
            if (gridContainer.value) {
                const trackDiv = document.createElement('div');
                trackDiv.classList.add('cb-track-div');
                const trackPart = document.createElement('div');
                trackPart.classList.add('cb-track-part');
                if (diffX == -1) {
                    long ? trackPart.classList.add('cb-track-part-horizontal') : trackPart.classList.add('cb-track-part-left');
                } else if (diffX == 1) {
                    long ? trackPart.classList.add('cb-track-part-horizontal') : trackPart.classList.add('cb-track-part-right');
                } else if (diffY == -1) {
                    long ? trackPart.classList.add('cb-track-part-vertical') : trackPart.classList.add('cb-track-part-top');
                } else {
                    long ? trackPart.classList.add('cb-track-part-vertical') : trackPart.classList.add('cb-track-part-bottom');
                }
                trackDiv.appendChild(trackPart);
                gridContainer.value.children[index].appendChild(trackDiv);
            }
        };

        for (let i = 0; i < paths.length; i++) {
            const path = paths[i];
            if (path.length <= 1) {
                continue;
            }
            for (let j = 0; j < path.length; j++) {
                const current = path[j];
                const index = current.y * sizeX + current.x;
                if (gridContainer.value.children[index].classList.contains('cb-fcell')) {
                    continue;
                }
                if (j == 0 || j == path.length - 1) {
                    let next;
                    if (j == 0) {
                        next = path[1];
                    } else {
                        next = path[j - 1];
                    }
                    addTrack(index, next.x - current.x, next.y - current.y, false);
                } else {
                    const next = path[j + 1];
                    const before = path[j - 1];
                    const nextDiffX = next.x - current.x;
                    const nextDiffY = next.y - current.y;
                    const beforeDiffX = before.x - current.x;
                    const beforeDiffY = before.y - current.y;
                    if (nextDiffX + beforeDiffX == 0 && nextDiffY + beforeDiffY == 0) {
                        addTrack(index, nextDiffX, nextDiffY, true);
                    } else {
                        addTrack(index, nextDiffX, nextDiffY, false);
                        addTrack(index, beforeDiffX, beforeDiffY, false);
                    }
                }
            }
        }

        let index = 0;
        for (let y = 0; y < sizeY; y++) {
            for (let x = 0; x < sizeX; x++) {
                if (grid[x][y] === 2 && gridContainer.value.children[index].classList.contains('cb-bcell')) {
                    const viaDiv = document.createElement('div');
                    viaDiv.classList.add('cb-via-div');
                    const viaRingDiv = document.createElement('div');
                    viaRingDiv.classList.add('cb-via-ring-div');
                    const viaRing = document.createElement('div');
                    viaRing.classList.add('cb-via-ring');
                    viaRingDiv.appendChild(viaRing);
                    const viaHoleDiv = document.createElement('div');
                    viaHoleDiv.classList.add('cb-via-hole-div');
                    const viaHole = document.createElement('div');
                    viaHole.classList.add('cb-via-hole');
                    viaHoleDiv.appendChild(viaHole);
                    viaDiv.appendChild(viaRingDiv);
                    viaDiv.appendChild(viaHoleDiv);
                    gridContainer.value.children[index].appendChild(viaDiv);
                }
                index++;
            }
        }
    }
};

let currentDirection: Direction = startDirection;
let lastDirection: Direction = currentDirection;

type Point = {
    x: number;
    y: number;
}
let points: Point[] = [{ x: startX, y: startY }];
let pointsString = `${startX},${startY}`;
let lastPoint: Point = { x: startX, y: startY };
let running = false;
let gameEnd = false;

const onKeydown = (event: KeyboardEvent) => {
    if (!event.repeat && laserPolyline.value) {
        if (!gameEnd) {
            if (running) {
                switch (event.key) {
                    case 'w':
                    case 'ArrowUp':
                        currentDirection = Direction.Up;
                        break;
                    case 's':
                    case 'ArrowDown':
                        currentDirection = Direction.Down;
                        break;
                    case 'a':
                    case 'ArrowLeft':
                        currentDirection = Direction.Left;
                        break;
                    case 'd':
                    case 'ArrowRight':
                        currentDirection = Direction.Right;
                        break;
                    default:
                        break;
                }
            } else if (event.key == ' ') {
                running = true;
            }
        } else if (event.key == 'r') {
            running = false;
            gameEnd = false;
            points = [{ x: startX, y: startY }];
            pointsString = `${startX},${startY}`;
            lastPoint = { x: startX, y: startY };
            currentDirection = startDirection;
            lastDirection = currentDirection;
            laserPolyline.value.setAttribute('points', `${pointsString} ${lastPoint.x},${lastPoint.y}`);
        }
    }
}

let laserUpdateId: number | undefined = undefined;
const gameStore = useGameStore()

const onLaserUpdate = (interval: number) => {
    if (running && !gameEnd && laserPolyline.value) {
        if (currentDirection % 2 != lastDirection % 2) {
            lastDirection = currentDirection;
            pointsString += ` ${lastPoint.x},${lastPoint.y}`;
            points.push({ x: lastPoint.x, y: lastPoint.y });
            console.log(points);
            console.log(pointsString);
        }
        const newDirection: Direction = lastDirection;
        let directionOffset;
        switch (newDirection) {
            case Direction.Up:
                directionOffset = { x: 0, y: -1 };
                break;
            case Direction.Down:
                directionOffset = { x: 0, y: 1 };
                break;
            case Direction.Left:
                directionOffset = { x: -1, y: 0 };
                break;
            case Direction.Right:
                directionOffset = { x: 1, y: 0 };
                break;
            default:
                directionOffset = { x: 0, y: 0 };
                break;
        }
        lastPoint.x += directionOffset.x * speed;
        lastPoint.y += directionOffset.y * speed;
        laserPolyline.value.setAttribute('points', `${pointsString} ${lastPoint.x},${lastPoint.y}`);
        if (lastPoint.x < 0 || lastPoint.x >= sizeX || lastPoint.y < 0 || lastPoint.y >= sizeY) {
            gameEnd = true;
            running = false;
            gameStore.setMinigameWin(true);
        } else if (grid[Math.floor(lastPoint.x)][Math.floor(lastPoint.y)] == 1) {
            gameEnd = true;
            running = false;
            gameStore.setMinigameWin(false);
        } else if (points.length >= 4) {
            const linesCollide = (p1: Point, p2: Point, p3: Point, p4: Point): boolean => {
                const crossProduct = (a: Point, b: Point): number => {
                    return a.x * b.y - a.y * b.x;
                }
                const subtractPoints = (a: Point, b: Point): Point => {
                    return { x: a.x - b.x, y: a.y - b.y };
                }
                const isBetween = (a: Point, b: Point, c: Point): boolean => {
                    return (
                        Math.min(a.x, b.x) <= c.x && c.x <= Math.max(a.x, b.x) &&
                        Math.min(a.y, b.y) <= c.y && c.y <= Math.max(a.y, b.y)
                    );
                }
                const d1 = subtractPoints(p2, p1);
                const d2 = subtractPoints(p4, p3);
                const delta = crossProduct(d1, d2);
                if (delta === 0) return false;
                const s = crossProduct(subtractPoints(p3, p1), d2) / delta;
                const t = crossProduct(subtractPoints(p3, p1), d1) / delta;
                return s >= 0 && s <= 1 && t >= 0 && t <= 1;
            }
            const lastStartPoint = points[points.length - 1];
            for (let i = 0; i < points.length - 3; i++) {
                const startPoint = points[i];
                const endPoint = points[i + 1];
                if (linesCollide(startPoint, endPoint, lastStartPoint, lastPoint)) {
                    gameEnd = true;
                    running = false;
                    gameStore.setMinigameWin(false);
                    break;
                }
            }
        }
    }
}

onBeforeMount(() => {
    gameStore.setGameState('circuitbreaker');
})

onMounted(() => {
    createGrid();
    const interval = 30;
    laserUpdateId = setInterval(onLaserUpdate, interval, interval);
});

onUnmounted(() => {
    gridResizeObserver.disconnect();
    window.removeEventListener('keydown', onKeydown);
    clearInterval(laserUpdateId);
});
</script>

<style>
.cb-base-div {
    --bcolor: rgb(8, 42, 30);
    --fcolor: rgb(15, 49, 37);
    --fbcolor: rgb(11, 77, 56);
    --lcolor: rgb(100, 230, 184);
    max-width: 100vw;
    max-height: 100vh;
    width: 100%;
    height: 100%;
    min-height: 100vh;
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;
}

.cb-content-div {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    --content-padding: 20px;
    padding: var(--content-padding);
}

.cb-game-div {
    /* --aspect-ratio gets overridden from code */
    --aspect-ratio: 0px;
    position: relative;
    max-width: calc((100vh - 2 * var(--content-padding)) * var(--aspect-ratio));
    aspect-ratio: var(--aspect-ratio);
    width: 100%;
    height: 100%;
    background-color: var(--bcolor);
}

.cb-laser-div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 5;
}

.cb-laser-svg {
    /* --svg-scale gets overridden from code */
    --svg-scale: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(var(--svg-scale), var(--svg-scale));
}

.cb-laser-polyline {
    stroke: var(--lcolor);
    stroke-width: 0.1;
    fill: none;
}

.cb-grid {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: grid;
    overflow: hidden;

    /* Variables for fcell shadow */
    --shadow-strength: 50%;
    --shadow-count: 2;
    /* --shadow-size gets overridden from code */
    --shadow-size: 0px;
    --shadow-alpha: calc(var(--shadow-strength) / var(--shadow-count));
}

.cb-vingette {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(0, 0, 0, 0%) 20%, rgba(0, 0, 0, 40%) 100%);
    pointer-events: none;
    z-index: 3;
}

.cb-cell {
    width: 100%;
    height: 100%;
}

.cb-bcell {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
}

.cb-fcell {
    border-radius: 25%;
    background-color: var(--fbcolor);
    box-shadow:
        calc(0.5 * var(--shadow-size)) calc(0.5 * var(--shadow-size)) calc(0.5 * var(--shadow-size)) rgba(0, 0, 0, var(--shadow-alpha)),
        calc(1.0 * var(--shadow-size)) calc(1.0 * var(--shadow-size)) calc(1.0 * var(--shadow-size)) rgba(0, 0, 0, var(--shadow-alpha));
    z-index: 4;
}

.cb-fcell-bottom {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.cb-fcell-top {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}

.cb-fcell-right {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.cb-fcell-left {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.cb-via-div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.cb-via-ring-div,
.cb-via-hole-div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
}

.cb-via-ring-div {
    z-index: 1;
}

.cb-via-hole-div {
    z-index: 2;
}

.cb-via-ring {
    width: 50%;
    height: 50%;
    border-radius: 50%;
    background-color: var(--fcolor);
}

.cb-via-hole {
    width: 30%;
    height: 30%;
    border-radius: 50%;
    background-color: var(--bcolor);
}

.cb-track-div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.cb-track-part {
    position: absolute;
    top: 0;
    bottom: 0;
    --track-width: 15%;
    --track-length: calc(50% + 0.5 * var(--track-width));
    --track-length-long: calc(100% + var(--track-width));
    --track-offset: calc(100% - var(--track-length));
    --track-offset-neg: calc(-1 * var(--track-offset));
    width: 100%;
    height: 100%;
    background-color: var(--fcolor);
}

.cb-track-part-left {
    transform: scale(var(--track-length), var(--track-width)) translate(var(--track-offset-neg), 0);
}

.cb-track-part-right {
    transform: scale(var(--track-length), var(--track-width)) translate(var(--track-offset), 0);
}

.cb-track-part-horizontal {
    transform: scale(var(--track-length-long), var(--track-width));
}

.cb-track-part-top {
    transform: scale(var(--track-width), var(--track-length)) translate(0, var(--track-offset-neg));
}

.cb-track-part-bottom {
    transform: scale(var(--track-width), var(--track-length)) translate(0, var(--track-offset));
}

.cb-track-part-vertical {
    transform: scale(var(--track-width), var(--track-length-long));
}
</style>
