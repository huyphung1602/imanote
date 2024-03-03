<template>
  <div class="flex flex-col overflow-auto">
    <div class="mt-12 flex justify-center space-x-6">
      <!-- Group Button -->
      <div class="flex items-center justify-center text-center content-baseline">
        <a
          class="border rounded shadow-sm hover:bg-gray-200 cursor-pointer p-2 m-1"
          :class="{ 'bg-gray-200': shouldAddSquare }"
          @click="toggleAddingSquare()"
        >
          Add Square
        </a>
        <a class="border rounded shadow-sm hover:bg-gray-200 cursor-pointer p-2 m-1">
          Grid
        </a>
      </div>
    </div>
    <div
      class="h-[80vh] overflow-auto m-12 border rounded shadow-sm"
    >
      <div
        id="canvas-container"
        class="h-full overflow-hidden"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Konva from 'konva';
import { Shape } from 'konva/lib/Shape';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isNowDrawing = ref(false);
const shouldAddSquare = ref(false);
const shapes = new Map<number, Shape>();

let stage: Konva.Stage;
let layer: Konva.Layer;
let rect: Konva.Rect;

const toggleAddingSquare = () => {
  shouldAddSquare.value = !shouldAddSquare.value;
};

const mousedownHandler = () => {
  if (!shouldAddSquare.value) return;

  isNowDrawing.value = true;
  rect = new Konva.Rect({
    x: stage.getPointerPosition()?.x,
    y: stage.getPointerPosition()?.y,
    width: 0,
    height: 0,
    fill: 'lightblue',
    stroke: 'blue',
  })
  layer.add(rect).batchDraw();
  shapes.set(rect._id, rect);
  console.log(shapes);
};

const mousemoveHandler = () => {
  if (!isNowDrawing.value) return false;
  const newWidth = stage.getPointerPosition()!.x - rect.x();
  const newHeight = stage.getPointerPosition()!.y - rect.y();
  rect.width(newWidth).height(newHeight);
  layer.batchDraw();
};

const mouseupHandler = () => {
  isNowDrawing.value = false;
};

// TODO: Need to update the rects positions and ratios
const updateCanvasWidthHeight = () => {
  const canvasCont = document.getElementById('canvas-container')!;
  stage.width(canvasCont.clientWidth).height(canvasCont.clientHeight);
}

const initCanvas = () => {
  const canvasCont = document.getElementById('canvas-container')! as HTMLDivElement;
  stage = new Konva.Stage({
    height: canvasCont.clientHeight,
    width: canvasCont.clientWidth,
    container: canvasCont,
  });
  layer = new Konva.Layer();

  stage.add(layer);
  stage.on('mousedown', mousedownHandler);
  stage.on('mousemove', mousemoveHandler);
  stage.on('mouseup', mouseupHandler);
}

onMounted(() => {
  initCanvas();
  window.addEventListener('resize', updateCanvasWidthHeight);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCanvasWidthHeight);
})
</script>
