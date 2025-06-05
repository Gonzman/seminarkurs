<script setup lang="ts">
import { defineConfigs, type Layouts, type Nodes } from 'v-network-graph'
import * as vNG from 'v-network-graph'
import {
    ForceLayout,
    type ForceNodeDatum,
    type ForceEdgeDatum,
} from 'v-network-graph/lib/force-layout'
import { computed, onMounted, reactive, ref } from 'vue'
import * as Status from './status'
import { games } from '@/stores/knowledge'
import Level from '@/views/minigames/level'
import type { KnowledgeItem } from '@/stores/knowledge'
import knowledgeData from '@/data/knowledge.json'
import { config, type Edge, type GraphData, type Node } from './graph'

const graph = ref<vNG.Instance | null>(null)
const nodeForm = ref<HTMLFormElement | null>(null)
const edgeForm = ref<HTMLFormElement | null>(null)
const graphName = ref('my-graph')
const savedGraphs = ref<Array<{ name: string, data: GraphData }>>([])
const selectedGraph = ref<string>('')
const errorMessage = ref('')
const knowledgeItems = ref<KnowledgeItem[]>(knowledgeData as KnowledgeItem[])
const selectedKnowledgeIds = ref<number[]>([])

onMounted(() => {
    initializeStartNode();

    const savedData = localStorage.getItem('saved-graphs')
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData)
            savedGraphs.value = parsed
        } catch (e) {
            console.error('Failed to parse saved graphs', e)
        }
    }
})



const edges = reactive<Record<string, Edge>>({})

const layouts = ref<Layouts>({
    nodes: {}
})

const nodes = reactive<Record<string, Node>>({})


function generateNodeId(): string {
    let prefix = makeid(5);


    while (nodes[prefix]) {
        prefix = makeid(5);
    }

    return prefix;
}

function generateEdgeId(): string {
    let prefix = makeid(5);


    while (edges[prefix]) {
        prefix = makeid(5);
    }

    return prefix;
}

function initializeStartNode() {

    if (Object.keys(nodes).length === 0) {
        nodes['start'] = {
            name: 'start',
            icon: '&#xe320',
            status: Status.Status.START,
            draggable: false,
        };

        layouts.value.nodes = {
            'start': { x: 0, y: 0, fixed: true }
        };
    }
}

const newNode = reactive({
    id: '',
    name: '',
    icon: '&#xe328',
    status: Status.Status.ONLINE,
    draggable: true,
    minigame: undefined as games | undefined,
    difficulty: undefined as Level | undefined,
    x: 0,
    y: 0,
    knowledgeIds: [] as number[]
})

function makeid(length: number): string {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const newEdge = reactive({
    id: '',
    source: '',
    target: '',
    color: '#4466cc',
    dashed: false
})

const statusOptions = computed(() => {
    const options = []
    for (const status in Status.Status) {
        if (isNaN(Number(status))) {
            options.push({
                value: Status.Status[status as keyof typeof Status.Status],
                label: status
            })
        }
    }
    return options
})


const minigameOptions = computed(() => {
    const options = []
    for (const game in games) {
        if (isNaN(Number(game))) {
            options.push({
                value: games[game as keyof typeof games],
                label: game
            })
        }
    }
    return options
})


const difficultyOptions = computed(() => {
    const options = []
    for (const level in Level) {
        if (isNaN(Number(level))) {
            options.push({
                value: Level[level as keyof typeof Level],
                label: level
            })
        }
    }
    return options
})


const nodeOptions = computed(() => {
    return Object.keys(nodes).map(id => ({
        value: id,
        label: `${nodes[id].name}`
    }))
})

const configs = config(nodes, true)


const eventHandlers: vNG.EventHandlers = {
    'node:click': ({ node }) => {
        if (!node) return;


        newNode.id = node;
        if (nodes[node]) {
            newNode.name = nodes[node].name || '';
            newNode.icon = nodes[node].icon;
            newNode.status = nodes[node].status;
            newNode.draggable = nodes[node].draggable ?? true;
            newNode.minigame = nodes[node].minigame;
            newNode.difficulty = nodes[node].difficulty;
            newNode.knowledgeIds = nodes[node].knowledgeIds || [];
            selectedKnowledgeIds.value = [...(nodes[node].knowledgeIds || [])];
        }


        if (layouts.value.nodes && layouts.value.nodes[node as string]) {
            newNode.x = layouts.value.nodes[node as string].x;
            newNode.y = layouts.value.nodes[node as string].y;
        }


        errorMessage.value = '';
    },
    'edge:click': ({ edge }) => {
        if (!edge || !edges[edge]) return;


        newEdge.id = edge;
        newEdge.source = edges[edge].source;
        newEdge.target = edges[edge].target;
        newEdge.color = edges[edge].color ?? '#4466cc';
        newEdge.dashed = edges[edge].dashed ?? false;


        errorMessage.value = '';
    },
    'node:dragend': ({ node, position }) => {
        if (!node || !position) return;

        if (!layouts.value.nodes) {
            layouts.value.nodes = {};
        }

        const nodeId = node.toString();

        layouts.value.nodes[nodeId] = {
            x: position.x,
            y: position.y,
            fixed: layouts.value.nodes[nodeId]?.fixed || false
        };
    },
    'view:click': () => {
        resetNodeForm();
        resetEdgeForm();
    },
    'edge:pointerout': () => {


    }
}

function toggleKnowledge(id: number) {
    const index = selectedKnowledgeIds.value.indexOf(id);
    if (index === -1) {
        selectedKnowledgeIds.value.push(id);
    } else {
        selectedKnowledgeIds.value.splice(index, 1);
    }
    newNode.knowledgeIds = [...selectedKnowledgeIds.value];
}

function addNode() {

    errorMessage.value = '';


    if (!newNode.name.trim()) {
        errorMessage.value = 'Node name is required';
        return;
    }


    const isEdit = newNode.id.trim() !== '' && newNode.id in nodes;


    const nodeId = isEdit ? newNode.id : generateNodeId();


    nodes[nodeId] = {
        name: newNode.name + " (" + nodeId + ")",
        icon: newNode.icon,
        status: newNode.status,
        draggable: newNode.draggable,
        minigame: newNode.minigame,
        difficulty: newNode.difficulty,
        knowledgeIds: [...selectedKnowledgeIds.value]
    }


    if (!layouts.value.nodes) {
        layouts.value.nodes = {};
    }

    if (!isEdit || !layouts.value.nodes[nodeId]) {
        layouts.value.nodes[nodeId] = {
            x: newNode.x || (Math.random() * 300 - 150),
            y: newNode.y || (Math.random() * 300 - 150),
            fixed: false
        }
    } else {

        if (newNode.x !== layouts.value.nodes[nodeId].x ||
            newNode.y !== layouts.value.nodes[nodeId].y) {
            layouts.value.nodes[nodeId] = {
                x: newNode.x,
                y: newNode.y,
                fixed: layouts.value.nodes[nodeId].fixed || false
            }
        }
    }


    resetNodeForm();
}


function addEdge() {

    errorMessage.value = '';

    if (!newEdge.source.trim() || !newEdge.target.trim()) {
        errorMessage.value = 'Source and target nodes are required';
        return;
    }


    const edgeId = newEdge.id.trim() !== '' ? newEdge.id : `edge${generateEdgeId()}`;


    edges[edgeId] = {
        source: newEdge.source,
        target: newEdge.target,
        color: newEdge.color,
        dashed: newEdge.dashed
    }


    resetEdgeForm();
}


function resetNodeForm() {
    newNode.id = '';
    newNode.name = ''
    newNode.icon = '&#xe328'
    newNode.status = Status.Status.ONLINE
    newNode.draggable = true
    newNode.minigame = undefined
    newNode.difficulty = undefined
    newNode.knowledgeIds = []
    selectedKnowledgeIds.value = []

    if (nodeForm.value) {
        nodeForm.value.reset()
    }

    errorMessage.value = ''
}


function resetEdgeForm() {
    newEdge.id = ''
    newEdge.source = ''
    newEdge.target = ''
    newEdge.color = '#4466cc'
    newEdge.dashed = false

    if (edgeForm.value) {
        edgeForm.value.reset()
    }

    errorMessage.value = ''
}


function removeNode(nodeId: string) {
    if (nodeId === 'start' && nodes[nodeId].status === Status.Status.START) {
        errorMessage.value = "Cannot delete the start node";
        return;
    }


    for (const edgeId in edges) {
        if (edges[edgeId].source === nodeId || edges[edgeId].target === nodeId) {
            delete edges[edgeId]
        }
    }


    delete nodes[nodeId]


    if (layouts.value.nodes && layouts.value.nodes[nodeId]) {
        delete layouts.value.nodes[nodeId]
    }

    resetNodeForm()
}


function removeEdge(edgeId: string) {
    delete edges[edgeId]
    resetEdgeForm()
}


function saveGraph() {

    errorMessage.value = '';

    if (!graphName.value.trim()) {
        errorMessage.value = 'Please enter a name for your graph';
        return;
    }

    const graphData: GraphData = {
        nodes: {},
        edges: { ...edges },
        layouts: { ...layouts.value }
    }

    Object.keys(nodes).forEach(key => {
        const node = { ...nodes[key] };
        if (node.name && node.name.includes(' (') && node.name.endsWith(')')) {
            const lastParenIndex = node.name.lastIndexOf(' (');
            node.name = node.name.substring(0, lastParenIndex);
        }
        graphData.nodes[key] = node;
    });

    const existingIndex = savedGraphs.value.findIndex(graph => graph.name === graphName.value);

    if (existingIndex >= 0) {
        savedGraphs.value[existingIndex].data = graphData;
    } else {
        savedGraphs.value.push({
            name: graphName.value,
            data: graphData
        });
    }

    localStorage.setItem('saved-graphs', JSON.stringify(savedGraphs.value));
    alert(`Graph "${graphName.value}" saved successfully!`);
}

function loadGraph() {

    errorMessage.value = '';

    if (!selectedGraph.value) {
        errorMessage.value = 'Please select a graph to load';
        return;
    }

    const graph = savedGraphs.value.find(g => g.name === selectedGraph.value);
    if (!graph) {
        errorMessage.value = 'Graph not found';
        return;
    }


    Object.keys(nodes).forEach(key => delete nodes[key]);
    Object.keys(edges).forEach(key => delete edges[key]);


    Object.entries(graph.data.nodes).forEach(([id, node]) => {
        const newNode = { ...node };
        if (newNode.status !== Status.Status.START) {
            newNode.name = newNode.name + " (" + id + ")";
        }
        nodes[id] = newNode;
    });


    Object.entries(graph.data.edges).forEach(([id, edge]) => {
        edges[id] = { ...edge };
    });


    layouts.value = { ...graph.data.layouts };


    graphName.value = selectedGraph.value;


    if (!Object.values(nodes).some(node => node.status === Status.Status.START)) {
        initializeStartNode();
    }

    alert(`Graph "${selectedGraph.value}" loaded successfully!`);
}


function deleteGraph() {

    errorMessage.value = '';

    if (!selectedGraph.value) {
        errorMessage.value = 'Please select a graph to delete';
        return;
    }

    const confirmDelete = confirm(`Are you sure you want to delete the graph "${selectedGraph.value}"?`)
    if (!confirmDelete) return

    savedGraphs.value = savedGraphs.value.filter(graph => graph.name !== selectedGraph.value)
    localStorage.setItem('saved-graphs', JSON.stringify(savedGraphs.value))
    selectedGraph.value = ''
    alert('Graph deleted successfully')
}


function exportGraph() {
    const graphData: GraphData = {
        nodes: {},
        edges: { ...edges },
        layouts: { ...layouts.value }
    }

    Object.keys(nodes).forEach(key => {
        const node = { ...nodes[key] };
        if (node.name && node.name.includes(' (') && node.name.endsWith(')')) {
            const lastParenIndex = node.name.lastIndexOf(' (');
            node.name = node.name.substring(0, lastParenIndex);
        }
        graphData.nodes[key] = node;
    });

    const jsonString = JSON.stringify(graphData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `${graphName.value || 'graph'}.json`;
    a.click();

    URL.revokeObjectURL(url);
}

function importGraph(event: Event) {

    errorMessage.value = '';

    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return

    const file = input.files[0]
    const reader = new FileReader()

    reader.onload = (e) => {
        try {
            const content = e.target?.result as string
            const graphData = JSON.parse(content) as GraphData


            Object.keys(nodes).forEach(key => delete nodes[key])
            Object.keys(edges).forEach(key => delete edges[key])


            Object.entries(graphData.nodes).forEach(([id, node]) => {
                const newNode = { ...node };
                if (newNode.status !== Status.Status.START) {
                    newNode.name = newNode.name + " (" + id + ")";
                }
                nodes[id] = newNode;
            })


            Object.entries(graphData.edges).forEach(([id, edge]) => {
                edges[id] = { ...edge }
            })


            layouts.value = { ...graphData.layouts }


            if (!Object.values(nodes).some(node => node.status === Status.Status.START)) {
                initializeStartNode();
            }

            alert('Graph imported successfully!')
        } catch (error) {
            errorMessage.value = 'Failed to import graph. Invalid JSON format.'
            console.error('Import error:', error)
        }


        input.value = ''
    }

    reader.readAsText(file)
}
</script>

<template>
    <div class="graph-creator">
        <div class="header">
            <h1>Graph Creator</h1>
        </div>

        <div class="content">
            <div class="graph-container">
                <v-network-graph ref="graph" v-model:layouts="layouts" :nodes="nodes" :edges="edges" :configs="configs"
                    :event-handlers="eventHandlers" />
            </div>

            <div class="control-panel">
                <div v-if="errorMessage" class="error-message">
                    {{ errorMessage }}
                </div>

                <div class="panel-section">
                    <h3>Nodes</h3>
                    <form ref="nodeForm" @submit.prevent="addNode" class="form">
                        <div class="form-group">
                            <p>ID: {{ newNode.id }}</p>
                        </div>

                        <div class="form-group required">
                            <label for="node-name">Name: <span class="required-mark">*</span></label>
                            <input type="text" id="node-name" v-model="newNode.name" required />
                        </div>

                        <div class="form-group">
                            <label for="node-icon">Icon:</label>
                            <input type="text" id="node-icon" v-model="newNode.icon" />
                        </div>

                        <div class="form-group">
                            <label for="node-status">Status:</label>
                            <select id="node-status" v-model="newNode.status">
                                <option v-for="option in Status.Status" :key="option" :value="option">
                                    {{ option }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group checkbox">
                            <input type="checkbox" id="node-draggable" v-model="newNode.draggable" />
                            <label for="node-draggable">Draggable</label>
                        </div>

                        <div class="form-group">
                            <label for="node-x">X:</label>
                            <input type="number" id="node-x" v-model.number="newNode.x" />
                        </div>

                        <div class="form-group">
                            <label for="node-y">Y:</label>
                            <input type="number" id="node-y" v-model.number="newNode.y" />
                        </div>

                        <div class="form-group">
                            <label for="node-minigame">Minigame:</label>
                            <select id="node-minigame" v-model="newNode.minigame">
                                <option :value="undefined">-- No Minigame --</option>
                                <option v-for="option in minigameOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="node-difficulty">Difficulty:</label>
                            <select id="node-difficulty" v-model="newNode.difficulty">
                                <option :value="undefined">-- No Difficulty --</option>
                                <option v-for="option in difficultyOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Knowledge: <span class="hint">(Independent from minigames)</span></label>
                            <div class="knowledge-selector">
                                <div v-for="item in knowledgeItems" :key="item.id" class="knowledge-item"
                                    :class="{ selected: selectedKnowledgeIds.includes(item.id) }"
                                    @click="toggleKnowledge(item.id)">
                                    <div class="knowledge-title">{{ item.title }}</div>
                                </div>
                            </div>
                            <div class="hint-text">Select multiple knowledge items that this node will make available to
                                the player.</div>
                        </div>

                        <div class="button-row">
                            <button type="submit" class="btn primary">{{ newNode.id in nodes ? 'Update' : 'Add' }}
                                Node</button>
                            <button type="button" class="btn secondary" @click="resetNodeForm">Clear</button>
                            <button type="button" class="btn danger"
                                v-if="newNode.id in nodes && !(newNode.id === 'node1' && nodes[newNode.id].status === Status.Status.START)"
                                @click="removeNode(newNode.id)">Delete</button>
                        </div>
                    </form>

                    <div class="node-list">
                        <h4>Node List</h4>
                        <ul>
                            <li v-for="(node, id) in nodes" :key="id" @click="() => {
                                newNode.id = id;
                                newNode.name = node.name || '';
                                newNode.icon = node.icon;
                                newNode.status = node.status;
                                newNode.draggable = node.draggable ?? true;
                                newNode.minigame = node.minigame;
                                newNode.difficulty = node.difficulty;
                                newNode.knowledgeIds = node.knowledgeIds || [];
                                selectedKnowledgeIds = [...(node.knowledgeIds || [])];


                                const nodeLayouts = layouts.nodes || {};
                                if (nodeLayouts[id]) {
                                    newNode.x = nodeLayouts[id].x;
                                    newNode.y = nodeLayouts[id].y;
                                }
                            }">
                                {{ id }} - {{ node.name }} ({{ Status.getStatusString(node.status) }})
                                <span v-if="node.minigame !== undefined" class="minigame-tag">{{
                                    Object.keys(games).find(key => games[key as keyof typeof games] === node.minigame)
                                    || 'Game'
                                    }}</span>
                                <span v-if="node.knowledgeIds && node.knowledgeIds.length > 0" class="knowledge-tag">
                                    {{ node.knowledgeIds.length }} knowledge items
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="panel-section">
                    <h3>Edges</h3>
                    <form ref="edgeForm" @submit.prevent="addEdge" class="form">
                        <div class="form-group">
                            <label for="edge-id">ID: <span class="hint">(Auto-generated if empty)</span></label>
                            <input type="text" id="edge-id" v-model="newEdge.id" />
                        </div>

                        <div class="form-group required">
                            <label for="edge-source">Source: <span class="required-mark">*</span></label>
                            <select id="edge-source" v-model="newEdge.source" required>
                                <option value="">Select Source Node</option>
                                <option v-for="option in nodeOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group required">
                            <label for="edge-target">Target: <span class="required-mark">*</span></label>
                            <select id="edge-target" v-model="newEdge.target" required>
                                <option value="">Select Target Node</option>
                                <option v-for="option in nodeOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="edge-color">Color:</label>
                            <input type="color" id="edge-color" v-model="newEdge.color" />
                        </div>

                        <div class="form-group checkbox">
                            <input type="checkbox" id="edge-dashed" v-model="newEdge.dashed" />
                            <label for="edge-dashed">Dashed</label>
                        </div>

                        <div class="button-row">
                            <button type="submit" class="btn primary">{{ newEdge.id in edges ? 'Update' : 'Add' }}
                                Edge</button>
                            <button type="button" class="btn secondary" @click="resetEdgeForm">Clear</button>
                            <button type="button" class="btn danger" v-if="newEdge.id in edges"
                                @click="removeEdge(newEdge.id)">Delete</button>
                        </div>

                    </form>

                    <div class="edge-list">
                        <h4>Edge List</h4>
                        <ul>
                            <li v-for="(edge, id) in edges" :key="id"
                                @click="() => { newEdge.id = id; newEdge.source = edge.source; newEdge.target = edge.target; newEdge.color = edge.color ?? '#4466cc'; newEdge.dashed = edge.dashed ?? false; }">
                                {{ id }}: {{ edge.source }} → {{ edge.target }}
                            </li>
                        </ul>
                    </div>
                </div>

                <div class="panel-section save-load">
                    <h3>Save & Load</h3>

                    <div class="form-group required">
                        <label for="graph-name">Graph Name: <span class="required-mark">*</span></label>
                        <input type="text" id="graph-name" v-model="graphName" required />
                    </div>

                    <div class="button-row">
                        <button class="btn primary" @click="saveGraph">Save Graph</button>
                        <button class="btn secondary" @click="exportGraph">Export JSON</button>
                    </div>

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
                        <button class="btn primary" @click="loadGraph" :disabled="!selectedGraph">Load Graph</button>
                        <button class="btn danger" @click="deleteGraph" :disabled="!selectedGraph">Delete Graph</button>
                    </div>

                    <div class="form-group">
                        <label for="import-file">Import JSON:</label>
                        <input type="file" id="import-file" accept=".json" @change="importGraph" />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
.graph-creator {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: hidden;
}

.header {
    padding: 1rem;
    background-color: var(--color-background-mute);
    border-bottom: 1px solid var(--color-border);
}

h1 {
    margin: 0;
    font-size: 1.5rem;
    color: var(--green);
}

.content {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.graph-container {
    flex: 1;
    position: relative;
    overflow: hidden;
}

.control-panel {
    width: 300px;
    background-color: var(--color-background-soft);
    border-left: 1px solid var(--color-border);
    padding: 1rem;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.panel-section {
    padding: 1rem;
    background-color: var(--color-background-mute);
    border-radius: 4px;
}

h3 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--green);
    border-bottom: 1px solid var(--color-border);
    padding-bottom: 0.5rem;
}

h4 {
    margin-bottom: 0.5rem;
}

.form {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.form-group.checkbox {
    flex-direction: row;
    align-items: center;
    gap: 0.5rem;
}

.form-group.required label {
    font-weight: bold;
}

.required-mark {
    color: #e74c3c;
}

.hint {
    font-size: 0.8rem;
    color: #aaa;
    font-style: italic;
}

label {
    font-size: 0.9rem;
    color: var(--color-text);
}

input,
select {
    padding: 0.5rem;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background-color: var(--color-background);
    color: var(--color-text);
    font-size: 0.9rem;
}

input[readonly] {
    background-color: rgba(100, 100, 100, 0.2);
    cursor: not-allowed;
}

input[type="checkbox"] {
    width: auto;
}

input:focus,
select:focus {
    border-color: var(--green);
    outline: none;
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

.node-list,
.edge-list {
    margin-top: 1rem;
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 4px;
}

ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

li {
    padding: 0.5rem;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.2s;
}

li:hover {
    background-color: var(--color-background);
}

.save-load {
    border-top: 1px solid var(--color-border);
    padding-top: 1rem;
}

.error-message {
    background-color: rgba(231, 76, 60, 0.2);
    border: 1px solid #e74c3c;
    color: #e74c3c;
    padding: 0.75rem;
    border-radius: 4px;
    margin-bottom: 1rem;
    font-size: 0.9rem;
}

.minigame-tag {
    background-color: var(--green);
    color: black;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.8rem;
    margin-left: 8px;
    display: inline-block;
}

.knowledge-tag {
    background-color: #4466cc;
    color: white;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 0.8rem;
    margin-left: 8px;
    display: inline-block;
}

.knowledge-selector {
    max-height: 200px;
    overflow-y: auto;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    padding: 0.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.knowledge-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem;
    border-radius: 4px;
    background-color: var(--color-background);
    cursor: pointer;
    transition: all 0.2s;
}

.knowledge-item.selected {
    background-color: var(--green);
    color: black;
}

.knowledge-title {
    font-weight: bold;
}
</style>
