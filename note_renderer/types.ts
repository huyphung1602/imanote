import { Shape, type ShapeConfig } from 'konva/lib/Shape';
// Define types
export interface RectAttr {
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
  stroke: string;
}

export interface Diagram {
  gridEnabling: boolean;
  shapes: Map<number, Shape<ShapeConfig>>;
}