import { forEach, map, reduce, sortBy } from 'lodash';
import Konva from 'konva';
import { SNAP_DISTANCE, ALIGN_LINE_COLOR } from './constants';
import type { AxisType, Diagram, Position, PositionType, SnapPosition } from './types';
import { roundToGrid } from './grid';

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

const findNearestRange = (value: number, arr: number[]): number[] => {
  if (arr.length <= 1) return arr;
  return reduce(arr, (range: number[], n: number): number[] => {
    if (n >= value && range.length <= 1) {
      return [...range, n];
    }
    return range;
  }, [arr[0]]);
}

function findNearestPosition(value: number, range: number[]) {
  if (range.length === 0) return null;
  let min = Math.abs(value - range[0]!);
  let nearest = range[0];
  forEach(range, (num) => {
    const delta = Math.abs(value - num);
    if (delta < min) {
      nearest = num;
      min = delta;
    }
  });

  return nearest;
}

const calculatePositionByType = (value: number, rect: Konva.Rect, positionType: PositionType): number => {
  switch (positionType) {
    case 'top':
      return value;
    case 'left':
      return value;
    case 'right':
      return value - rect.width();
    case 'bottom':
      return value - rect.height();
    case 'middleX':
      return value - rect.width() / 2;
    case 'middleY':
      return value - rect.height() / 2;
    default:
      return value;
  }
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
  const currentPosition = calculatePositionByType(value, rect, positionType);
  const snapPosition = calculatePositionByType(nearest, rect, positionType);

  // Within the snap range, the snapline will be visible and the shape will be snapped into the matched position
  if (currentPosition < maxSnap && currentPosition > minSnap) {
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

  const { x, y } = rect.position();
  const xPositions = diagram.sortedSnapPositions.x;
  const yPositions = diagram.sortedSnapPositions.y;
  const nearestRangeTop = findNearestRange(x, xPositions);
  const nearestRangeLeft = findNearestRange(y, yPositions);
  const nearestTop = findNearestPosition(x, nearestRangeTop);
  const nearestLeft = findNearestPosition(y, nearestRangeLeft);
  
  if (nearestTop) {
    snapOnAxis(x, rect, diagram, nearestTop, 'x', 'top');
  }
  if (nearestLeft) {
    snapOnAxis(y, rect, diagram, nearestLeft, 'y', 'left');
  }

  diagram.alignLine.moveToTop();
}

export const generateSnapPositions = (diagram: Diagram) => {
  diagram.snapPositions = map(diagram.shapes, (shape) => {
    return {
      id: shape._id,
      x: shape.x(),
      y: shape.y(),
    }
  })
}

export const createSnappingSortedPositions = (diagram: Diagram, filteredPositions: SnapPosition[]) => {
  const sortedX = map(sortBy(filteredPositions, (o) => o.x), (o) => o.x);
  const sortedY = map(sortBy(filteredPositions, (o) => o.y), (o) => o.y);

  diagram.sortedSnapPositions = {
    x: sortedX,
    y: sortedY,
  }
}
