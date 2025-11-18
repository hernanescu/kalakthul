import { GridConfig, CanvasDimensions, ImageBounds } from '../types';
import { calculateGridDimensions } from './gridUtils';

export { calculateGridDimensions };

export function drawGrid(
  ctx: CanvasRenderingContext2D,
  grid: GridConfig,
  dimensions: CanvasDimensions,
  imageBounds: ImageBounds | null
): void {
  if (!imageBounds) {
    // Si no hay imagen, dibujar sobre todo el canvas
    drawGridOnArea(ctx, grid, dimensions, 0, 0, dimensions.width, dimensions.height);
    return;
  }

  // Dibujar grilla solo sobre el área de la imagen
  drawGridOnArea(
    ctx,
    grid,
    dimensions,
    imageBounds.x,
    imageBounds.y,
    imageBounds.width,
    imageBounds.height
  );
}

function drawGridOnArea(
  ctx: CanvasRenderingContext2D,
  grid: GridConfig,
  _dimensions: CanvasDimensions,
  areaX: number,
  areaY: number,
  areaWidth: number,
  areaHeight: number
): void {
  ctx.save();
  ctx.strokeStyle = grid.color;
  ctx.globalAlpha = grid.opacity;
  ctx.lineWidth = 1;

  // Calcular dimensiones de celda basadas en el área de la imagen
  const cellWidth = areaWidth / grid.columns;
  const cellHeight = areaHeight / grid.rows;

  // Líneas verticales
  for (let i = 0; i <= grid.columns; i++) {
    const x = areaX + i * cellWidth;
    ctx.beginPath();
    ctx.moveTo(x, areaY);
    ctx.lineTo(x, areaY + areaHeight);
    ctx.stroke();
  }

  // Líneas horizontales
  for (let i = 0; i <= grid.rows; i++) {
    const y = areaY + i * cellHeight;
    ctx.beginPath();
    ctx.moveTo(areaX, y);
    ctx.lineTo(areaX + areaWidth, y);
    ctx.stroke();
  }

  ctx.restore();
}

