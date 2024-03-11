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
import { forEach, map } from 'lodash';
import Konva from 'konva';
import { normalCase } from '@/examples/normal_case';
import { stressTest } from '@/examples/stress_test';
import { thousand } from '@/examples/thousand';
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { type Diagram, type RectAttr, type SnapPosition } from '@/note_renderer/types';
import { createGridImage, roundToGrid } from '@/note_renderer/grid';
import { drawRect } from '@/note_renderer/Rect';
import { generateSnapPositions } from '@/note_renderer/snapToObject';
import type { KonvaEventObject } from 'konva/lib/Node';

// Define const
const diagram = reactive({
  gridEnabling: false,
  shapes: [] as Konva.Rect[],
  alignLine: new Konva.Group({
    x: 0,
    y: 0,
  }),
  snapPositions: [] as SnapPosition[],
} as Diagram);
const isAddingRect = ref(false);
const isNowDrawing = ref(false);
const nothing = [] as RectAttr[];
const examples = {
  nothing,
  normalCase,
  stressTest,
  thousand,
}
const initialRectAttrs: RectAttr[] = examples.thousand;

// Some shit
let stage: Konva.Stage;
let layer: Konva.Layer;
let drawingRect: Konva.Rect;
const grid = new Konva.Group({
  x: 0,
  y: 0,
});


const toggleDrawingRect = (forceValue?: boolean) => {
  const toggleValue = forceValue ? forceValue : !isAddingRect.value;
  stage.setAttr('draggable', !toggleValue);
  isAddingRect.value = toggleValue;
};

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
const mousedownHandler = (e: KonvaEventObject<MouseEvent>) => {
  if (e.evt.metaKey) toggleDrawingRect(true);
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
  drawingRect = drawRect(rectAttr, diagram as Diagram);
  layer.add(drawingRect)
  diagram.shapes.push(drawingRect);
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
  printCurrentRectAttrs();
  isNowDrawing.value = false;
  isAddingRect.value = false;
  stage.setAttr('draggable', true);
};

const printCurrentRectAttrs = () => {
  const rectAttrs = map(diagram.shapes, (shape: Konva.Shape) => {
    const { x, y, width, height, fill, stroke } = shape.getAttrs();
    return {
      '_id': shape._id,
      x,
      y,
      width,
      height,
      fill,
      stroke,
    }
  })
  console.log(rectAttrs);
}

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
  stage.on('mousedown', (e) => mousedownHandler(e));
  stage.on('mousemove', mousemoveHandler);
  stage.on('mouseup', mouseupHandler);
}
// End Block: Init and Update canvas and stage

// Start to draw saved rectangles
const initRects = (attrs: RectAttr[]) => {
  forEach(attrs, (attr) => {
    const rect = drawRect(attr, diagram as Diagram);
    layer.add(rect);
    diagram.shapes.push(rect);
  });
  generateSnapPositions(diagram as Diagram);
  layer.batchDraw();
}

onMounted(() => {
  const rawDiagram = toRaw(diagram);
  initCanvas();
  initRects(initialRectAttrs);
  if (rawDiagram.gridEnabling) enableGrid();
  layer.add(rawDiagram.alignLine as Konva.Group);

  window.addEventListener('resize', updateCanvasWidthHeight);
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCanvasWidthHeight);
})
</script>
