import { CanvasDimensions, GridConfig, ImageBounds } from '../types';

export function calculateGridDimensions(
  canvasWidth: number,
  canvasHeight: number,
  grid: GridConfig,
  imageBounds: ImageBounds | null
): CanvasDimensions {
  // Si hay imagen, usar sus dimensiones; si no, usar el canvas completo
  const width = imageBounds ? imageBounds.width : canvasWidth;
  const height = imageBounds ? imageBounds.height : canvasHeight;
  
  const cellWidth = width / grid.columns;
  const cellHeight = height / grid.rows;
  
  return {
    width,
    height,
    cellWidth,
    cellHeight,
  };
}

export function pixelToGrid(
  x: number,
  y: number,
  imageBounds: ImageBounds | null,
  grid: GridConfig
): { gridX: number; gridY: number } | null {
  if (!imageBounds) {
    return null;
  }

  // Convertir coordenadas del canvas a coordenadas relativas a la imagen
  const relativeX = x - imageBounds.x;
  const relativeY = y - imageBounds.y;

  // Verificar que el punto esté dentro del área de la imagen
  if (relativeX < 0 || relativeX > imageBounds.width || relativeY < 0 || relativeY > imageBounds.height) {
    return null;
  }

  const cellWidth = imageBounds.width / grid.columns;
  const cellHeight = imageBounds.height / grid.rows;
  
  const gridX = Math.floor(relativeX / cellWidth);
  const gridY = Math.floor(relativeY / cellHeight);
  
  return {
    gridX: Math.max(0, Math.min(gridX, grid.columns - 1)),
    gridY: Math.max(0, Math.min(gridY, grid.rows - 1)),
  };
}

export function gridToPixel(
  gridX: number,
  gridY: number,
  imageBounds: ImageBounds | null,
  grid: GridConfig
): { x: number; y: number } | null {
  if (!imageBounds) {
    return null;
  }

  const cellWidth = imageBounds.width / grid.columns;
  const cellHeight = imageBounds.height / grid.rows;
  
  return {
    x: imageBounds.x + gridX * cellWidth + cellWidth / 2,
    y: imageBounds.y + gridY * cellHeight + cellHeight / 2,
  };
}

export function snapToGrid(
  x: number,
  y: number,
  imageBounds: ImageBounds | null,
  grid: GridConfig
): { x: number; y: number; gridX: number; gridY: number } | null {
  const gridPos = pixelToGrid(x, y, imageBounds, grid);
  if (!gridPos) {
    return null;
  }

  const pixelPos = gridToPixel(gridPos.gridX, gridPos.gridY, imageBounds, grid);
  if (!pixelPos) {
    return null;
  }
  
  return {
    x: pixelPos.x,
    y: pixelPos.y,
    gridX: gridPos.gridX,
    gridY: gridPos.gridY,
  };
}

