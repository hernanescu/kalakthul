import { useRef, useEffect, useState } from 'react';
import { GridConfig, Token, ImageBounds, ZoomState } from '../types';
import { calculateGridDimensions, drawGrid, drawTokens } from '../utils/canvasRender';

interface MapCanvasProps {
  mapImage: string | null;
  imageBounds: ImageBounds | null;
  grid: GridConfig;
  tokens: Token[];
  selectedTokenId: string | null;
  zoom: ZoomState;
  onTokenClick?: (tokenId: string) => void;
  onTokenDrag?: (tokenId: string, x: number, y: number) => void;
  onImageBoundsChange?: (bounds: ImageBounds | null) => void;
  onZoomChange?: (zoom: ZoomState) => void;
  canvasDimensions: { width: number; height: number };
}

export default function MapCanvas({
  mapImage,
  imageBounds,
  grid,
  tokens,
  selectedTokenId,
  zoom,
  onTokenClick,
  onTokenDrag,
  onImageBoundsChange,
  onZoomChange,
  canvasDimensions,
}: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<{ src: string | null; bounds: ImageBounds | null }>({ src: null, bounds: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragTokenId, setDragTokenId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

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
    if (!canvas) {
      console.warn('[MapCanvas] Canvas ref is null');
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      console.warn('[MapCanvas] Could not get 2d context');
      return;
    }

    console.log('[MapCanvas] Rendering with:', {
      hasMapImage: !!mapImage,
      hasImageBounds: !!imageBounds,
      zoom: zoom,
      canvasSize: { width: canvas.width, height: canvas.height },
      tokensCount: tokens.length
    });

    const render = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Validar y aplicar transformaciones de zoom y pan
      const safeZoom = {
        level: zoom?.level && zoom.level > 0 ? zoom.level : 1,
        panX: zoom?.panX || 0,
        panY: zoom?.panY || 0,
      };

      console.log('[MapCanvas] Applying zoom/pan:', safeZoom);

      ctx.save();
      ctx.translate(safeZoom.panX, safeZoom.panY);
      ctx.scale(safeZoom.level, safeZoom.level);

      let currentImageBounds: ImageBounds | null = null;

      // Dibujar imagen de mapa
      if (mapImage && imageRef.current && imageRef.current.complete) {
        const img = imageRef.current;
        console.log('[MapCanvas] Drawing image:', { 
          imgWidth: img.width, 
          imgHeight: img.height,
          canvasWidth: canvas.width,
          canvasHeight: canvas.height,
          zoom: zoom.level
        });
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
        console.log('[MapCanvas] No map image, drawing gray background');
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
      console.log('[MapCanvas] Using bounds:', boundsToUse);

      // Dibujar grilla
      if (grid.visible && boundsToUse) {
        const dimensions = calculateGridDimensions(canvas.width, canvas.height, grid, boundsToUse);
        console.log('[MapCanvas] Drawing grid with dimensions:', dimensions);
        drawGrid(ctx, grid, dimensions, boundsToUse);
      }

      // Dibujar tokens
      if (boundsToUse) {
        const dimensions = calculateGridDimensions(canvas.width, canvas.height, grid, boundsToUse);
        console.log('[MapCanvas] Drawing tokens:', tokens.length);
        drawTokens(ctx, tokens, selectedTokenId, dimensions, grid);
      } else {
        console.warn('[MapCanvas] No bounds available, skipping grid and tokens');
      }

      ctx.restore();
      console.log('[MapCanvas] Render complete');
    };

    render();
  }, [mapImage, imageLoaded, imageBounds, grid, tokens, selectedTokenId, canvasDimensions, zoom, onImageBoundsChange]);

  // Convertir coordenadas del mouse a coordenadas del canvas con zoom
  const screenToCanvas = (screenX: number, screenY: number) => {
    return {
      x: (screenX - zoom.panX) / zoom.level,
      y: (screenY - zoom.panY) / zoom.level,
    };
  };

  const findTokenAtPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const canvasCoords = screenToCanvas(x, y);
    const dimensions = calculateGridDimensions(canvas.width, canvas.height, grid, imageBounds);
    return tokens.find((token) => {
      const tokenRadius = (dimensions.cellWidth * token.size) / 2;
      const distance = Math.sqrt(
        Math.pow(canvasCoords.x - token.x, 2) + Math.pow(canvasCoords.y - token.y, 2)
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

    // Pan con botón derecho o espacio + click
    if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: x - zoom.panX, y: y - zoom.panY });
      return;
    }

    const clickedToken = findTokenAtPosition(x, y);

    if (clickedToken) {
      setIsDragging(true);
      setDragTokenId(clickedToken.id);
      const canvasCoords = screenToCanvas(x, y);
      setDragOffset({
        x: canvasCoords.x - clickedToken.x,
        y: canvasCoords.y - clickedToken.y,
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

    if (isPanning && onZoomChange) {
      const newZoom = {
        ...zoom,
        panX: x - panStart.x,
        panY: y - panStart.y,
      };
      onZoomChange(newZoom);
    } else if (isDragging && dragTokenId) {
      const canvasCoords = screenToCanvas(x, y);
      if (onTokenDrag) {
        onTokenDrag(dragTokenId, canvasCoords.x - dragOffset.x, canvasCoords.y - dragOffset.y);
      }
    } else {
      // Actualizar cursor al pasar sobre tokens
      const hoveredToken = findTokenAtPosition(x, y);
      setHoveredTokenId(hoveredToken?.id || null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsPanning(false);
    setDragTokenId(null);
    setDragOffset({ x: 0, y: 0 });
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!onZoomChange) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Punto del mouse en coordenadas del canvas antes del zoom
    const pointX = (mouseX - zoom.panX) / zoom.level;
    const pointY = (mouseY - zoom.panY) / zoom.level;

    // Calcular nuevo nivel de zoom
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoomLevel = Math.max(0.25, Math.min(4, zoom.level * zoomFactor));

    // Ajustar pan para mantener el punto del mouse en la misma posición
    const newPanX = mouseX - pointX * newZoomLevel;
    const newPanY = mouseY - pointY * newZoomLevel;

    onZoomChange({
      level: newZoomLevel,
      panX: newPanX,
      panY: newPanY,
    });
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
      onWheel={handleWheel}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        cursor: isPanning ? 'grabbing' : (isDragging ? 'grabbing' : (hoveredTokenId ? 'grab' : 'default')),
        display: 'block',
        maxWidth: '100%',
        maxHeight: '100%',
      }}
    />
  );
}

