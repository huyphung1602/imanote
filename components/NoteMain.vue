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

const log = console.log;

onMounted(() => {
  const diagram = document.getElementById('diagram');
  const stage = new Konva.Stage({
    height: diagram.clientHeight,
    width: diagram.clientWidth,
    container: diagram,
  });
  const layer = new Konva.Layer();
  const click = () => {
    log(layer);
    const rect = new Konva.Rect({
      x: stage.getPointerPosition().x,
      y: stage.getPointerPosition().y,
      width: 20,
      height: 20,
      fill: 'lightblue',
      stroke: 'blue',
    })
    layer.add(rect).batchDraw();
  };

  stage.add(layer);
  stage.on('click', click);
})
</script>