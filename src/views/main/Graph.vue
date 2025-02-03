<template>
  <div class="graph">
    <v-network-graph
      ref="graph"
      v-model:layouts="layouts"
      :nodes="nodes"
      :edges="edges"
      :configs="configs"
      :event-handlers="eventHandlers"
    >
      <defs>
        <component is="style">
          @font-face {
            font-family: 'Material Icons';
            font-style: normal;
            font-weight: 400;
            src: url(https://fonts.gstatic.com/s/materialicons/v97/flUhRq6tzZclQEJ-Vdg-IuiaDsNcIhQ8tQ.woff2) format('woff2');
          }
        </component>
      </defs>

      <template #override-node="{ nodeId, scale, config, ...slotProps }">
        <circle :r="config.radius * scale" :fill="config.color" v-bind="slotProps" />
        <text
          font-family="Material Icons"
          :font-size="22 * scale"
          fill="#ffffff"
          text-anchor="middle"
          dominant-baseline="central"
          style="pointer-events: none"
          v-html="nodes[nodeId]?.icon"
        />
      </template>
    </v-network-graph>

    <!-- Tooltip -->
    <div ref="tooltip" class="tooltip" :style="{ ...tooltipPos, opacity: tooltipOpacity }">
      <div>{{ nodes[targetNodeId]?.name ?? "" }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineConfigs, type Edges, type Layouts, type Nodes } from 'v-network-graph';
import * as vNG from 'v-network-graph';
import { computed, reactive, ref, watch } from 'vue';

const isDarkMode = ref(window.matchMedia('(prefers-color-scheme: dark)').matches);
const graph = ref<vNG.Instance | null>(null);
const tooltip = ref<HTMLDivElement | null>(null);

const edges: Edges = {
  edge1: { source: "node1", target: "node2" },
  edge2: { source: "node2", target: "node3" },
  edge3: { source: "node2", target: "node4" },
  edge4: { source: "node4", target: "node5" },
  edge5: { source: "node4", target: "node6" },
};

const layouts = ref<Layouts>({
  nodes: {
    node1: { x: 0, y: 0 },
    node2: { x: 80, y: 80 },
    node3: { x: 0, y: 160 },
    node4: { x: 240, y: 80 },
    node5: { x: 320, y: 0 },
    node6: { x: 320, y: 160 },
  },
});

const nodes: Nodes = {
  node1: { name: "N1", icon: "&#xe320", color: "gray" },
  node2: { name: "N2", icon: "&#xe328" },
  node3: { name: "N3", icon: "&#xe331" },
  node4: { name: "N4", icon: "&#xe2bd" },
  node5: { name: "N5", icon: "&#xf0e2" },
  node6: { name: "N6", icon: "&#xea75" },
};

const configs = reactive(defineConfigs({
  node: {
    selectable: true,
    normal: {
      color: "#3fdc41",
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
    color: "#eebb00",
    dasharray: "0",
  },
}));

const NODE_RADIUS = 16;
const targetNodeId = ref<string>("");
const tooltipOpacity = ref(0);
const tooltipPos = ref({ left: "0px", top: "0px" });

const targetNodePos = computed(() => {
  return layouts.value.nodes[targetNodeId.value] || { x: 0, y: 0 };
});

watch(
  () => [targetNodePos.value, tooltipOpacity.value],
  () => {
    if (!graph.value || !tooltip.value) return;

    const domPoint = graph.value.translateFromSvgToDomCoordinates(targetNodePos.value);
    tooltipPos.value = {
      left: `${domPoint.x - tooltip.value.offsetWidth / 2}px`,
      top: `${domPoint.y - NODE_RADIUS - tooltip.value.offsetHeight - 10}px`,
    };
  },
  { deep: true }
);

const eventHandlers: vNG.EventHandlers = {
  "node:pointerover": ({ node }) => {
    console.log(node)
    targetNodeId.value = node;
    tooltipOpacity.value = 1;
  },
  "node:pointerout": () => {
    tooltipOpacity.value = 0;
  },
};
</script>

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
.tooltip-wrapper {
  position: relative;
}
.tooltip {
  top: 0;
  left: 0;
  opacity: 0;
  position: absolute;
  width: 80px;
  height: 36px;
  display: grid;
  place-content: center;
  text-align: center;
  font-size: 12px;
  background-color: #000000;
  border: 1px solid #ffb950;
  box-shadow: 2px 2px 2px #aaa;
  transition: opacity 0.2s linear;
  pointer-events: none;
}
</style>
