<script setup lang="ts">
import { defineConfigs, type Layouts, type Nodes } from 'v-network-graph'
import * as vNG from 'v-network-graph'
import {
    ForceLayout,
    type ForceNodeDatum,
    type ForceEdgeDatum,
} from 'v-network-graph/lib/force-layout'
import { computed, onMounted, reactive, ref, watch } from 'vue'
import * as Status from './status'
import { useMouse } from '@vueuse/core'
import { useGameStore } from '@/stores/game'
import { useKnowledgeStore, type KnowledgeItem, games, getKnowledgeById } from '@/stores/knowledge'
import { useRouter } from 'vue-router'
import Level from '@/views/minigames/level';


import { config, type Edge, type GraphData, type Node } from './graph'
import knowledgeData from '@/data/knowledge.json'

import defaultGraphData from '@/data/graph.json'
import Knowledge from '@/components/overlays/Knowledge.vue'
import Stevie from '@/components/Stevie.vue'
import { useStevieStore } from '@/stores/stevie'
import DangerBar from '../../components/overlays/DangerBar.vue'
import type { firstTime } from '@/utils/Data'

const router = useRouter()
const gameStore = useGameStore()
const knowledgeStore = useKnowledgeStore()
const graph = ref<vNG.Instance | null>(null)
const tooltip = ref<HTMLDivElement | null>(null)
const targetNodeId = ref<string>('')
const tooltipOpacity = ref(0)
const tooltipPos = ref({ left: '0px', top: '0px' })
const savedGraphs = ref<Array<{ name: string, data: GraphData }>>([])
const selectedGraph = ref<string>('')
const showGraphLoader = ref(false)
const showNodeInteraction = ref(false)
const interactionNode = ref<string | null>(null)


interface NodeMinigame {
    title: string
    route: string
    description: string
    knowledge: Partial<KnowledgeItem> | null
    requiredStatus?: Status.Status
    newStatus?: Status.Status
    difficulty?: Level
}

//filter edges where the hacked or start node is the source not the target

const nodeMinigames: Record<Status.Status, NodeMinigame[]> = {
    [Status.Status.START]: [],
    [Status.Status.HACKED]: [],
    [Status.Status.ONLINE]: [
        {
            title: "Finger Game",
            route: "/finger",
            description: "Test your reflexes in this coordination game.",
            knowledge: null,
            difficulty: Level.EASY,
            newStatus: Status.Status.HACKED
        },
        {
            title: "Circuit Breaker",
            route: "/circuitbreaker",
            description: "Bypass the circuit protection system.",
            knowledge: null,
            difficulty: Level.MEDIUM,
            newStatus: Status.Status.HACKED
        },
        {
            title: "Encryption Challenge",
            route: "/caesar",
            description: "Break the encryption to access node data.",
            knowledge: null,
            difficulty: Level.HARD,
            newStatus: Status.Status.HACKED
        },
        {
            title: "Wire Connection",
            route: "/wire",
            description: "Connect the wires to establish a network connection.",
            knowledge: null,
            difficulty: Level.SUPER_HARD,
            newStatus: Status.Status.HACKED
        }
    ],
    [Status.Status.OFFLINE]: [],
    [Status.Status.UNKNOWN]: [
        {
            title: "Scan Node",
            route: "/infotinder",
            description: "Scan the node to gather information.",
            knowledge: null,
            newStatus: Status.Status.ONLINE
        }
    ]
};

const edges = reactive<Record<string, Edge>>({
    edge1: { source: 'node1', target: 'node2', color: '#dbf77c', dashed: true },
    edge2: { source: 'node1', target: 'node3' },
    edge3: { source: 'node1', target: 'node4' },
    edge4: { source: 'node4', target: 'node5' },
    edge5: { source: 'node4', target: 'node6' },
})

const layouts = ref<Layouts>({
    nodes: {
        node1: { x: 0, y: 150, fixed: true },
    },
})

const nodes = reactive<Record<string, Node>>({})


const availableMinigames = computed(() => {
    if (!interactionNode.value || !filteredNodes.value[interactionNode.value]) {
        return [];
    }

    const node = filteredNodes.value[interactionNode.value];
    const minigameList: NodeMinigame[] = [];


    if (node.minigame !== undefined) {
        const gameType = node.minigame;

        let difficulty = node.difficulty ?? Level.EASY;
        let routeBase = "";
        let title = "";
        let description = "";


        if (node.difficulty === undefined) {


            difficulty = Level.EASY;
        }


        switch (gameType) {
            case games.FINGER:
                routeBase = "/finger";
                title = "Finger Game";
                description = "Test your reflexes in this finger coordination game.";
                break;
            case games.CIRCUITBREAKER:
                routeBase = "/circuitbreaker";
                title = "Circuit Breaker";
                description = "Bypass the circuit protection system.";
                break;
            case games.ENCRYPTION:
                routeBase = "/caesar";
                title = "Encryption Challenge";
                description = "Break the encryption to access node data.";
                break;
            case games.WIRE:
                routeBase = "/wire";
                title = "Wire Connection";
                description = "Connect the wires to establish a network connection.";
                break;
            default:

                return [];
        }


        const difficultyName = Level[difficulty].toLowerCase();

        minigameList.push({
            title,
            route: `${routeBase}/${difficultyName}`,
            description,
            knowledge: {
                title: title,
                description: description
            },
            difficulty: difficulty
        });


        return minigameList;
    }


    const statusMinigames = nodeMinigames[node.status] || [];
    return statusMinigames.map((mg: NodeMinigame) => {

        const difficultyName = mg.difficulty !== undefined ? Level[mg.difficulty].toLowerCase() : 'easy';

        return {
            ...mg,

            route: `${mg.route}/${difficultyName}`
        };
    });
});

const filteredNodes = computed(() => {
    return filterNodes(nodes);
});

const filteredEdges = computed(() => {
    const filtered: Record<string, Edge> = {};

    for (const [edgeId, edge] of Object.entries(edges)) {
        const sourceNode = nodes[edge.source];
        if (sourceNode && (sourceNode.status === Status.Status.HACKED || sourceNode.status === Status.Status.START)) {
            filtered[edgeId] = edge;
        }
    }

    return filtered;
});

const configs = computed(() => config(filteredNodes.value, false));

const targetNodePos = computed(() => {
    return layouts.value.nodes[targetNodeId.value] || { x: 0, y: 0 }
})

function fisherYatesShuffle(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
            ;[array[i], array[j]] = [array[j], array[i]]
    }
}
const { x, y, sourceType } = useMouse()
watch(
    [x, y],
    () => {
        if (!graph.value || !tooltip.value) return
        tooltipPos.value = {
            left: `${x.value + 15}px`,
            top: `${y.value}px`,
        }
    },
    { deep: true },
)

const eventHandlers: vNG.EventHandlers = {
    'node:pointerover': ({ node }) => {
        targetNodeId.value = node
        tooltipOpacity.value = 1
    },
    'node:pointerout': () => {
        tooltipOpacity.value = 0
    },
    'node:dragend': () => {
        tooltipOpacity.value = 0
    },
    'node:click': ({ node }) => {
        if (!node || !filteredNodes.value[node]) return


        if (filteredNodes.value[node].status === Status.Status.START) return

        interactionNode.value = node
        showNodeInteraction.value = true
    },
    'view:click': () => {

        if (!showNodeInteraction.value) return
        showNodeInteraction.value = false
    }
}
const nextNodeIndex = ref(Object.keys(nodes).length + 1)
const nextEdgeIndex = ref(Object.keys(edges).length + 1)


function filterNodes(nodes: Record<string, Node>): Record<string, Node> {
    const filtered: Record<string, Node> = {};
    const visitedNodes = new Set<string>();

    function getConnectedNodes(nodeId: string): string[] {
        const connectedNodeIds: string[] = [];
        for (const edge of Object.values(filteredEdges.value)) {
            if (edge.source === nodeId) {
                connectedNodeIds.push(edge.target);
            }
            if (edge.target === nodeId) {
                connectedNodeIds.push(edge.source);
            }
        }
        return connectedNodeIds;
    }

    function addNodeToFiltered(nodeId: string, status?: Status.Status) {
        if (nodes[nodeId]) {
            filtered[nodeId] = {
                ...nodes[nodeId],
                status: status !== undefined ? status : nodes[nodeId].status
            };
        }
    }

    for (const [nodeId, node] of Object.entries(nodes)) {
        if (node.status === Status.Status.START || node.status === Status.Status.HACKED) {
            addNodeToFiltered(nodeId);
            visitedNodes.add(nodeId);

            const connectedNodes = getConnectedNodes(nodeId);
            for (const connectedNodeId of connectedNodes) {
                if (!visitedNodes.has(connectedNodeId) && nodes[connectedNodeId]) {
                    if (nodes[connectedNodeId].status === Status.Status.HACKED) {
                        addNodeToFiltered(connectedNodeId);
                    } else {
                        addNodeToFiltered(connectedNodeId, Status.Status.ONLINE);
                    }
                    visitedNodes.add(connectedNodeId);
                }
            }
        }
    }

    return filtered;
}

function addNode() {
    const nodeId = `node${nextNodeIndex.value}`
    const name = `N${nextNodeIndex.value}`
    const icon = '&#xe328'
    const status = Status.Status.ONLINE

    nodes[nodeId] = { name, icon, status }

    nextNodeIndex.value++
}

function addRandomNode() {

    const nodeId = `node${nextNodeIndex.value}`
    const name = `N${nextNodeIndex.value}`
    const icon = '&#xe328'
    const status = Status.Status.ONLINE

    const existingNodes = Object.keys(nodes)

    if (existingNodes.length === 0) return

    let existingNode = ''
    fisherYatesShuffle(existingNodes)
    for (const eNode of existingNodes) {
        if (
            nodes[eNode].status === Status.Status.HACKED &&
            !Object.values(edges).some((edge) => edge.source == eNode)
        ) {
            existingNode = eNode
            break
        }
    }

    if (!existingNode) return

    nodes[nodeId] = { name, icon, status }
    nextNodeIndex.value++

    const edgeId = `edge${nextEdgeIndex.value}`
    edges[edgeId] = { source: nodeId, target: existingNode }
    nextEdgeIndex.value++

    const newNodesCount = Math.random() < 0.5 ? 1 : 2

    for (let i = 0; i < newNodesCount; i++) {
        const newNodeId = `node${nextNodeIndex.value}`
        const newNodeName = `N${nextNodeIndex.value}`
        const newIcon = '&#xe328'
        const newStatus = Status.Status.UNKNOWN

        nodes[newNodeId] = { name: newNodeName, icon: newIcon, status: newStatus }
        nextNodeIndex.value++

        const newEdgeId = `edge${nextEdgeIndex.value}`
        edges[newEdgeId] = { source: newNodeId, target: nodeId }
        nextEdgeIndex.value++
    }
}

function nameToIP(name: string): string {
    let ipParts = name.split('').map((char, index) => {
        return (char.charCodeAt(0) + index) % 256
    })

    while (ipParts.length < 3) {
        ipParts.push(0)
    }

    ipParts = ipParts.slice(0, 3)
    return `10.${ipParts.join('.')}`
}

function startMinigame(minigame: NodeMinigame) {
    if (!interactionNode.value || !nodes[interactionNode.value]) {
        console.error("No node selected for minigame");
        return;
    }

    const node = nodes[interactionNode.value];

    const knowledgeItems = node.knowledgeIds?.map((knowledgeId) => {
        return getKnowledgeById(knowledgeId);
    });

    if (knowledgeItems) {
        knowledgeStore.addGameKnowledges(knowledgeItems.filter((item): item is KnowledgeItem => item !== null && item !== undefined));
    }

    gameStore.setLastMinigameNode(interactionNode.value);

    router.push(minigame.route);
    showNodeInteraction.value = false;
}

function checkCompletedMinigames() {
    const minigameData = gameStore.getLastMinigameNode();
    const win = gameStore.getMinigameWin();
    if (!minigameData) return;

    // if (!win) {
    //     const lossKey = `loss_${minigameData}`;
    //     const losses = localStorage.getItem(lossKey);
    //     if (losses == null) {
    //         localStorage.setItem(lossKey, "1");
    //     } else {
    //         let lossCount = Number(losses);
    //         lossCount++;
    //         localStorage.setItem(lossKey, lossCount.toString());

    //         if (lossCount >= 3) {
    //             alert("You've failed this node challenge 3 times");
    //         }
    //     }
    //     return;
    // }

    try {
        const node = nodes[minigameData];
        node.status = win ? Status.Status.HACKED : Status.Status.ONLINE;
        saveCurrentGraph();

    } catch (e) {
        console.error('Error processing completed minigame:', e);
    }
}


function loadGraphFromFile(event: any) {
    const file = event.target.files[0];
    if (!file) return;


    if (!file.name.toLowerCase().endsWith('.json')) {
        alert('Please select a JSON file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            if (!e.target || !e.target.result) {
                return;
            }
            const jsonData = JSON.parse(e.target.result as string);


            if (!jsonData.nodes || !jsonData.edges) {
                alert('Invalid graph file format. File must contain nodes and edges objects.');
                return;
            }


            loadGraphData({
                nodes: jsonData.nodes,
                edges: jsonData.edges,
                layouts: jsonData.layouts || {}
            });


            const graphName = file.name.replace(/\.json$/, '') || 'imported';


            const existingIndex = savedGraphs.value.findIndex(g => g.name === graphName);
            if (existingIndex >= 0) {

                if (confirm(`A graph named "${graphName}" already exists. Do you want to overwrite it?`)) {
                    savedGraphs.value[existingIndex].data = {
                        nodes: { ...nodes },
                        edges: { ...edges },
                        layouts: { ...layouts.value }
                    };
                } else {

                    const uniqueName = `${graphName}_${Date.now()}`;
                    savedGraphs.value.push({
                        name: uniqueName,
                        data: {
                            nodes: { ...nodes },
                            edges: { ...edges },
                            layouts: { ...layouts.value }
                        }
                    });
                    selectedGraph.value = uniqueName;
                }
            } else {

                savedGraphs.value.push({
                    name: graphName,
                    data: {
                        nodes: { ...nodes },
                        edges: { ...edges },
                        layouts: { ...layouts.value }
                    }
                });
                selectedGraph.value = graphName;
            }


            localStorage.setItem('saved-graphs', JSON.stringify(savedGraphs.value));


            showGraphLoader.value = false;


            alert(`Graph "${graphName}" has been loaded successfully.`);
        } catch (error) {
            console.error('Error loading graph from file:', error);
            alert('Failed to parse the JSON file. Please check the file format.');
        }
    };

    reader.onerror = () => {
        alert('Failed to read the file. Please try again.');
    };

    reader.readAsText(file);
}


function saveCurrentGraph() {
    const graphData: GraphData = {
        nodes: { ...nodes },
        edges: { ...edges },
        layouts: { ...layouts.value }
    };


    const existing = savedGraphs.value || [];


    const currentIndex = existing.findIndex(g => g.name === "current");
    if (currentIndex >= 0) {
        existing[currentIndex].data = graphData;
    } else {

        existing.push({
            name: "current",
            data: graphData
        });
    }


    localStorage.setItem('saved-graphs', JSON.stringify(existing));
    savedGraphs.value = existing;
}




function toggleGraphLoader() {
    showGraphLoader.value = !showGraphLoader.value;
}


function loadSavedGraphs() {
    const savedData = localStorage.getItem('saved-graphs');
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            savedGraphs.value = parsed;
        } catch (e) {
            console.error('Failed to parse saved graphs', e);
        }
    }
}


function loadFirstGraph() {
    if (savedGraphs.value.length === 0) {
        loadGraphData(defaultGraphData);
        selectedGraph.value = "default";
        return;
    }


    const currentGraph = savedGraphs.value.find(g => g.name === "current");

    if (currentGraph) {
        loadGraphData(currentGraph.data);
        selectedGraph.value = "current";
    } else {

        loadGraphData(savedGraphs.value[0].data);
        selectedGraph.value = savedGraphs.value[0].name;
    }
}


function loadGraph() {
    if (!selectedGraph.value) {
        return;
    }

    const graph = savedGraphs.value.find(g => g.name === selectedGraph.value);
    if (!graph) {
        console.error('Graph not found:', selectedGraph.value);
        return;
    }

    loadGraphData(graph.data);
    showGraphLoader.value = false;
}


function loadGraphData(graphData: GraphData) {
    if (!graphData) return;


    Object.keys(nodes).forEach(key => delete nodes[key]);
    Object.keys(edges).forEach(key => delete edges[key]);


    if (graphData.nodes) {
        Object.entries(graphData.nodes).forEach(([id, node]) => {
            nodes[id] = { ...node };
        });
    }


    if (graphData.edges) {
        Object.entries(graphData.edges).forEach(([id, edge]) => {
            edges[id] = { ...edge };
        });
    }


    if (graphData.layouts) {
        layouts.value = { ...graphData.layouts };
    }


    nextNodeIndex.value = Math.max(
        ...Object.keys(nodes).map(id => {
            const match = id.match(/node(\d+)/);
            return match ? parseInt(match[1]) : 0;
        }),
        1
    ) + 1;

    nextEdgeIndex.value = Math.max(
        ...Object.keys(edges).map(id => {
            const match = id.match(/edge(\d+)/);
            return match ? parseInt(match[1]) : 0;
        }),
        1
    ) + 1;
}

onMounted(() => {
    gameStore.gameState = 'graph'
    loadSavedGraphs()

    try {
        const defaultExists = savedGraphs.value.findIndex(g => g.name === "default");
        if (defaultExists === -1 && defaultGraphData) {
            loadGraphData(defaultGraphData);
            console.log('Default graph loaded from graph.json file');

            savedGraphs.value.push({
                name: "default",
                data: {
                    nodes: { ...nodes },
                    edges: { ...edges },
                    layouts: { ...layouts.value }
                }
            });
            localStorage.setItem('saved-graphs', JSON.stringify(savedGraphs.value));
            selectedGraph.value = "default";
        } else {
            loadFirstGraph();
        }
    } catch (error) {
        console.error('Failed to load default graph:', error);
        loadFirstGraph();
    }

    checkCompletedMinigames()

    const firstTime = localStorage.getItem("firstTime")
    if (firstTime == null) {

        console.log("Test1")
        useStevieStore().triggerMonolog('Einführung');
        const first: firstTime = {
            graph: true,
            krankenhaus: false,
        }
        localStorage.setItem("firstTime", JSON.stringify(first));
    } else {
        console.log("Test2")
        const first: firstTime = JSON.parse(firstTime);
        if (!first.graph) {
            useStevieStore().triggerMonolog('Einführung');
            first.graph = true;
            localStorage.setItem("firstTime", JSON.stringify(first));
        }
    }
})

defineExpose({ addRandomNode })
</script>

<template>

    <div class="graph">
        <div class="graph-header">
            <button @click="toggleGraphLoader" class="btn primary">
                {{ showGraphLoader ? 'Hide Loader' : 'Load Graph' }}
            </button>
            <div class="dangerbar">
                <DangerBar :value="gameStore.dangerLevel" :max="9" />
            </div>
        </div>
        <div class="content">
            <!-- Graph Container -->
            <div class="graph-container">
                <v-network-graph ref="graph" v-model:layouts="layouts" :nodes="filteredNodes" :edges="filteredEdges"
                    :configs="configs" :event-handlers="eventHandlers" />
                <div ref="tooltip" class="tooltip" :style="{ ...tooltipPos, opacity: tooltipOpacity }">
                    <div>Name: {{ filteredNodes[targetNodeId]?.name ?? '' }}</div>
                    <div>Status: {{ Status.getStatusString(filteredNodes[targetNodeId]?.status) }}</div>
                    <div>IP: {{ nameToIP(filteredNodes[targetNodeId]?.name ?? '') }}</div>
                </div>
            </div>
        </div>

        <!-- Graph Loader Panel -->
        <div v-if="showGraphLoader" class="panel graph-loader">
            <div class="panel-section">
                <h3>Load Graph</h3>
                <div class="form-group">
                    <label for="graph-select">Select Graph:</label>
                    <select id="graph-select" v-model="selectedGraph">
                        <option value="">-- Select a Graph --</option>
                        <option v-for="graph in savedGraphs" :key="graph.name" :value="graph.name">
                            {{ graph.name }}
                        </option>
                    </select>
                </div>

                <div class="button-row">
                    <button @click="loadGraph" :disabled="!selectedGraph" class="btn primary">Load Graph</button>
                    <button @click="showGraphLoader = false" class="btn secondary">Cancel</button>
                </div>

                <!-- File upload section -->
                <div class="form-group upload-section">
                    <h4>Import Graph from File</h4>
                    <label for="graph-file" class="file-label">
                        Choose JSON file
                        <input type="file" id="graph-file" accept=".json" @change="loadGraphFromFile"
                            class="file-input" />
                    </label>
                    <div class="file-format-info">
                        <small>File must be a JSON containing nodes and edges objects</small>
                    </div>
                </div>
                <div class="info-text">
                    <p>Create graphs using the Graph Creator tool!</p>
                    <router-link to="/graph-creator" class="creator-link">Open Graph Creator</router-link>
                    <p>Customize Stevie with the Stevie Generator tool!</p>
                    <router-link to="/stevie-generator" class="creator-link">Open Stevie Generator</router-link>
                </div>
            </div>
        </div>

        <!-- Node Interaction Panel -->
        <div v-if="showNodeInteraction && interactionNode" class="panel node-interaction">
            <div class="panel-section">
                <h3>{{ filteredNodes[interactionNode]?.name }} Interaktion
                    <span class="status-badge"
                        :style="{ backgroundColor: Status.getColor(filteredNodes[interactionNode]?.status) }">
                        {{ Status.getStatusString(filteredNodes[interactionNode]?.status) }}
                    </span>
                    <button class="close-btn" @click="showNodeInteraction = false">×</button>
                </h3>

                <div class="interaction-content">
                    <p class="ip-address">IP: {{ nameToIP(filteredNodes[interactionNode]?.name || '') }}</p>
                    <p v-if="filteredNodes[interactionNode]?.difficulty !== undefined" class="difficulty-info">
                        Schwierigkeit: {{ Level[filteredNodes[interactionNode]?.difficulty!] }}
                    </p>

                    <div v-if="availableMinigames.length > 0" class="minigames-list">
                        <h4>Available Actions</h4>
                        <div v-for="(minigame, index) in availableMinigames" :key="index" class="minigame-item">
                            <div class="minigame-info">
                                <h5>{{ minigame.title }}</h5>
                                <p>{{ minigame.description }}</p>
                                <p class="minigame-difficulty">Schwierigkeit: {{ minigame.difficulty !== undefined ?
                                    Level[minigame.difficulty] : 'Default' }}</p>
                            </div>
                            <button class="btn primary play-btn" @click="startMinigame(minigame)"
                                :disabled="filteredNodes[interactionNode].status != Status.Status.ONLINE">Start</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Debug Button (hidden in production) -->
        <button @click="addRandomNode" class="debug-button">Add Random Node</button>
    </div>
</template>

<style lang="css" scoped>
.graph {
    position: relative;
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.header {
    padding: 1rem;
    background-color: var(--color-background-mute);
    border-bottom: 1px solid var(--color-border);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

h1 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--green);
}

.content {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.graph-container {
    height: 100%;
    width: 100%;
    position: relative;
}

.tooltip {
    color: white;
    font-family: 'Pixel';
    position: absolute;
    background-color: var(--color-background);
    border: 1px solid var(--green);
    box-shadow: 2px 2px 2px var(--green);
    padding: 6px;
    text-align: center;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s linear;
    pointer-events: none;
    width: fit-content;
    z-index: 1000;
}

.panel {
    position: absolute;
    background-color: var(--color-background-soft);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
    z-index: 100;
}

.graph-loader {
    top: 70px;
    right: 10px;
    width: 300px;
}

.node-interaction {
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 400px;
    max-width: 90%;
}

.panel-section {
    padding: 1rem;
}

h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--green);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    color: #000;
    margin-left: 8px;
}

.close-btn {
    background: none;
    border: none;
    color: var(--color-text);
    font-size: 24px;
    cursor: pointer;
    padding: 0 4px;
    line-height: 1;
}

.close-btn:hover {
    color: var(--green);
}

.interaction-content {
    padding: 0.5rem 0;
}

.ip-address {
    font-family: 'Pixel', monospace;
    font-size: 14px;
    color: var(--color-text);
    margin-bottom: 16px;
    padding: 4px 8px;
    background-color: var(--color-background);
    border-radius: 4px;
    display: inline-block;
}

.minigames-list h4 {
    margin-top: 0;
    margin-bottom: 12px;
    color: var(--color-text);
    font-size: 14px;
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 4px;
}

.minigame-item {
    margin-bottom: 12px;
    padding: 12px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: var(--color-background);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.minigame-info {
    flex: 1;
}

.minigame-item h5 {
    margin: 0 0 8px 0;
    font-size: 14px;
    color: var(--green);
}

.minigame-item p {
    margin: 0;
    font-size: 12px;
    color: var(--color-text);
}

.form-group {
    margin-bottom: 12px;
}

.form-group label {
    display: block;
    margin-bottom: 4px;
    font-size: 14px;
}

.form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid var(--color-border);
    background-color: var(--color-background);
    color: var(--color-text);
    border-radius: 4px;
}

.button-row {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.5rem;
}

.btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
}

.primary {
    background-color: var(--green);
    color: black;
}

.secondary {
    background-color: #4466cc;
    color: white;
}

.danger {
    background-color: #e74c3c;
    color: white;
}

.primary:hover {
    background-color: #2ecc71;
}

.secondary:hover {
    background-color: #5577dd;
}

.danger:hover {
    background-color: #f85c4d;
}

.info-text {
    margin-top: 16px;
    padding-top: 12px;
    border-top: 1px solid var(--color-border);
    font-size: 12px;
}

.creator-link {
    display: inline-block;
    margin-top: 8px;
    color: var(--green);
    text-decoration: none;
}

.creator-link:hover {
    text-decoration: underline;
}

.debug-button {
    position: absolute;
    bottom: 10px;
    right: 10px;
    background-color: transparent;
    color: transparent;
    border: none;
    padding: 5px;
    cursor: pointer;
    font-size: 0;
}

.debug-button:active {
    color: var(--color-text-muted);
    font-size: 10px;
}

.no-minigames {
    text-align: center;
    padding: 16px;
    color: var(--color-text);
    font-style: italic;
}

.upload-section {
    margin-top: 16px;
    padding: 12px;
    border: 1px dashed var(--color-border);
    border-radius: 4px;
    background-color: var(--color-background);
}

.file-label {
    display: inline-block;
    padding: 8px 12px;
    background-color: var(--color-background-mute);
    border: 1px solid var(--color-border);
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    color: var(--green);
    transition: all 0.2s;
}

.file-label:hover {
    background-color: var(--color-background-soft);
    border-color: var(--green);
}

.file-input {
    opacity: 0;
    position: absolute;
    z-index: -1;
}

.file-format-info {
    margin-top: 8px;
    font-size: 12px;
    color: var(--color-text-muted);
}

.dangerbar {
    min-width: 200px;
    width: 10%;
    max-width: 400px;
}

.graph-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    z-index: 1;
}
</style>
