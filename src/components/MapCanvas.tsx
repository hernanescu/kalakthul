import { useRef, useEffect, useState } from 'react';
import { GridConfig, ImageBounds, ZoomState, Effect } from '../types';
import { calculateGridDimensions, drawGrid } from '../utils/canvasRender';


interface MapCanvasProps {
  mapImage: string | null;
  imageBounds: ImageBounds | null;
  grid: GridConfig;
  effects: Effect[];
  selectedEffectId: string | null;
  pendingEffectType: string | null; // Tipo de efecto que se va a agregar
  zoom: ZoomState;
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
  effects,
  selectedEffectId,
  pendingEffectType,
  zoom,
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
  const [dragEffectId, setDragEffectId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
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


    const render = () => {
      // Limpiar canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Validar y aplicar transformaciones de zoom y pan
      const safeZoom = {
        level: zoom?.level && zoom.level > 0 ? zoom.level : 1,
        panX: zoom?.panX || 0,
        panY: zoom?.panY || 0,
      };


      ctx.save();
      ctx.translate(safeZoom.panX, safeZoom.panY);
      ctx.scale(safeZoom.level, safeZoom.level);

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

          // No hay tokens que dibujar

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

    };

    render();
  }, [mapImage, imageLoaded, imageBounds, grid, canvasDimensions, zoom, onImageBoundsChange, isCreatingEffect, effectCreationStart, effectCreationCurrent, pendingEffectType]);

  // Convertir coordenadas del mouse a coordenadas del canvas con zoom
  const screenToCanvas = (screenX: number, screenY: number) => {
    return {
      x: (screenX - zoom.panX) / zoom.level,
      y: (screenY - zoom.panY) / zoom.level,
    };
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

        // Buscar efecto primero
        const clickedEffect = findEffectAtPosition(x, y);

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
        } else {
          // Actualizar cursor al pasar sobre efectos
          const hoveredEffect = findEffectAtPosition(x, y);
          setHoveredEffectId(hoveredEffect?.id || null);
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
            cursor: isPanning ? 'grabbing' : (isDragging ? 'grabbing' : (hoveredEffectId || pendingEffectType ? 'crosshair' : 'default')),
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
    />
  );
}

