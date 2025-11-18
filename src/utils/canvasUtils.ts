export function loadImageAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to load image'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

import { ImageBounds } from '../types';

export function drawImageOnCanvas(
  ctx: CanvasRenderingContext2D,
  imageSrc: string,
  canvasWidth: number,
  canvasHeight: number
): Promise<ImageBounds> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      // Escalar imagen manteniendo aspect ratio
      const imgAspect = img.width / img.height;
      const canvasAspect = canvasWidth / canvasHeight;
      
      let drawWidth = canvasWidth;
      let drawHeight = canvasHeight;
      let drawX = 0;
      let drawY = 0;
      
      if (imgAspect > canvasAspect) {
        // Imagen más ancha
        drawHeight = canvasWidth / imgAspect;
        drawY = (canvasHeight - drawHeight) / 2;
      } else {
        // Imagen más alta
        drawWidth = canvasHeight * imgAspect;
        drawX = (canvasWidth - drawWidth) / 2;
      }
      
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);
      ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
      
      const bounds: ImageBounds = {
        x: drawX,
        y: drawY,
        width: drawWidth,
        height: drawHeight,
        originalWidth: img.width,
        originalHeight: img.height,
      };
      
      resolve(bounds);
    };
    img.onerror = reject;
    img.src = imageSrc;
  });
}

