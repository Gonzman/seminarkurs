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

const isDarkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches)
const graph = ref<vNG.Instance | null>(null)
const tooltip = ref<HTMLDivElement | null>(null)
const targetNodeId = ref<string>('')
const tooltipOpacity = ref(0)
const tooltipPos = ref({ left: '0px', top: '0px' })

const edges: Edges = {
    edge1: { source: 'node1', target: 'node2' },
    edge2: { source: 'node2', target: 'node3' },
    edge3: { source: 'node2', target: 'node4' },
    edge4: { source: 'node4', target: 'node5' },
    edge5: { source: 'node4', target: 'node6' },
}

const layouts = ref<Layouts>({
    nodes: {
        node1: { x: 0, y: 150, fixed: true },
    },
})

const nodes = reactive<Nodes>({
    node1: {
        name: 'N1',
        icon: '&#xe320',
        color: Status.getColor(Status.Status.HACKED),
        draggable: false,
    },
    node2: { name: 'N2', icon: '&#xe328', color: Status.getColor(Status.Status.ONLINE) },
    node3: { name: 'N3', icon: '&#xe331', color: Status.getColor(Status.Status.ONLINE) },
    node4: { name: 'N4', icon: '&#xe2bd', color: Status.getColor(Status.Status.OFFLINE) },
    node5: { name: 'N5', icon: '&#xf0e2', color: 'hotpink' },
    node6: { name: 'N6', icon: '&#xea75', color: 'lightskyblue' },
})

const configs = reactive(
    defineConfigs({
        node: {
            selectable: true,
            draggable: (node) => (node.draggable !== undefined ? node.draggable : true),
            normal: {
                color: (node) => node.color,
                radius: 20,
            },
            hover: {
                radius: 22,
            },
        },
        label: {
            visible: true,
            fontSize: 11,
            lineHeight: 1.1,
            color: isDarkMode.value ? '#000000' : '#ffffff',
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
                    // d3-force parameters
                    const forceLink = d3
                        .forceLink<ForceNodeDatum, ForceEdgeDatum>(edges)
                        .id((d: { id: any }) => d.id)
                    return d3
                        .forceSimulation(nodes)
                        .force('edge', forceLink.distance(40).strength(0.5))
                        .force('charge', d3.forceManyBody().strength(-800))
                        .force('center', d3.forceCenter().strength(0.05))
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

watch(
    () => [targetNodePos.value, tooltipOpacity.value],
    () => {
        if (!graph.value || !tooltip.value) return

        const domPoint = graph.value.translateFromSvgToDomCoordinates(targetNodePos.value)
        tooltipPos.value = {
            left: `${domPoint.x - tooltip.value.offsetWidth / 2}px`,
            top: `${domPoint.y - 20 - tooltip.value.offsetHeight - 10}px`,
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
    console.log('12')
    const nodeId = `node${nextNodeIndex.value}`
    const name = `N${nextNodeIndex.value}`
    const icon = '&#xe328'
    const color = Status.getColor(Status.Status.ONLINE)

    // Add new node
    nodes[nodeId] = { name, icon, color }

    nextNodeIndex.value++
}
</script>

<template>
    <div class="graph">
        <v-network-graph
            ref="graph"
            v-model:layouts="layouts"
            :nodes="nodes"
            :edges="edges"
            :configs="configs"
            :event-handlers="eventHandlers"
        />
        <div ref="tooltip" class="tooltip" :style="{ ...tooltipPos, opacity: tooltipOpacity }">
            <div>{{ nodes[targetNodeId]?.name ?? '' }}</div>
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
    position: absolute;
    background-color: #fff0bd;
    border: 1px solid #ffb950;
    box-shadow: 2px 2px 2px #aaa;
    padding: 6px;
    text-align: center;
    font-size: 12px;
    opacity: 0;
    transition: opacity 0.2s linear;
    pointer-events: none;
}
</style>
