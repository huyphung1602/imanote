import Konva from 'konva';
import { type RectAttr, type Diagram } from './types';
import { roundToGrid } from './grid';
import { snapShape, createSnappingSortedPositions, generateSnapPositions } from './snapToObject';
import { filter } from 'lodash';

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
  rect.on('dragstart', () => dragRectStart(diagram, rect));
  rect.on('dragmove', () => dragRectMove(diagram, rect));
  rect.on('dragend', () => dragRectEnd(diagram, rect));
  return rect;
}

const dragRectStart = (diagram: Diagram, rect: Konva.Rect) => {
  rect.moveToTop();
  const filteredPositions = filter(diagram.snapPositions, (p) => p.id !== rect._id);
  createSnappingSortedPositions(diagram, filteredPositions);
  console.log('dragstart');
};

const dragRectMove = (diagram: Diagram, rect: Konva.Rect) => {
  if (diagram.gridEnabling) {
    rect.setAttrs({
      x: roundToGrid(rect.x(), diagram.gridEnabling),
      y: roundToGrid(rect.y(), diagram.gridEnabling),
    })
  } else {
    snapShape(rect, diagram);
  }
};

const dragRectEnd = (diagram: Diagram, rect: Konva.Rect) => {
  diagram.alignLine.destroyChildren();
  generateSnapPositions(diagram);
  // diagram.sortedSnapPositions = undefined;
  console.log('dragend');
};
