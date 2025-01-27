<template>
    <div ref="canvasContainer" @mousedown="startDrawing" @mouseup="stopDrawing" @mousemove="drawLine">
      <canvas ref="canvas"></canvas>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, onMounted, ref } from 'vue';
  
  export default defineComponent({
    setup() {
      const canvas = ref<HTMLCanvasElement | null>(null);
      const context = ref<CanvasRenderingContext2D | null>(null);
  
      // Refs to track the drawing state
      let isDrawing = false;
      let startX = 0;
      let startY = 0;
  
      onMounted(() => {
        if (canvas.value) {
          canvas.value.width = 800;  // Set your desired width
          canvas.value.height = 600; // Set your desired height
  
          context.value = canvas.value.getContext('2d');
          
          // Optional: Clear the canvas when mounted
          if (context.value) {
            context.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
          }
        }
      });
  
      function startDrawing(event: MouseEvent) {
        isDrawing = true;
        startX = event.offsetX || 0;
        startY = event.offsetY || 0;
  
        // Optional: Start a new path if you're starting a new line
        if (context.value) {
          context.value.beginPath();
        }
      }
  
      function stopDrawing() {
        isDrawing = false;
        
        // Optional: End the current drawing path
        if (context.value) {
          context.value.closePath();
        }
      }
  
      function drawLine(event: MouseEvent) {
        if (!isDrawing || !canvas.value || !context.value) return;
  
        const x = event.offsetX || 0;
        const y = event.offsetY || 0;
  
        // Draw the line from the starting point to the current position
        if (context.value) {
          context.value.lineWidth = 2; // Set your desired line width
          context.value.strokeStyle = '#FFF'; // Set your desired color
          context.value.moveTo(startX, startY);
          context.value.lineTo(x, y);
          context.value.stroke();
  
          // Update the starting point for continuous drawing
          startX = x;
          startY = y;
        }
      }
  
      return {
        canvas,
        startDrawing,
        stopDrawing,
        drawLine
      };
    }
  });
  </script>
  
  <style scoped>
  canvas {
    border: 1px solid #000; /* Optional: Add a border for visibility */
  }
  </style>