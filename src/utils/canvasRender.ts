import { GridConfig, Token, CanvasDimensions, ImageBounds } from '../types';
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
  dimensions: CanvasDimensions,
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

export function drawTokens(
  ctx: CanvasRenderingContext2D,
  tokens: Token[],
  selectedTokenId: string | null,
  dimensions: CanvasDimensions,
  grid: GridConfig
): void {
  tokens.forEach((token) => {
    const radius = (dimensions.cellWidth * token.size) / 2;
    const isSelected = token.id === selectedTokenId;

    // Círculo del token
    ctx.beginPath();
    ctx.arc(token.x, token.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = token.color;
    ctx.fill();

    // Borde del token
    ctx.strokeStyle = isSelected ? '#ffffff' : '#000000';
    ctx.lineWidth = isSelected ? 3 : 2;
    ctx.stroke();

    // Indicador de selección adicional
    if (isSelected) {
      ctx.beginPath();
      ctx.arc(token.x, token.y, radius + 5, 0, Math.PI * 2);
      ctx.strokeStyle = '#ffff00';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  });
}

