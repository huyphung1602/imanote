import { concat, forEach, map, sortBy } from 'lodash';
import Konva from 'konva';
import { SNAP_DISTANCE, ALIGN_LINE_COLOR } from './constants';
import type { AxisType, Diagram, PositionType, SnapPosition } from './types';

const renderAlignLine = (points: number[]) => {
  return new Konva.Line({
    points,
    stroke: ALIGN_LINE_COLOR,
    strokeWidth: 1.5,
    lineJoin: 'round',
    dash: [12, 8],
  });
}

function calculateSnapRanges(nearestPoint: number) {
  return {
    minSnap: nearestPoint - SNAP_DISTANCE,
    maxSnap: nearestPoint + SNAP_DISTANCE,
  };
}

const findNearestPosition = (value: number, arr: number[]): number | null => {
  if (arr.length === 0) return null;
  let result = arr[0];
  let min = Math.abs(value - result);
  forEach(arr, (n) => {
    const newMin = Math.abs(value - n);
    if (newMin < min) {
      min = newMin;
      result = n;
    }
  }) 
  return result
}

const calculatePositionByType = (value: number, rect: Konva.Rect, positionType: PositionType, isSnap = false): number => {
  switch (positionType) {
    case 'top':
      return value;
    case 'left':
      return value;
    case 'right':
      return sumIsSnap(value, rect.width(), isSnap);
    case 'bottom':
      return sumIsSnap(value, rect.height(), isSnap);
    case 'middleX':
      return sumIsSnap(value, rect.width() / 2, isSnap);
    case 'middleY':
      return sumIsSnap(value, rect.height() / 2, isSnap);
    default:
      return value;
  }
}

const sumIsSnap = (a: number, b: number, isSnap: boolean) => {
  return isSnap ? a - b : a + b;
}

const snapOnAxis = (
  value: number,
  rect: Konva.Rect,
  diagram: Diagram,
  nearest: number,
  axisType: AxisType,
  positionType: PositionType,
) => {
  const { minSnap, maxSnap } = calculateSnapRanges(nearest);
  const { x, y } = rect.position();
  const points = axisType === 'x'
    ? [nearest, y - 3000, nearest, y + 3000]
    : [x - 3000, nearest, x + 3000, nearest];
  const snapPosition = calculatePositionByType(nearest, rect, positionType, true);

  // Within the snap range, the snapline will be visible and the shape will be snapped into the matched position
  if (value < maxSnap && value > minSnap) {
    const alignLine = renderAlignLine(points);
    diagram.alignLine.add(alignLine);
    rect.position({
      x: axisType === 'x' ? snapPosition : x,
      y: axisType === 'y' ? snapPosition : y,
    });
    return true;
  }
  return false;

}

export const snapShape = (rect: Konva.Rect, diagram: Diagram) => {
  if (!diagram.sortedSnapPositions) return;
  diagram.alignLine.destroyChildren();

  const xPositions = diagram.sortedSnapPositions.x;
  const yPositions = diagram.sortedSnapPositions.y;
  const { x, y } = rect.position();

  const left = calculatePositionByType(x, rect, 'left');
  const top = calculatePositionByType(y, rect, 'top');
  const right = calculatePositionByType(x, rect, 'right');
  const bottom = calculatePositionByType(y, rect, 'bottom');
  const middleX = calculatePositionByType(x, rect, 'middleX');
  const middleY = calculatePositionByType(y, rect, 'middleY');

  const nearestLeft = findNearestPosition(left, xPositions);
  const nearestTop = findNearestPosition(top, yPositions);
  const nearestRight = findNearestPosition(right, xPositions);
  const nearestBottom = findNearestPosition(bottom, yPositions);
  const nearestMiddleX = findNearestPosition(middleX, xPositions);
  const nearestMiddleY = findNearestPosition(middleY, yPositions);
  
  if (nearestLeft) {
    snapOnAxis(left, rect, diagram, nearestLeft, 'x', 'left');
  }
  if (nearestTop) {
    snapOnAxis(top, rect, diagram, nearestTop, 'y', 'top');
  }
  console.log(xPositions);
  console.log(right);
  console.log(nearestRight);
  if (nearestRight) {
    snapOnAxis(right, rect, diagram, nearestRight, 'x', 'right');
  }
  if (nearestBottom) {
    snapOnAxis(bottom, rect, diagram, nearestBottom, 'y', 'bottom');
  }
  if (nearestMiddleX) {
    snapOnAxis(middleX, rect, diagram, nearestMiddleX, 'x', 'middleX');
  }
  if (nearestMiddleY) {
    snapOnAxis(middleY, rect, diagram, nearestMiddleY, 'y', 'middleY');
  }

  diagram.alignLine.moveToTop();
}

export const generateSnapPositions = (diagram: Diagram) => {
  const topLeftPositions = map(diagram.shapes, (shape) => {
    return {
      id: shape._id,
      x: shape.x(),
      y: shape.y(),
    }
  });

  const bottomRightPositions = map(diagram.shapes, (shape) => {
    return {
      id: shape._id,
      x: calculatePositionByType(shape.x(), shape, 'right'),
      y: calculatePositionByType(shape.y(), shape, 'bottom'),
    }
  });

  const middlePositions = map(diagram.shapes, (shape) => {
    return {
      id: shape._id,
      x: calculatePositionByType(shape.x(), shape, 'middleX'),
      y: calculatePositionByType(shape.y(), shape, 'middleY'),
    }
  });

  diagram.snapPositions = concat(topLeftPositions, bottomRightPositions, middlePositions);
}

export const createSnappingSortedPositions = (diagram: Diagram, filteredPositions: SnapPosition[]) => {
  const sortedX = map(sortBy(filteredPositions, (o) => o.x), (o) => o.x);
  const sortedY = map(sortBy(filteredPositions, (o) => o.y), (o) => o.y);

  diagram.sortedSnapPositions = {
    x: sortedX,
    y: sortedY,
  }
}
