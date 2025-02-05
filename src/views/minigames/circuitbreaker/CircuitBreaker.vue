<template>
    <div class="base-div" ref="baseContainer">
        <div class="content-div" ref="contentContainer">
            <div class="game-div" ref="gameContainer">
                <div class="grid" ref="gridContainer">
                    <div v-for="index in totalCells" :key="index" class="cell bcell"></div>
                </div>
                <div class="vingette"></div>
                <div class="laser-div" ref="laserContainer">
                    <svg class="laser-svg" ref="laserSvg" width="1" height="1" xmlns="http://www.w3.org/2000/svg">
                        <polyline class="laser-polyline" ref="laserPolyline" points="" />
                    </svg>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, onMounted, onUnmounted, ref } from 'vue';

const { sizeX, sizeY, startX, startY, startDirection, map } = defineProps<{
    sizeX: number
    sizeY: number
    startX: number
    startY: number
    startDirection: Direction
    map: string
}>()

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
    'fcell-left',
    'fcell-right',
    'fcell-top',
    'fcell-bottom',
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
                cell.classList.add('cell', bit === 1 ? 'fcell' : 'bcell');
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
                cell.classList.add('cell', 'bcell');
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
                trackDiv.classList.add('track-div');
                const trackPart = document.createElement('div');
                trackPart.classList.add('track-part');
                if (diffX == -1) {
                    long ? trackPart.classList.add('track-part-horizontal') : trackPart.classList.add('track-part-left');
                } else if (diffX == 1) {
                    long ? trackPart.classList.add('track-part-horizontal') : trackPart.classList.add('track-part-right');
                } else if (diffY == -1) {
                    long ? trackPart.classList.add('track-part-vertical') : trackPart.classList.add('track-part-top');
                } else {
                    long ? trackPart.classList.add('track-part-vertical') : trackPart.classList.add('track-part-bottom');
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
                if (gridContainer.value.children[index].classList.contains('fcell')) {
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
                if (grid[x][y] === 2 && gridContainer.value.children[index].classList.contains('bcell')) {
                    const viaDiv = document.createElement('div');
                    viaDiv.classList.add('via-div');
                    const viaRingDiv = document.createElement('div');
                    viaRingDiv.classList.add('via-ring-div');
                    const viaRing = document.createElement('div');
                    viaRing.classList.add('via-ring');
                    viaRingDiv.appendChild(viaRing);
                    const viaHoleDiv = document.createElement('div');
                    viaHoleDiv.classList.add('via-hole-div');
                    const viaHole = document.createElement('div');
                    viaHole.classList.add('via-hole');
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

enum Direction {
    Up,
    Left,
    Down,
    Right,
}

let currentDirection: Direction = startDirection;
let lastDirection: Direction = currentDirection;

type Point = {
    x: number;
    y: number;
}
let points: Point[] = [{ x: startX, y: startY }];
let pointsString = `${startX},${startY}`;
let lastPoint: Point = { x: startX, y: startY };
const speed = 0.18;
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
            alert('out of map');
        } else if (grid[Math.floor(lastPoint.x)][Math.floor(lastPoint.y)] == 1) {
            gameEnd = true;
            running = false;
            alert('bonk wall');
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
                    alert('bonk self');
                    break;
                }
            }
        }
    }
}

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
.base-div {
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

.content-div {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    --content-padding: 20px;
    padding: var(--content-padding);
}

.game-div {
    /* --aspect-ratio gets overridden from code */
    --aspect-ratio: 0px;
    position: relative;
    max-width: calc((100vh - 2 * var(--content-padding)) * var(--aspect-ratio));
    aspect-ratio: var(--aspect-ratio);
    width: 100%;
    height: 100%;
    background-color: var(--bcolor);
}

.laser-div {
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

.laser-svg {
    /* --svg-scale gets overridden from code */
    --svg-scale: 100%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(var(--svg-scale), var(--svg-scale));
}

.laser-polyline {
    stroke: var(--lcolor);
    stroke-width: 0.1;
    fill: none;
}

.grid {
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

.vingette {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(0, 0, 0, 0%) 20%, rgba(0, 0, 0, 40%) 100%);
    pointer-events: none;
    z-index: 3;
}

.cell {
    width: 100%;
    height: 100%;
}

.bcell {
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
}

.fcell {
    border-radius: 25%;
    background-color: var(--fbcolor);
    box-shadow:
        calc(0.5 * var(--shadow-size)) calc(0.5 * var(--shadow-size)) calc(0.5 * var(--shadow-size)) rgba(0, 0, 0, var(--shadow-alpha)),
        calc(1.0 * var(--shadow-size)) calc(1.0 * var(--shadow-size)) calc(1.0 * var(--shadow-size)) rgba(0, 0, 0, var(--shadow-alpha));
    z-index: 4;
}

.fcell-bottom {
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
}

.fcell-top {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
}

.fcell-right {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
}

.fcell-left {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
}

.via-div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
}

.via-ring-div,
.via-hole-div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;

    display: flex;
    justify-content: center;
    align-items: center;
}

.via-ring-div {
    z-index: 1;
}

.via-hole-div {
    z-index: 2;
}

.via-ring {
    width: 50%;
    height: 50%;
    border-radius: 50%;
    background-color: var(--fcolor);
}

.via-hole {
    width: 30%;
    height: 30%;
    border-radius: 50%;
    background-color: var(--bcolor);
}

.track-div {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
}

.track-part {
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

.track-part-left {
    transform: scale(var(--track-length), var(--track-width)) translate(var(--track-offset-neg), 0);
}

.track-part-right {
    transform: scale(var(--track-length), var(--track-width)) translate(var(--track-offset), 0);
}

.track-part-horizontal {
    transform: scale(var(--track-length-long), var(--track-width));
}

.track-part-top {
    transform: scale(var(--track-width), var(--track-length)) translate(0, var(--track-offset-neg));
}

.track-part-bottom {
    transform: scale(var(--track-width), var(--track-length)) translate(0, var(--track-offset));
}

.track-part-vertical {
    transform: scale(var(--track-width), var(--track-length-long));
}
</style>
