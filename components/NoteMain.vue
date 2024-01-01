<template>
  <div class="flex overflow-auto">
    <div class="basis-1/2 h-[90vh] overflow-auto m-12 border rounded shadow-sm">
      <div
        id="diagram"
        class="h-full overflow-hidden"
      />
    </div>
    <div class="basis-1/2 h-[90vh] overflow-auto m-12 p-10 border rounded shadow-sm">
    </div>
  </div>
</template>

<script setup>
import Konva from 'konva';
import { ref, onMounted } from 'vue';

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

onMounted(() => {
  const diagram = document.getElementById('diagram');
  stage = new Konva.Stage({
    height: diagram.clientHeight,
    width: diagram.clientWidth,
    container: diagram,
  });
  layer = new Konva.Layer();

  stage.add(layer);
  stage.on('mousedown', mousedownHandler);
  stage.on('mousemove', mousemoveHandler);
  stage.on('mouseup', mouseupHandler);
})
</script>
