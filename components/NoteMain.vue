<template>
  <div class="flex overflow-auto">
    <div
      class="w-full h-[90vh] overflow-auto m-12 border rounded shadow-sm"
    >
      <div
        id="canvas-container"
        class="h-full overflow-hidden"
      />
    </div>
  </div>
</template>

<script setup>
import Konva from 'konva';
import { ref, onMounted, onBeforeUnmount } from 'vue';

const isNowDrawing = ref(false);

let stage;
let layer;
let rect = null;

const mousedownHandler = () => {
  isNowDrawing.value = true;
  rect = new Konva.Rect({
    x: stage.getPointerPosition().x,
    y: stage.getPointerPosition().y,
    width: 0,
    height: 0,
    fill: 'lightblue',
    stroke: 'blue',
  })
  layer.add(rect).batchDraw();
};

const mousemoveHandler = () => {
  if (!isNowDrawing.value) return false;
  const newWidth = stage.getPointerPosition().x - rect.x();
  const newHeight = stage.getPointerPosition().y - rect.y();
  rect.width(newWidth).height(newHeight);
  layer.batchDraw();
};

const mouseupHandler = () => {
  isNowDrawing.value = false;
};

// TODO: Need to update the rects positions and ratios
const updateCanvasWidthHeight = () => {
  const canvasCont = document.getElementById('canvas-container');
  stage.width(canvasCont.clientWidth).height(canvasCont.clientHeight);
}

const initCanvas = () => {
  const canvasCont = document.getElementById('canvas-container');
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
