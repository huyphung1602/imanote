<template>
  <div class="flex overflow-auto">
    <div class="basis-1/2 h-[90vh] overflow-auto m-12 p-10 border rounded shadow-sm">
      <div id="diagram"></div>
    </div>
    <div class="basis-1/2 h-[90vh] overflow-auto m-12 p-10 border rounded shadow-sm">
    </div>
  </div>
</template>

<script setup>
  import Konva from 'konva';
  // import { ref, onMounted } from 'vue'

  // const diagram = ref(null);

  onMounted(() => {
    const log = console.log;

    const mousedownHandler = () => {
      log('mouse down');
    };
    const mousemoveHandler = () => {
      log('mouse move');
    };
    const mouseupHandler = () => {
      log('mouse up');
    };

    const stage = new Konva.Stage({
      height: 500,
      width: 500,
      container: 'diagram',
    });
    const layer = new Konva.Layer();
    stage.add(layer);
    stage.on('mousedown', mousedownHandler);
    stage.on('mousemove', mousemoveHandler);
    stage.on('mouseup', mouseupHandler);
  });
</script>