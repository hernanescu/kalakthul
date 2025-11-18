import { useRef, useEffect, useState } from 'react';
import { GridConfig, Token, ImageBounds, ZoomState, Effect } from '../types';
import { calculateGridDimensions, drawGrid, drawTokens } from '../utils/canvasRender';

// Función para persistir logs
const persistLog = (message: string, data?: any) => {
  const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
  logs.push({ timestamp: Date.now(), message, data });
  // Mantener solo los últimos 50 logs
  if (logs.length > 50) logs.shift();
  localStorage.setItem('debug_logs', JSON.stringify(logs));
  console.log(message, data);
};

// Función para mostrar logs guardados
const showPersistedLogs = () => {
  const logs = JSON.parse(localStorage.getItem('debug_logs') || '[]');
  console.log('=== LOGS PERSISTIDOS ===');
  logs.forEach((log: any, index: number) => {
    const date = new Date(log.timestamp).toLocaleTimeString();
    console.log(`${index + 1}. [${date}] ${log.message}`, log.data);
  });
  console.log('=== FIN LOGS ===');
};

// Exponer función global para debugging
(window as any).showDebugLogs = showPersistedLogs;
(window as any).clearDebugLogs = () => {
  localStorage.removeItem('debug_logs');
  console.log('Logs de debug limpiados');
};

interface MapCanvasProps {
  mapImage: string | null;
  imageBounds: ImageBounds | null;
  grid: GridConfig;
  tokens: Token[];
  selectedTokenId: string | null;
  effects: Effect[];
  selectedEffectId: string | null;
  pendingEffectType: string | null; // Tipo de efecto que se va a agregar
  zoom: ZoomState;
  onTokenClick?: (tokenId: string | null) => void;
  onTokenDrag?: (tokenId: string, x: number, y: number) => void;
  onEffectClick?: (effectId: string | null) => void;
  onEffectDrag?: (effectId: string, x: number, y: number) => void;
  onAddEffectAtPosition?: (type: string, startX: number, startY: number, endX: number, endY: number) => void;
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
  effects,
  selectedEffectId,
  pendingEffectType,
  zoom,
  onTokenClick,
  onTokenDrag,
  onEffectClick,
  onEffectDrag,
  onAddEffectAtPosition,
  onImageBoundsChange,
  onZoomChange,
  canvasDimensions,
}: MapCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageCacheRef = useRef<{ src: string | null; bounds: ImageBounds | null }>({ src: null, bounds: null });
  const [isDragging, setIsDragging] = useState(false);
  const [dragTokenId, setDragTokenId] = useState<string | null>(null);
  const [dragEffectId, setDragEffectId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [hoveredTokenId, setHoveredTokenId] = useState<string | null>(null);
  const [hoveredEffectId, setHoveredEffectId] = useState<string | null>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isCreatingEffect, setIsCreatingEffect] = useState(false);
  const [effectCreationStart, setEffectCreationStart] = useState({ x: 0, y: 0 });
  const [effectCreationCurrent, setEffectCreationCurrent] = useState({ x: 0, y: 0 });

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

      // Dibujar preview de efecto si se está creando (fuera del contexto transformado)
      if (isCreatingEffect && pendingEffectType && effectCreationStart.x !== 0 && effectCreationStart.y !== 0) {
        const startScreenX = effectCreationStart.x * safeZoom.level + safeZoom.panX;
        const startScreenY = effectCreationStart.y * safeZoom.level + safeZoom.panY;
        const currentScreenX = (effectCreationCurrent.x || effectCreationStart.x) * safeZoom.level + safeZoom.panX;
        const currentScreenY = (effectCreationCurrent.y || effectCreationStart.y) * safeZoom.level + safeZoom.panY;
        
        ctx.save();
        ctx.strokeStyle = '#ffff00';
        ctx.fillStyle = 'rgba(255, 255, 0, 0.1)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        const width = Math.abs(currentScreenX - startScreenX);
        const height = Math.abs(currentScreenY - startScreenY);
        const centerX = (startScreenX + currentScreenX) / 2;
        const centerY = (startScreenY + currentScreenY) / 2;
        ctx.fillRect(centerX - width / 2, centerY - height / 2, width, height);
        ctx.strokeRect(centerX - width / 2, centerY - height / 2, width, height);
        ctx.setLineDash([]);
        ctx.restore();
      }

      console.log('[MapCanvas] Render complete');
    };

    render();
  }, [mapImage, imageLoaded, imageBounds, grid, tokens, selectedTokenId, canvasDimensions, zoom, onImageBoundsChange, isCreatingEffect, effectCreationStart, effectCreationCurrent, pendingEffectType]);

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

  const findEffectAtPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Convertir coordenadas del clic (que están en sistema renderizado con zoom/pan)
    // de vuelta al sistema de coordenadas absolutas del canvas
    const canvasCoords = {
      x: (x - zoom.panX) / zoom.level,
      y: (y - zoom.panY) / zoom.level,
    };
    persistLog('Coordenadas de clic:', {screenX: x, screenY: y, canvasCoords, effectsCount: effects.length, effects: effects.map(e => ({id: e.id, x: e.x, y: e.y, width: e.width, height: e.height}))});
    const found = effects.find((effect) => {
      let isInside = false;
      if (effect.shape === 'circle') {
        // Para círculos, verificar distancia desde el centro
        const distance = Math.sqrt(
          Math.pow(canvasCoords.x - effect.x, 2) + Math.pow(canvasCoords.y - effect.y, 2)
        );
        const radiusX = effect.width / 2;
        const radiusY = effect.height / 2;
        // Usar el radio mayor para simplificar
        isInside = distance <= Math.max(radiusX, radiusY);
      } else {
        // Para cuadrados, verificar si está dentro del rectángulo
        isInside = (
          canvasCoords.x >= effect.x - effect.width / 2 &&
          canvasCoords.x <= effect.x + effect.width / 2 &&
          canvasCoords.y >= effect.y - effect.height / 2 &&
          canvasCoords.y <= effect.y + effect.height / 2
        );
      }
      return isInside;
    });
    return found;
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Pan con botón derecho o shift + click
    if (e.button === 2 || (e.button === 0 && e.shiftKey)) {
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: x - zoom.panX, y: y - zoom.panY });
      return;
    }

    const canvasCoords = screenToCanvas(x, y);

    // Buscar efecto primero (están encima de los tokens)
    const clickedEffect = findEffectAtPosition(x, y);
    persistLog('Buscando efecto en canvas, encontrado:', clickedEffect ? clickedEffect.id : 'ninguno');
    
    // Si hay un efecto pendiente para agregar
    if (pendingEffectType && onAddEffectAtPosition) {
      if (clickedEffect) {
        // Si se hace clic en un efecto existente, cancelar creación y seleccionarlo
        if (onEffectClick) {
          onEffectClick(clickedEffect.id);
        }
        setPendingEffectType(null);
        // Continuar con la lógica normal de arrastre
        setIsDragging(true);
        setDragEffectId(clickedEffect.id);
        setDragOffset({
          x: canvasCoords.x - clickedEffect.x,
          y: canvasCoords.y - clickedEffect.y,
        });
        return;
      } else {
        // Si no hay efecto, iniciar creación
        setIsCreatingEffect(true);
        setEffectCreationStart(canvasCoords);
        setEffectCreationCurrent(canvasCoords);
        return;
      }
    }
    
    // Si se hace clic en un efecto (sin modo pendiente)
    if (clickedEffect) {
      persistLog('¡Efecto clicado!', clickedEffect.id);
      setIsDragging(true);
      setDragEffectId(clickedEffect.id);
      setDragOffset({
        x: canvasCoords.x - clickedEffect.x,
        y: canvasCoords.y - clickedEffect.y,
      });
      if (onEffectClick) {
        onEffectClick(clickedEffect.id);
      }
      return;
    }

    // Buscar token
    const clickedToken = findTokenAtPosition(x, y);
    if (clickedToken) {
      setIsDragging(true);
      setDragTokenId(clickedToken.id);
      setDragOffset({
        x: canvasCoords.x - clickedToken.x,
        y: canvasCoords.y - clickedToken.y,
      });
      if (onTokenClick) {
        onTokenClick(clickedToken.id);
      }
    }
    // Nota: No deseleccionar automáticamente al hacer clic en el canvas vacío
    // para permitir mantener la selección mientras se trabaja
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
    } else if (isCreatingEffect && pendingEffectType) {
      const canvasCoords = screenToCanvas(x, y);
      setEffectCreationCurrent(canvasCoords);
      // Forzar re-render para mostrar preview
    } else if (isDragging && dragEffectId) {
      const canvasCoords = screenToCanvas(x, y);
      if (onEffectDrag) {
        onEffectDrag(dragEffectId, canvasCoords.x - dragOffset.x, canvasCoords.y - dragOffset.y);
      }
    } else if (isDragging && dragTokenId) {
      const canvasCoords = screenToCanvas(x, y);
      if (onTokenDrag) {
        onTokenDrag(dragTokenId, canvasCoords.x - dragOffset.x, canvasCoords.y - dragOffset.y);
      }
    } else {
      // Actualizar cursor al pasar sobre efectos y tokens
      const hoveredEffect = findEffectAtPosition(x, y);
      const hoveredToken = findTokenAtPosition(x, y);
      setHoveredEffectId(hoveredEffect?.id || null);
      setHoveredTokenId(hoveredToken?.id || null);
    }
  };

  const handleMouseUp = (e?: React.MouseEvent<HTMLCanvasElement>) => {
    if (isCreatingEffect && pendingEffectType && onAddEffectAtPosition) {
      // Usar las coordenadas actuales guardadas
      onAddEffectAtPosition(
        pendingEffectType,
        effectCreationStart.x,
        effectCreationStart.y,
        effectCreationCurrent.x,
        effectCreationCurrent.y
      );
      setIsCreatingEffect(false);
      setEffectCreationStart({ x: 0, y: 0 });
      setEffectCreationCurrent({ x: 0, y: 0 });
    }
    
    setIsDragging(false);
    setIsPanning(false);
    setDragTokenId(null);
    setDragEffectId(null);
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
            cursor: isPanning ? 'grabbing' : (isDragging ? 'grabbing' : (hoveredTokenId || hoveredEffectId || pendingEffectType ? 'crosshair' : 'default')),
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
    />
  );
}

