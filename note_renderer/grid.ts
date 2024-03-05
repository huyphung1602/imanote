import { GRID_DOT_COLOR, GRID_SIZE } from './constants';

export const roundToGrid = (num: number): number => Math.round(num / GRID_SIZE) * GRID_SIZE;
export const nearestInsideRoundPoint = (position: number): number => {
  const tmpRoundPoint = roundToGrid(position);
  return tmpRoundPoint < position ? tmpRoundPoint + GRID_SIZE : tmpRoundPoint;
};

export const createGridImage = async () => {
  const canvas = document.createElement('canvas');
  // We cannot set radius to 0.4 because it won't render on Chromium based browsers.
  // We set radius = 1 and scale it at the final step
  const radius = 1;
  const size = radius * 20;

  canvas.width = size;
  canvas.height = size;

  const dotColor = GRID_DOT_COLOR;

  const ctx = canvas.getContext('2d')!;

  // Draw grid
  ctx.fillStyle = dotColor;
  // Draw 1/4 circle at top-left corner
  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(0, 0);
  ctx.arc(0, 0, radius, 0, 0.5 * Math.PI);
  ctx.lineTo(0, 0);
  ctx.fill();

  // Draw 1/4 circle at top-right corner
  ctx.beginPath();
  ctx.moveTo(size - radius, 0);
  ctx.lineTo(size, 0);
  ctx.arc(size, 0, radius, 0.5 * Math.PI, Math.PI);
  ctx.lineTo(size, 0);
  ctx.fill();

  // Draw 1/4 circle at bottom-right corner
  ctx.beginPath();
  ctx.moveTo(size - radius, size);
  ctx.lineTo(size, size);
  ctx.arc(size, size, radius, Math.PI, 1.5 * Math.PI);
  ctx.lineTo(size, size);
  ctx.fill();

  // Draw 1/4 circle at bottom-left corner
  ctx.beginPath();
  ctx.moveTo(radius, size);
  ctx.lineTo(0, size);
  ctx.arc(0, size, radius, 1.5 * Math.PI, 2 * Math.PI);
  ctx.lineTo(0, size);
  ctx.fill();

  const img = new Image();
  img.src = canvas.toDataURL();
  await img.decode();

  // Clean up all previous canvas objects
  ctx.clearRect(0, 0, size, size);

  // Scale the canvas to fit the grid size
  canvas.width = GRID_SIZE;
  canvas.height = GRID_SIZE;
  ctx.drawImage(img, 0, 0, GRID_SIZE, GRID_SIZE);

  img.src = canvas.toDataURL();
  await img.decode();

  return img;
};
