import { useRef, useEffect, useState, useMemo } from 'react';
import { GridConfig, Token, ImageBounds } from '../types';
import { drawImageOnCanvas } from '../utils/canvasUtils';
import { calculateGridDimensions, drawGrid, drawTokens } from '../utils/canvasRender';

interface MapCanvasProps {
  mapImage: string | null;
  imageBounds: ImageBounds | null;
  grid: GridConfig;
  tokens: Token[];
  selectedTokenId: string | null;
  onTokenClick?: (tokenId: string) => void;
  onTokenDrag?: (tokenId: string, x: number, y: number) => void;
  onImageBoundsChange?: (bounds: ImageBounds | null) => void;
  canvasDimensions: { width: number; height: number };
}

export default function MapCanvas({
  mapImage,
  imageBounds,
  grid,
  tokens,
  selectedTokenId,
  onTokenClick,
  onTokenDrag,
  onImageBoundsChange,
  canvasDimensions,
}: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<{ src: string | null; bounds: ImageBounds | null }>({ src: null, bounds: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragTokenId, setDragTokenId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);

  // Cachear la imagen cargada
  const imageRef = useRef<HTMLImageElement | null>(null);
  const lastMapImageRef = useRef<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (mapImage && mapImage !== lastMapImageRef.current) {
      setImageLoaded(false);
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
      };
      img.onerror = () => {
        imageRef.current = null;
        setImageLoaded(false);
      };
      img.src = mapImage;
      lastMapImageRef.current = mapImage;
    } else if (!mapImage) {
      imageRef.current = null;
      lastMapImageRef.current = null;
      setImageLoaded(false);
    }
  }, [mapImage]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const render = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let currentImageBounds: ImageBounds | null = null;

      // Dibujar imagen de mapa
      if (mapImage && imageRef.current && imageRef.current.complete) {
        const img = imageRef.current;
        const imgAspect = img.width / img.height;
        const canvasAspect = canvas.width / canvas.height;
        
        let drawWidth = canvas.width;
        let drawHeight = canvas.height;
        let drawX = 0;
        let drawY = 0;
        
        if (imgAspect > canvasAspect) {
          drawHeight = canvas.width / imgAspect;
          drawY = (canvas.height - drawHeight) / 2;
        } else {
          drawWidth = canvas.height * imgAspect;
          drawX = (canvas.width - drawWidth) / 2;
        }
        
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        
        currentImageBounds = {
          x: drawX,
          y: drawY,
          width: drawWidth,
          height: drawHeight,
          originalWidth: img.width,
          originalHeight: img.height,
        };

        // Solo actualizar bounds si realmente cambiaron
        const boundsChanged = 
          imageCacheRef.current.src !== mapImage ||
          !imageCacheRef.current.bounds ||
          Math.abs(imageCacheRef.current.bounds.x - currentImageBounds.x) > 0.1 ||
          Math.abs(imageCacheRef.current.bounds.y - currentImageBounds.y) > 0.1 ||
          Math.abs(imageCacheRef.current.bounds.width - currentImageBounds.width) > 0.1 ||
          Math.abs(imageCacheRef.current.bounds.height - currentImageBounds.height) > 0.1;

        if (boundsChanged) {
          imageCacheRef.current = { src: mapImage, bounds: currentImageBounds };
          if (onImageBoundsChange) {
            onImageBoundsChange(currentImageBounds);
          }
        }
      } else if (!mapImage) {
        // Fondo gris si no hay mapa
        ctx.fillStyle = '#2a2a2a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        if (imageCacheRef.current.src !== null) {
          imageCacheRef.current = { src: null, bounds: null };
          if (onImageBoundsChange) {
            onImageBoundsChange(null);
          }
        }
      }

      // Usar bounds actuales o cacheados
      const boundsToUse = currentImageBounds || imageBounds || imageCacheRef.current.bounds;

      // Dibujar grilla
      if (grid.visible && boundsToUse) {
        const dimensions = calculateGridDimensions(canvas.width, canvas.height, grid, boundsToUse);
        drawGrid(ctx, grid, dimensions, boundsToUse);
      }

      // Dibujar tokens
      if (boundsToUse) {
        const dimensions = calculateGridDimensions(canvas.width, canvas.height, grid, boundsToUse);
        drawTokens(ctx, tokens, selectedTokenId, dimensions, grid);
      }
    };

    render();
  }, [mapImage, imageLoaded, imageBounds, grid, tokens, selectedTokenId, canvasDimensions, onImageBoundsChange]);

  const findTokenAtPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const dimensions = calculateGridDimensions(canvas.width, canvas.height, grid, imageBounds);
    return tokens.find((token) => {
      const tokenRadius = (dimensions.cellWidth * token.size) / 2;
      const distance = Math.sqrt(
        Math.pow(x - token.x, 2) + Math.pow(y - token.y, 2)
      );
      return distance <= tokenRadius;
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedToken = findTokenAtPosition(x, y);

    if (clickedToken) {
      setIsDragging(true);
      setDragTokenId(clickedToken.id);
      setDragOffset({
        x: x - clickedToken.x,
        y: y - clickedToken.y,
      });
      if (onTokenClick) {
        onTokenClick(clickedToken.id);
      }
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDragging && dragTokenId) {
      if (onTokenDrag) {
        onTokenDrag(dragTokenId, x - dragOffset.x, y - dragOffset.y);
      }
    } else {
      // Actualizar cursor al pasar sobre tokens
      const hoveredToken = findTokenAtPosition(x, y);
      setHoveredTokenId(hoveredToken?.id || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragTokenId(null);
    setDragOffset({ x: 0, y: 0 });
  };

  return (
    <canvas
      ref={canvasRef}
      width={canvasDimensions.width}
      height={canvasDimensions.height}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{
        cursor: isDragging ? 'grabbing' : (hoveredTokenId ? 'grab' : 'default'),
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    />
  );
}

