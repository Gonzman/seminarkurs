import * as vNG from 'v-network-graph'

import * as Status from './status'
import type { games } from '@/stores/knowledge'
import type Level from '../minigames/level'

import { defineConfigs, type Layouts, type Nodes } from 'v-network-graph'
import { reactive } from 'vue'
import {
    ForceLayout,
    type ForceEdgeDatum,
    type ForceNodeDatum,
} from 'v-network-graph/lib/force-layout'

export interface Node extends vNG.Node {
    icon: string
    status: Status.Status
    draggable?: boolean
    minigame?: games
    difficulty?: Level
    knowledgeIds?: number[]
}

export interface Edge extends vNG.Edge {
    color?: string
    dashed?: boolean
}

export interface GraphData {
    nodes: Record<string, Node>
    edges: Record<string, Edge>
    layouts: Layouts
}

export const config = (nodes: Record<string, Node>, isCreator: boolean) =>
    reactive(
        defineConfigs({
            node: {
                selectable: true,
                draggable: (node: vNG.Node) =>
                    node.draggable !== undefined ? node.draggable : true,
                normal: {
                    color: (node: vNG.Node) => Status.getColor(node.status),
                    radius: 20,
                },
                hover: {
                    color: (node: vNG.Node) => Status.getColor(node.status),
                    radius: 22,
                },
                label: {
                    visible: true,
                    fontSize: isCreator ? 20 : 11,
                    lineHeight: 1.1,
                    color: '#FFFFFF',
                    fontFamily: isCreator ? 'italic' : 'Pixel',
                },
            },
            edge: {
                normal: {
                    color: (edge: vNG.Edge) => edge.color ?? '#4466cc',
                    dasharray: (edge: vNG.Edge) => {
                        if (
                            !edge.source ||
                            !edge.target ||
                            !nodes[edge.source] ||
                            !nodes[edge.target]
                        ) {
                            return edge.dashed ? '6' : '0'
                        }

                        const sourceNode = nodes[edge.source]
                        const targetNode = nodes[edge.target]

                        if (isCreator) {
                            return edge.dashed ? '6' : '0'
                        }

                        const shouldAnimate =
                            (sourceNode.status === Status.Status.START &&
                                targetNode.status === Status.Status.ONLINE) ||
                            (targetNode.status === Status.Status.START &&
                                sourceNode.status === Status.Status.ONLINE) ||
                            (sourceNode.status === Status.Status.HACKED &&
                                targetNode.status === Status.Status.ONLINE) ||
                            (targetNode.status === Status.Status.HACKED &&
                                sourceNode.status === Status.Status.ONLINE) ||
                            (sourceNode.status === Status.Status.HACKED &&
                                targetNode.status === Status.Status.HACKED)

                        return shouldAnimate ? '6' : edge.dashed ? '6' : '0'
                    },
                    width: 5,
                    animate: (edge) => {
                        if (
                            !edge.source ||
                            !edge.target ||
                            !nodes[edge.source] ||
                            !nodes[edge.target]
                        ) {
                            return false
                        }

                        const sourceNode = nodes[edge.source]
                        const targetNode = nodes[edge.target]

                        if (isCreator) {
                            return true
                        }

                        return (
                            (sourceNode.status === Status.Status.START &&
                                targetNode.status === Status.Status.ONLINE) ||
                            (targetNode.status === Status.Status.START &&
                                sourceNode.status === Status.Status.ONLINE) ||
                            (sourceNode.status === Status.Status.HACKED &&
                                targetNode.status === Status.Status.ONLINE) ||
                            (targetNode.status === Status.Status.HACKED &&
                                sourceNode.status === Status.Status.ONLINE) ||
                            (sourceNode.status === Status.Status.HACKED &&
                                targetNode.status === Status.Status.HACKED)
                        )
                    },
                    animationSpeed: (edge) => {
                        if (
                            !edge.source ||
                            !edge.target ||
                            !nodes[edge.source] ||
                            !nodes[edge.target]
                        ) {
                            return 40
                        }
                        if (isCreator) {
                            return 40
                        }

                        return 40
                    },
                },
                hover: {
                    color: (edge) => edge.color ?? '#4466cc',
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
                    positionFixedByDrag: isCreator,
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
                    },
                }),
            },
        }),
    )
