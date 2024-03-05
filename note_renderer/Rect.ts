import Konva from 'konva';
import { type RectAttr } from './types';

export const drawRect = (
  rectAttr: RectAttr
) => {
  const rect = new Konva.Rect(
    {
      ...rectAttr,
      draggable: true,
    }
  )
  // write out drag and drop events
  rect.on('dragstart', () => dragRectStart());
  rect.on('dragmove', () => dragRectMove());
  rect.on('dragend', () => dragRectEnd());
  return rect;
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
