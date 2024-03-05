import Konva from 'konva';

// Define types
export interface RectAttr {
  _id?: number;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
}

export interface Diagram {
  gridEnabling: boolean;
  shapes: Konva.Rect[];
  alignLine: Konva.Group;
  snapPositions: SnapPosition[];
  sortedSnapPositions?: SortedSnapPositions;
}

export interface Position {
  x: number;
  y: number;
}

export interface SnapPosition {
  id: number;
  x: number;
  y: number;
}

export interface SortedSnapPositions {
  x: number[],
  y: number[],
}

export type AxisType = 'x' | 'y';
export type PositionType = 'top' | 'left' | 'middleX' | 'middleY' | 'bottom' | 'right';