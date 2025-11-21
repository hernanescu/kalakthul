import { useRef, useEffect, useState, useCallback } from 'react';
import { GridConfig, ImageBounds, ZoomState, Effect, FogOfWarState, FogTool, Polygon } from '../types';
import { calculateGridDimensions, drawGrid } from '../utils/canvasRender';

// Función helper para detectar si un punto está dentro de un polígono (ray casting algorithm)
function isPointInPolygon(point: { x: number; y: number }, polygon: Polygon, zoom: ZoomState): boolean {
  if (polygon.points.length < 3) return false;

  // Convertir coordenadas del polígono a coordenadas de pantalla
  const screenPoints = polygon.points.map(p => ({
    x: p.x * zoom.level + zoom.panX,
    y: p.y * zoom.level + zoom.panY,
  }));

  let inside = false;
  for (let i = 0, j = screenPoints.length - 1; i < screenPoints.length; j = i++) {
    const xi = screenPoints[i].x;
    const yi = screenPoints[i].y;
    const xj = screenPoints[j].x;
    const yj = screenPoints[j].y;

    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < (xj - xi) * (point.y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }

  return inside;
}

// Función helper para dibujar preview de polígono actual
function drawPolygonPreview(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], isDarkness: boolean = false) {
  if (points.length === 0) return;

  ctx.save();
  ctx.strokeStyle = isDarkness ? '#ff0000' : '#ffff00';
  ctx.fillStyle = isDarkness ? 'rgba(255, 0, 0, 0.1)' : 'rgba(255, 255, 0, 0.1)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  ctx.beginPath();

  // Dibujar líneas entre puntos existentes
  if (points.length > 0) {
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      ctx.lineTo(points[i].x, points[i].y);
    }
  }

  ctx.stroke();

  // Dibujar puntos
  ctx.setLineDash([]);
  ctx.fillStyle = isDarkness ? '#ff0000' : '#ffff00';
  points.forEach(point => {
    ctx.beginPath();
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.restore();
}


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
  // Fog of War props
  fogOfWar?: FogOfWarState;
  fogEditMode?: boolean;
  fogSelectedTool?: FogTool;
  fogCurrentPolygon?: { x: number; y: number }[];
  fogSelectedDarknessAreaId?: string | null;
  onFogPolygonPoint?: (x: number, y: number) => void;
  onFogFinishPolygon?: () => void;
  onFogSelectDarknessArea?: (polygonId: string | null) => void;
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
  fogOfWar,
  fogEditMode = false,
  fogSelectedTool = null,
  fogCurrentPolygon = [],
  fogSelectedDarknessAreaId = null,
  onFogPolygonPoint,
  onFogFinishPolygon,
  onFogSelectDarknessArea,
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
  const animationFrameRef = useRef<number | null>(null);
  // Elemento img oculto para GIFs animados (necesario para que el navegador reproduzca la animación)
  const gifImageRef = useRef<HTMLImageElement | null>(null);
  
  // Detectar si la imagen es un GIF
  const isGif = mapImage && (mapImage.startsWith('data:image/gif') || mapImage.includes('image/gif'));
  
  // Debug: log cuando detectamos un GIF
  useEffect(() => {
    if (isGif) {
      console.log('[MapCanvas] GIF detectado:', mapImage?.substring(0, 50));
    }
  }, [isGif, mapImage]);

  useEffect(() => {
    if (mapImage && mapImage !== lastMapImageRef.current) {
      setImageLoaded(false);
      
      // Para GIFs, crear un elemento img en el DOM (visible pero mínimo) para que el navegador reproduzca la animación
      // Los navegadores modernos pausan animaciones en elementos completamente ocultos
      if (isGif) {
        // Limpiar elemento anterior si existe
        if (gifImageRef.current && gifImageRef.current.parentNode) {
          gifImageRef.current.parentNode.removeChild(gifImageRef.current);
        }
        
        // Crear nuevo elemento img - debe estar "visible" para que el navegador reproduzca la animación
        // Los navegadores modernos pausan animaciones en elementos con display:none o visibility:hidden
        const gifImg = document.createElement('img');
        gifImg.style.position = 'fixed';
        gifImg.style.left = '0';
        gifImg.style.top = '0';
        gifImg.style.width = '1px';
        gifImg.style.height = '1px';
        gifImg.style.opacity = '0.001'; // Mínima opacidad pero no 0
        gifImg.style.pointerEvents = 'none';
        gifImg.style.zIndex = '-9999';
        gifImg.style.visibility = 'visible';
        gifImg.style.display = 'block'; // Importante: debe ser block, no none
        gifImg.setAttribute('aria-hidden', 'true');
        document.body.appendChild(gifImg);
        
        // Forzar el navegador a considerar el elemento como "activo"
        // Algunos navegadores necesitan esto para reproducir animaciones
        gifImg.offsetHeight; // Trigger reflow
        
        gifImg.onload = () => {
          imageRef.current = gifImg;
          gifImageRef.current = gifImg;
          setImageLoaded(true);
          console.log('[MapCanvas] GIF cargado y listo para animación');
        };
        gifImg.onerror = () => {
          if (gifImg.parentNode) {
            gifImg.parentNode.removeChild(gifImg);
          }
          imageRef.current = null;
          gifImageRef.current = null;
          setImageLoaded(false);
        };
        gifImg.src = mapImage;
      } else {
        // Para imágenes normales, usar Image object normal
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
      }
      
      lastMapImageRef.current = mapImage;
    } else if (!mapImage) {
      // Limpiar elemento GIF del DOM si existe
      if (gifImageRef.current && gifImageRef.current.parentNode) {
        gifImageRef.current.parentNode.removeChild(gifImageRef.current);
        gifImageRef.current = null;
      }
      imageRef.current = null;
      lastMapImageRef.current = null;
      setImageLoaded(false);
    }
    
    // Cleanup: remover elemento GIF del DOM al desmontar
    return () => {
      if (gifImageRef.current && gifImageRef.current.parentNode) {
        gifImageRef.current.parentNode.removeChild(gifImageRef.current);
        gifImageRef.current = null;
      }
    };
  }, [mapImage, isGif]);

  // Ref para mantener referencia estable a la función de render
  const renderRef = useRef<(() => void) | undefined>(undefined);
  
  // Función de render extraída para poder usarla en el loop de animación
  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) {
      return;
    }

    const doRender = () => {
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

      // Dibujar imagen de mapa o imagen de inicio
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
        // Dibujar imagen de inicio cuando no hay mapa cargado
        ctx.fillStyle = '#1a1a1a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Cargar y dibujar imagen de bienvenida
        const welcomeImg = new Image();
        welcomeImg.onload = () => {
          // Dibujar imagen centrada y escalada para llenar el canvas
          const imgAspect = welcomeImg.width / welcomeImg.height;
          const canvasAspect = canvas.width / canvas.height;

          let drawWidth = canvas.width;
          let drawHeight = canvas.height;
          let drawX = 0;
          let drawY = 0;

          if (imgAspect > canvasAspect) {
            // Imagen más ancha que el canvas - centrar verticalmente
            drawHeight = canvas.width / imgAspect;
            drawY = (canvas.height - drawHeight) / 2;
          } else {
            // Imagen más alta que el canvas - centrar horizontalmente
            drawWidth = canvas.height * imgAspect;
            drawX = (canvas.width - drawWidth) / 2;
          }

          ctx.drawImage(welcomeImg, drawX, drawY, drawWidth, drawHeight);

          // Dibujar texto de bienvenida por encima de la imagen
          ctx.save();

          // Configurar sombreado para mejor legibilidad
          ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
          ctx.shadowBlur = 4;
          ctx.shadowOffsetX = 2;
          ctx.shadowOffsetY = 2;

          // Título principal
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 28px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('🏰 Kalak\'thul 🏰', canvas.width / 2, canvas.height / 2 - 60);

          // Subtítulo
          ctx.fillStyle = '#f0f0f0';
          ctx.font = '18px Arial';
          ctx.fillText('Carga un mapa para comenzar tu aventura', canvas.width / 2, canvas.height / 2 - 20);

          // Instrucción
          ctx.fillStyle = '#cccccc';
          ctx.font = '14px Arial';
          ctx.fillText('Usa el botón "📤 Cargar" en la parte superior', canvas.width / 2, canvas.height / 2 + 10);

          ctx.restore();
        };
        welcomeImg.src = '/images/welcome.jpg';

        // No hay bounds para la imagen de inicio
        currentImageBounds = null;
        if (onImageBoundsChange) {
          onImageBoundsChange(null);
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

      // Dibujar zonas de oscuridad FUERA del contexto transformado (coordenadas de pantalla)
      // Solo se dibujan si la funcionalidad está activada
      if (fogOfWar?.isEnabled && fogOfWar.darknessAreas.length > 0) {
        ctx.save();
        // Restaurar transformación para dibujar en coordenadas de pantalla
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.globalCompositeOperation = 'source-over';
        ctx.fillStyle = '#000000';

        fogOfWar.darknessAreas.forEach(polygon => {
          ctx.beginPath();
          if (polygon.points.length >= 3) {
            // Convertir coordenadas del mundo a pantalla
            const firstPoint = polygon.points[0];
            const screenX = firstPoint.x * safeZoom.level + safeZoom.panX;
            const screenY = firstPoint.y * safeZoom.level + safeZoom.panY;
            ctx.moveTo(screenX, screenY);

            for (let i = 1; i < polygon.points.length; i++) {
              const point = polygon.points[i];
              const px = point.x * safeZoom.level + safeZoom.panX;
              const py = point.y * safeZoom.level + safeZoom.panY;
              ctx.lineTo(px, py);
            }

            ctx.closePath();
            ctx.fill();
          }
        });

        // Dibujar resaltado de la zona seleccionada
        if (fogSelectedDarknessAreaId) {
          const selectedPolygon = fogOfWar.darknessAreas.find(p => p.id === fogSelectedDarknessAreaId);
          if (selectedPolygon && selectedPolygon.points.length >= 3) {
            ctx.save();
            ctx.strokeStyle = '#4a9eff';
            ctx.lineWidth = 3;
            ctx.setLineDash([5, 5]);
            ctx.beginPath();
            
            const firstPoint = selectedPolygon.points[0];
            const screenX = firstPoint.x * safeZoom.level + safeZoom.panX;
            const screenY = firstPoint.y * safeZoom.level + safeZoom.panY;
            ctx.moveTo(screenX, screenY);

            for (let i = 1; i < selectedPolygon.points.length; i++) {
              const point = selectedPolygon.points[i];
              const px = point.x * safeZoom.level + safeZoom.panX;
              const py = point.y * safeZoom.level + safeZoom.panY;
              ctx.lineTo(px, py);
            }
            
            ctx.closePath();
            ctx.stroke();
            ctx.restore();
          }
        }

        ctx.restore();
      }

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

      // Dibujar preview de polígono de niebla solo si estamos en modo edición activo
      // y tenemos una herramienta seleccionada con puntos en el polígono actual
      if (fogEditMode === true && fogSelectedTool && fogCurrentPolygon && fogCurrentPolygon.length > 0) {
        const screenPoints = fogCurrentPolygon.map(point => ({
          x: point.x * safeZoom.level + safeZoom.panX,
          y: point.y * safeZoom.level + safeZoom.panY,
        }));

        drawPolygonPreview(ctx, screenPoints, fogSelectedTool === 'darkness');
      }
    };

    doRender();
  }, [mapImage, imageLoaded, imageBounds, grid, canvasDimensions, zoom, onImageBoundsChange, isCreatingEffect, effectCreationStart, effectCreationCurrent, pendingEffectType, fogOfWar, fogEditMode, fogSelectedTool, fogCurrentPolygon, fogSelectedDarknessAreaId]);
  
  // Actualizar ref cuando render cambia
  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  // Ejecutar render cuando cambian las dependencias (para imágenes estáticas)
  useEffect(() => {
    if (!isGif) {
      render();
    }
  }, [render, isGif]);

  // Loop de animación para GIFs
  useEffect(() => {
    if (isGif && imageLoaded && imageRef.current) {
      console.log('[MapCanvas] Iniciando loop de animación para GIF');
      let isRunning = true;
      
      const animate = () => {
        if (!isRunning || !imageRef.current) {
          return;
        }
        // Usar la referencia estable en lugar de la función directamente
        if (renderRef.current) {
          renderRef.current();
        }
        animationFrameRef.current = requestAnimationFrame(animate);
      };
      
      animationFrameRef.current = requestAnimationFrame(animate);
      
      return () => {
        console.log('[MapCanvas] Deteniendo loop de animación');
        isRunning = false;
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
          animationFrameRef.current = null;
        }
      };
    } else {
      // Si no es GIF, cancelar cualquier loop activo
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }, [isGif, imageLoaded]); // Solo dependencias esenciales, sin render

  // Convertir coordenadas del mouse a coordenadas del canvas con zoom
  // Coordenadas absolutas del canvas considerando zoom y pan
  const screenToCanvas = (screenX: number, screenY: number) => {
    return {
      x: (screenX - zoom.panX) / zoom.level,
      y: (screenY - zoom.panY) / zoom.level,
    };
  };


  const findEffectAtPosition = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    // Coordenadas absolutas del canvas considerando zoom y pan
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

    // Buscar efecto primero (prioridad sobre niebla)
    const clickedEffect = findEffectAtPosition(x, y);

        // Si hay un efecto pendiente para agregar
        if (pendingEffectType && onAddEffectAtPosition) {
          if (clickedEffect) {
            // Si se hace clic en un efecto existente, cancelar creación y seleccionarlo
            if (onEffectClick) {
              onEffectClick(clickedEffect.id);
            }
            // setPendingEffectType(null); // No tenemos acceso a esta función aquí
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

        // Solo si NO hay efectos pendientes o clicados, verificar modo edición de niebla
        if (fogEditMode && fogSelectedTool) {
          // Modo selección: detectar si click está dentro de alguna zona de oscuridad
          if (fogSelectedTool === 'select' && fogOfWar?.darknessAreas && onFogSelectDarknessArea) {
            e.preventDefault();
            // Definir safeZoom para la detección
            const safeZoom = {
              level: zoom?.level && zoom.level > 0 ? zoom.level : 1,
              panX: zoom?.panX || 0,
              panY: zoom?.panY || 0,
            };
            // Buscar la primera zona que contenga el punto (de atrás hacia adelante para seleccionar la última dibujada)
            let clickedPolygon: Polygon | null = null;
            for (let i = fogOfWar.darknessAreas.length - 1; i >= 0; i--) {
              const polygon = fogOfWar.darknessAreas[i];
              if (isPointInPolygon(canvasCoords, polygon, safeZoom)) {
                clickedPolygon = polygon;
                break;
              }
            }
            
            if (clickedPolygon) {
              // Si clickeamos la misma zona, deseleccionar; si no, seleccionar la nueva
              if (fogSelectedDarknessAreaId === clickedPolygon.id) {
                onFogSelectDarknessArea(null);
              } else {
                onFogSelectDarknessArea(clickedPolygon.id);
              }
            } else {
              // Click fuera de cualquier zona, deseleccionar
              onFogSelectDarknessArea(null);
            }
            return;
          }
          
          // Modo creación: agregar punto al polígono
          if (fogSelectedTool === 'darkness' && onFogPolygonPoint) {
            e.preventDefault();
            onFogPolygonPoint(canvasCoords.x, canvasCoords.y);
            return;
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

  const handleDoubleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Finalizar polígono de niebla con doble clic
    if (fogEditMode && fogSelectedTool && onFogFinishPolygon) {
      e.preventDefault();
      onFogFinishPolygon();
    }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLCanvasElement>) => {
    // Finalizar polígono de niebla con Enter
    if (fogEditMode && fogSelectedTool && e.key === 'Enter' && onFogFinishPolygon) {
      e.preventDefault();
      onFogFinishPolygon();
    }
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
      onDoubleClick={handleDoubleClick}
      onWheel={handleWheel}
      onKeyDown={handleKeyDown}
      onContextMenu={(e) => e.preventDefault()}
      tabIndex={0} // Para que reciba eventos de teclado
          style={{
            cursor: isPanning ? 'grabbing' :
                   (isDragging ? 'grabbing' :
                   (fogEditMode && fogSelectedTool ? 'crosshair' :
                   (hoveredEffectId || pendingEffectType ? 'crosshair' : 'default'))),
            display: 'block',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
    />
  );
}

