import Konva from 'konva';
import { type RectAttr, type Diagram } from './types';
import { roundToGrid } from './grid';

export const drawRect = (
  rectAttr: RectAttr,
  diagram: Diagram,
) => {
  const rect = new Konva.Rect(
    {
      ...rectAttr,
      draggable: true,
    }
  )
  // write out drag and drop events
  rect.on('dragstart', () => dragRectStart());
  rect.on('dragmove', () => dragRectMove(diagram, rect));
  rect.on('dragend', () => dragRectEnd());
  return rect;
}

const dragRectStart = () => {
  console.log('dragstart');
};

const dragRectMove = (diagram: Diagram, rect: Konva.Rect) => {
  rect.setAttrs({
    x: roundToGrid(rect.x(), diagram.gridEnabling),
    y: roundToGrid(rect.y(), diagram.gridEnabling),
  })
};

const dragRectEnd = () => {
  console.log('dragend');
};
