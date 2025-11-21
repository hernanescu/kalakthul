import { ImageBounds } from '../types';

/**
 * Convierte coordenadas absolutas del canvas a coordenadas absolutas de la imagen original
 * Devuelve coordenadas en píxeles de la imagen original (antes de escalar)
 */
export function canvasToOriginalImage(
  canvasX: number,
  canvasY: number,
  imageBounds: ImageBounds | null
): { originalImageX: number; originalImageY: number } | null {
  if (!imageBounds) {
    return null;
  }

  // Calcular posición relativa al mapa renderizado
  const relativeX = (canvasX - imageBounds.x) / imageBounds.width;
  const relativeY = (canvasY - imageBounds.y) / imageBounds.height;

  // Verificar que esté dentro del área del mapa
  if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
    return null;
  }

  // Convertir a coordenadas absolutas de la imagen original
  const originalImageX = relativeX * imageBounds.originalWidth;
  const originalImageY = relativeY * imageBounds.originalHeight;

  return { originalImageX, originalImageY };
}

/**
 * Convierte coordenadas absolutas de imagen original a coordenadas absolutas del canvas
 * Las coordenadas originales están en píxeles de la imagen antes de escalar
 */
export function originalImageToCanvas(
  originalImageX: number,
  originalImageY: number,
  imageBounds: ImageBounds | null
): { canvasX: number; canvasY: number } | null {
  if (!imageBounds) {
    console.log(`[originalImageToCanvas] No imageBounds provided`);
    return null;
  }

  console.log(`[originalImageToCanvas] Converting:`, {
    originalImageX,
    originalImageY,
    imageBounds
  });

  // Convertir a coordenadas relativas al mapa renderizado
  const relativeX = originalImageX / imageBounds.originalWidth;
  const relativeY = originalImageY / imageBounds.originalHeight;

  console.log(`[originalImageToCanvas] Relative coords:`, { relativeX, relativeY });

  // Verificar que esté dentro del área del mapa
  if (relativeX < 0 || relativeX > 1 || relativeY < 0 || relativeY > 1) {
    console.log(`[originalImageToCanvas] Coordinates outside bounds:`, { relativeX, relativeY });
    return null;
  }

  // Convertir a coordenadas absolutas del canvas
  const canvasX = imageBounds.x + relativeX * imageBounds.width;
  const canvasY = imageBounds.y + relativeY * imageBounds.height;

  console.log(`[originalImageToCanvas] Canvas coords:`, { canvasX, canvasY });

  return { canvasX, canvasY };
}

/**
 * Convierte coordenadas de pantalla a coordenadas absolutas de imagen original
 * NOTA: Como los efectos se posicionan en coordenadas canvas absolutas (sin zoom adicional),
 * las coordenadas de pantalla SON las coordenadas canvas
 */
export function screenToOriginalImage(
  screenX: number,
  screenY: number,
  zoom: { level: number; panX: number; panY: number },
  imageBounds: ImageBounds | null
): { originalImageX: number; originalImageY: number } | null {
  console.log(`[screenToOriginalImage] Converting screen coords to original image:`, {
    screenX,
    screenY,
    zoom,
    imageBounds: imageBounds ? {
      x: imageBounds.x,
      y: imageBounds.y,
      width: imageBounds.width,
      height: imageBounds.height,
      originalWidth: imageBounds.originalWidth,
      originalHeight: imageBounds.originalHeight
    } : null
  });

  // Como los efectos se posicionan en coordenadas canvas absolutas,
  // las coordenadas de pantalla SON las coordenadas canvas
  const canvasX = screenX;
  const canvasY = screenY;

  console.log(`[screenToOriginalImage] Using as canvas coords:`, { canvasX, canvasY });

  // Convertir a coordenadas absolutas de imagen original
  return canvasToOriginalImage(canvasX, canvasY, imageBounds);
}

/**
 * Convierte coordenadas absolutas de imagen original a coordenadas de pantalla
 * NOTA: El canvas ya aplica zoom/pan a todo el contenido, así que los efectos
 * deben posicionarse en coordenadas absolutas del canvas SIN zoom adicional
 */
export function originalImageToScreen(
  originalImageX: number,
  originalImageY: number,
  zoom: { level: number; panX: number; panY: number },
  imageBounds: ImageBounds | null
): { screenX: number; screenY: number } | null {
  console.log(`[originalImageToScreen] Input:`, {
    originalImageX,
    originalImageY,
    zoom,
    imageBounds: imageBounds ? {
      x: imageBounds.x,
      y: imageBounds.y,
      width: imageBounds.width,
      height: imageBounds.height,
      originalWidth: imageBounds.originalWidth,
      originalHeight: imageBounds.originalHeight
    } : null
  });

  // Convertir directamente a coordenadas absolutas del canvas
  // El canvas ya maneja zoom/pan para todo el contenido
  const canvasCoords = originalImageToCanvas(originalImageX, originalImageY, imageBounds);
  console.log(`[originalImageToScreen] Canvas coords (final position):`, canvasCoords);

  if (!canvasCoords) return null;

  // NO aplicar zoom/pan adicional - el canvas ya lo hace para todo
  const screenX = canvasCoords.canvasX;
  const screenY = canvasCoords.canvasY;

  console.log(`[originalImageToScreen] Final screen coords:`, { screenX, screenY });

  return { screenX, screenY };
}
