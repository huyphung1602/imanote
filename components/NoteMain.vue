<template>
  <div class="flex overflow-auto">
    <div
      class="relative basis-1/2 h-[90vh] overflow-auto m-12 border rounded shadow-sm"
    >
      <img
        class="w-full -z-1"
        id="note-image"
        src="https://i.postimg.cc/sgtp3zzV/diagram.png"
      >
      <div
        class="absolute inset-y-0 z-10"
        id="note-event"
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
  const noteImage = document.getElementById('note-image');
  const noteEvent = document.getElementById('note-event');
  stage = new Konva.Stage({
    height: noteImage.clientHeight,
    width: noteImage.clientWidth,
    container: noteEvent,
  });
  layer = new Konva.Layer();

  stage.add(layer);
  stage.on('mousedown', mousedownHandler);
  stage.on('mousemove', mousemoveHandler);
  stage.on('mouseup', mouseupHandler);
})
</script>
