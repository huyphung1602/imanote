<template>
  <div class="flex flex-col overflow-auto">
    <div class="mt-12 flex justify-center space-x-6">
      <!-- Group Button -->
      <div class="flex items-center justify-center text-center content-baseline">
        <a
          class="border rounded shadow-sm hover:bg-gray-200 cursor-pointer p-2 m-1"
          :class="{ 'bg-gray-200': isAddingRect }"
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
      id="canvas-container"
      class="h-[80vh] overflow-auto m-12 border rounded shadow-sm"
    >
    </div>
  </div>
</template>

<script setup lang="ts">
import { forEach } from 'lodash';
import Konva from 'konva';
import { Shape } from 'konva/lib/Shape';
import { ref, onMounted, onBeforeUnmount } from 'vue';

// Define types
interface RectAttr {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
}

// Define const
const isAddingRect = ref(false);
const isNowDrawing = ref(false);
const shapes = ref(new Map<number, Shape>());
const currentRects = ref([] as RectAttr[]);
const initialRectAttrs: RectAttr[] = [
  {
    'x': 505,
    'y': 187,
    'width': 200,
    'height': 116,
    'fill': 'lightblue',
    'stroke': 'blue'
  },
  {
    'x': 710,
    'y': 423,
    'width': 176,
    'height': 136,
    'fill': 'lightblue',
    'stroke': 'blue'
  },
  {
    'x': 556,
    'y': 653,
    'width': 84,
    'height': 127,
    'fill': 'lightblue',
    'stroke': 'blue'
  },
  {
    'x': 1106,
    'y': 411,
    'width': 216,
    'height': 184,
    'fill': 'lightblue',
    'stroke': 'blue'
  },
  {
    'x': 295,
    'y': 462,
    'width': 185,
    'height': 63,
    'fill': 'lightblue',
    'stroke': 'blue'
  }
] 

// Some shit
let stage: Konva.Stage;
let layer: Konva.Layer;
let drawingRect: Konva.Rect;


const toggleAddingSquare = () => {
  isAddingRect.value = !isAddingRect.value;
};

const mousedownHandler = () => {
  if (!isAddingRect.value) return;

  isNowDrawing.value = true;
  const rectAttr = {
    x: stage.getPointerPosition()?.x!,
    y: stage.getPointerPosition()?.y!,
    width: 0,
    height: 0,
    fill: 'lightblue',
    stroke: 'blue',
  }
  drawRect(rectAttr);
};

const mousemoveHandler = () => {
  if (!isAddingRect.value) return;

  if (!isNowDrawing.value) return false;
  const newWidth = stage.getPointerPosition()!.x - drawingRect.x();
  const newHeight = stage.getPointerPosition()!.y - drawingRect.y();
  drawingRect.width(newWidth).height(newHeight);
  layer.batchDraw();
};

const mouseupHandler = () => {
  if (!isAddingRect.value) return;

  updateCurrentRect(drawingRect, currentRects.value);
  console.log(currentRects.value);
  isNowDrawing.value = false;
};

const updateCurrentRect = (rect: Konva.Rect, rectAttrs: RectAttr[]) => {
  const { x, y , width, height, fill, stroke } = rect.getAttrs()
  rectAttrs.push({
    x,
    y,
    width,
    height,
    fill,
    stroke,
  })
}

const drawRect = (rectAttr: RectAttr) => {
  drawingRect = new Konva.Rect(
    {
      ...rectAttr,
      draggable: true,
    }
  )
  // write out drag and drop events
  drawingRect.on('dragstart', () => dragRectStart());
  drawingRect.on('dragmove', () => dragRectMove());
  drawingRect.on('dragend', () => dragRectEnd());
  layer.add(drawingRect).batchDraw();
  shapes.value.set(drawingRect._id, drawingRect);
}

const dragRectStart = () => {
  console.log('dragstart');
};

const dragRectMove = () => {
  console.log('dragmove');
};

const dragRectEnd = () => {
  console.log('dragend');
};

const drawInitialRects = (attrs: RectAttr[]) => {
  forEach(attrs, (attr) => drawRect(attr));
}

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
    draggable: true,
  });
  layer = new Konva.Layer();

  stage.add(layer);
  stage.on('mousedown', mousedownHandler);
  stage.on('mousemove', mousemoveHandler);
  stage.on('mouseup', mouseupHandler);
}

onMounted(() => {
  initCanvas();
  drawInitialRects(initialRectAttrs);
  window.addEventListener('resize', updateCanvasWidthHeight);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCanvasWidthHeight);
})
</script>
