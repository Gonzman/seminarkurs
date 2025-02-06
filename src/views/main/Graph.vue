<script setup lang="ts">
import { defineConfigs, type Edges, type Layouts, type Nodes } from 'v-network-graph'
import * as vNG from 'v-network-graph'
import {
    ForceLayout,
    type ForceNodeDatum,
    type ForceEdgeDatum,
} from 'v-network-graph/lib/force-layout'
import { computed, reactive, ref, watch } from 'vue'
import * as Status from './status'

const graph = ref<vNG.Instance | null>(null)
const tooltip = ref<HTMLDivElement | null>(null)
const targetNodeId = ref<string>('')
const tooltipOpacity = ref(0)
const tooltipPos = ref({ left: '0px', top: '0px' })

const edges = reactive<Edges>({
    edge1: { source: 'node1', target: 'node2' },
    edge2: { source: 'node1', target: 'node3' },
    edge3: { source: 'node1', target: 'node4' },
    edge4: { source: 'node4', target: 'node5' },
    edge5: { source: 'node4', target: 'node6' },
})

interface Node extends vNG.Node {
    icon: string
    status: Status.Status
    draggable?: boolean
}

const layouts = ref<Layouts>({
    nodes: {
        node1: { x: 0, y: 150, fixed: true },
    },
})

const nodes = reactive<Record<string, Node>>({
    node1: {
        name: 'start',
        icon: '&#xe320',
        status: Status.Status.START,
        draggable: false,
    },
    node2: { name: 'N2 12', icon: '&#xe328', status: Status.Status.ONLINE },
    node3: { name: 'N3', icon: '&#xe331', status: Status.Status.ONLINE },
    node4: { name: 'N4', icon: '&#xe331', status: Status.Status.ONLINE },
})

const configs = reactive(
    defineConfigs({
        node: {
            selectable: true,
            draggable: (node) => (node.draggable !== undefined ? node.draggable : true),
            normal: {
                color: (node) => Status.getColor(node.status),
                radius: 20,
            },
            hover: {
                color: (node) => Status.getColor(node.status),
                radius: 22,
            },
            label: {
                visible: true,
                fontSize: 11,
                lineHeight: 1.1,
                color: '#FFFFFF',
                fontFamily: 'Pixel',
            },
        },

        focusring: {
            visible: true,
            width: 4,
            padding: 3,
            color: '#eebb00',
            dasharray: '0',
        },
        view: {
            layoutHandler: new ForceLayout({
                positionFixedByDrag: false,
                positionFixedByClickWithAltKey: true,
                createSimulation: (d3, nodes, edges) => {
                    const forceLink = d3
                        .forceLink<ForceNodeDatum, ForceEdgeDatum>(edges)
                        .id((d: { id: any }) => d.id)
                    return d3
                        .forceSimulation(nodes)
                        .force('edge', forceLink.distance(40).strength(0.5))
                        .force('charge', d3.forceManyBody().strength(-800))
                        .force('center', d3.forceCenter().strength(0.008))
                        .alphaMin(0.001)

                    // * The following are the default parameters for the simulation.
                    // const forceLink = d3.forceLink<ForceNodeDatum, ForceEdgeDatum>(edges).id(d => d.id)
                    // return d3
                    //   .forceSimulation(nodes)
                    //   .force("edge", forceLink.distance(100))
                    //   .force("charge", d3.forceManyBody())
                    //   .force("collide", d3.forceCollide(50).strength(0.2))
                    //   .force("center", d3.forceCenter().strength(0.05))
                    //   .alphaMin(0.001)
                },
            }),
        },
    }),
)

const targetNodePos = computed(() => {
    return layouts.value.nodes[targetNodeId.value] || { x: 0, y: 0 }
})

function fisherYatesShuffle(array: any[]): void {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[array[i], array[j]] = [array[j], array[i]]
    }
}

watch(
    () => [targetNodePos.value, tooltipOpacity.value],
    () => {
        if (!graph.value || !tooltip.value) return

        const domPoint = graph.value.translateFromSvgToDomCoordinates(targetNodePos.value)
        tooltipPos.value = {
            left: `${domPoint.x - tooltip.value.offsetWidth + 250}px`,
            top: `${domPoint.y}px`,
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
}
const nextNodeIndex = ref(Object.keys(nodes).length + 1)
const nextEdgeIndex = ref(Object.keys(edges).length + 1)

function addNode() {
    const nodeId = `node${nextNodeIndex.value}`
    const name = `N${nextNodeIndex.value}`
    const icon = '&#xe328'
    const status = Status.Status.ONLINE

    nodes[nodeId] = { name, icon, status }

    nextNodeIndex.value++
}

function addRandomNode() {
    //bug: Kann unendlich viele Nodes spawnen, möglicherweise werden die Edges im Array nicht aktualisiert
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

defineExpose({ addRandomNode })
</script>

<template>
    <div class="graph">
        <button @click="addRandomNode">12</button>
        <v-network-graph
            ref="graph"
            v-model:layouts="layouts"
            :nodes="nodes"
            :edges="edges"
            :configs="configs"
            :event-handlers="eventHandlers"
        />
        <div ref="tooltip" class="tooltip" :style="{ ...tooltipPos, opacity: tooltipOpacity }">
            <div>Name: {{ nodes[targetNodeId]?.name ?? '' }}</div>
            <div>Status: {{ Status.getStatusString(nodes[targetNodeId]?.status) }}</div>
            <div>Ip: {{ nameToIP(nodes[targetNodeId]?.name ?? '') }}</div>
        </div>
    </div>
</template>

<style lang="css" scoped>
.graph {
    position: fixed;
    top: 0;
    left: 0;
    height: 100%;
    width: 100%;
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
}
</style>
