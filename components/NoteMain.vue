<template>
  <div class="flex flex-col overflow-auto">
    <div class="mt-4 flex justify-center space-x-6">
      <!-- Group Button -->
      <div class="flex items-center justify-center text-center content-baseline">
        <a
          class="border rounded shadow-sm hover:bg-gray-200 cursor-pointer p-2 m-1"
          :class="{ 'bg-gray-200': isAddingRect }"
          @click="toggleDrawingRect()"
        >
          Draw
        </a>
        <a
          class="border rounded shadow-sm hover:bg-gray-200 cursor-pointer p-2 m-1"
          :class="{ 'bg-gray-200': diagram.gridEnabling }"
          @click="toggleGrid()"
        >
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
import { forEach, round } from 'lodash';
import Konva from 'konva';
import { Shape } from 'konva/lib/Shape';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { type Diagram, type RectAttr } from '@/note_renderer/types';
import { createGridImage, roundToGrid } from '@/note_renderer/grid';
import { drawRect } from '@/note_renderer/Rect';

// Define const
const diagram = {
  gridEnabling: false,
  shapes: new Map<number, Shape>(),
} as Diagram;
const isAddingRect = ref(false);
const isNowDrawing = ref(false);
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
const grid = new Konva.Group({
  x: 0,
  y: 0,
});


const toggleDrawingRect = () => {
  stage.setAttr('draggable', isAddingRect.value);
  isAddingRect.value = !isAddingRect.value;
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

const initRects = (attrs: RectAttr[]) => {
  forEach(attrs, (attr) => {
    const rect = drawRect(attr, diagram);
    layer.add(rect);
    diagram.shapes.set(rect._id, rect);
  });
  layer.batchDraw;
}


const addGrid = async (): Promise<void> => {
  const buffer = 100000;
  const img = await createGridImage();
  const rect = new Konva.Shape({
    id: 'grid-background',
    x: roundToGrid(stage.x() - buffer),
    y: roundToGrid(stage.y() - buffer),
    width: roundToGrid(stage.width() * buffer),
    height: roundToGrid(stage.height() * buffer),
    sceneFunc: (ctx) => {
      const pattern = ctx.createPattern(img, 'repeat');
      if (pattern) {
        ctx.fillStyle = pattern;
        ctx.fillRect(rect.x(), rect.y(), rect.width(), rect.height());
      }
    },
  });
  grid.add(rect);
  layer.add(grid);
  grid.moveToBottom();
}

const removeGrid = () => {
  grid.destroyChildren();
}

const enableGrid = () => {
  // reset grid background group
  removeGrid();
  addGrid();
}

const disableGrid = () => {
  // reset grid background group
  removeGrid();
}

const toggleGrid = () => {
  if (diagram.gridEnabling) {
    disableGrid()
    diagram.gridEnabling = false;
  } else {
    enableGrid();
    diagram.gridEnabling = true;
  }
}

// Start Block: Init and Update canvas and stage
const mousedownHandler = () => {
  if (!isAddingRect.value) return;
  isNowDrawing.value = true;

  const startX = roundToGrid(stage.getRelativePointerPosition()?.x!, diagram.gridEnabling)
  const startY = roundToGrid(stage.getRelativePointerPosition()?.y!, diagram.gridEnabling)
  const rectAttr = {
    x: startX,
    y: startY,
    width: 0,
    height: 0,
    fill: 'lightblue',
    stroke: 'blue',
  }
  drawingRect = drawRect(rectAttr, diagram);
  layer.add(drawingRect)
  diagram.shapes.set(drawingRect._id, drawingRect);
  layer.batchDraw();
};

const mousemoveHandler = () => {
  if (!isAddingRect.value) return;
  if (!isNowDrawing.value) return;

  const newWidth = roundToGrid(stage.getRelativePointerPosition()!.x - drawingRect.x(), diagram.gridEnabling);
  const newHeight = roundToGrid(stage.getRelativePointerPosition()!.y - drawingRect.y(), diagram.gridEnabling);
  drawingRect.width(newWidth).height(newHeight);
  layer.batchDraw();
};

const mouseupHandler = () => {
  if (!isAddingRect.value) return;

  updateCurrentRect(drawingRect, currentRects.value);
  console.log(currentRects.value);
  isNowDrawing.value = false;
};

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
// End Block: Init and Update canvas and stage

onMounted(() => {
  initCanvas();
  initRects(initialRectAttrs);
  window.addEventListener('resize', updateCanvasWidthHeight);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCanvasWidthHeight);
})
</script>
