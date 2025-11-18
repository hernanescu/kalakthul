import { useState, useRef, useEffect, useCallback } from 'react';
import { useGrid } from './hooks/useGrid';
import { useTokens } from './hooks/useTokens';
import { useEffects } from './hooks/useEffects';
import { loadImageAsBase64 } from './utils/canvasUtils';
import { snapToGrid, pixelToGrid } from './utils/gridUtils';
import { MapState, ImageBounds, ZoomState, EffectType } from './types';
import MapCanvas from './components/MapCanvas';
import GridControls from './components/GridControls';
import TokenControls from './components/TokenControls';
import ZoomControls from './components/ZoomControls';
import EffectControls from './components/EffectControls';
import CollapsibleSection from './components/CollapsibleSection';
import EffectRenderer from './components/EffectRenderer';
import './App.css';

const STORAGE_KEY = 'ttrpg-map-state';

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar estado inicial desde localStorage
  const [initialState, setInitialState] = useState<MapState | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      console.log('[App] Loading from localStorage:', saved ? 'Found data' : 'No data');
      if (saved) {
        const parsed = JSON.parse(saved) as MapState;
        console.log('[App] Parsed state:', { 
          hasMapImage: !!parsed.mapImage, 
          hasImageBounds: !!parsed.imageBounds,
          hasZoom: !!parsed.zoom,
          tokensCount: parsed.tokens?.length || 0
        });
        setInitialState(parsed);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('[App] Error loading from localStorage:', error);
      setIsInitialized(true);
    }
  }, []);

  const { grid, setRows, setColumns, setOpacity, setColor, toggleVisibility } = useGrid(initialState?.grid);
  const {
    tokens,
    selectedTokenId,
    addToken,
    deleteToken,
    selectToken,
    moveToken,
    setTokenColor,
    setTokenSize,
  } = useTokens(initialState?.tokens || []);

  const {
    effects,
    selectedEffectId,
    addEffect,
    deleteEffect,
    selectEffect,
    moveEffect,
    resizeEffect,
    setEffectShape,
    setEffectOpacity,
  } = useEffects(initialState?.effects || []);

  const [mapImage, setMapImage] = useState<string | null>(initialState?.mapImage || null);
  const [imageBounds, setImageBounds] = useState<ImageBounds | null>(initialState?.imageBounds || null);
  const [zoom, setZoom] = useState<ZoomState>(
    initialState?.zoom || { level: 1, panX: 0, panY: 0 }
  );
  const [pendingEffectType, setPendingEffectType] = useState<EffectType | null>(null);
  const [defaultEffectShape, setDefaultEffectShape] = useState<'square' | 'circle'>('circle');


  // Sincronizar mapImage, imageBounds y zoom cuando se carga el estado inicial
  useEffect(() => {
    if (initialState?.mapImage) {
      setMapImage(initialState.mapImage);
    }
    if (initialState?.imageBounds) {
      setImageBounds(initialState.imageBounds);
    }
    if (initialState?.zoom) {
      setZoom(initialState.zoom);
    }
  }, [initialState]);

  // Calcular dimensiones del canvas
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (isPresentationMode) {
          setCanvasDimensions({
            width: window.innerWidth,
            height: window.innerHeight,
          });
        } else {
          setCanvasDimensions({
            width: rect.width - 300, // Restar ancho del panel lateral
            height: rect.height - 20, // Margen pequeño
          });
        }
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [isPresentationMode]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar formato
    const validFormats = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validFormats.includes(file.type)) {
      alert('Formato no soportado. Use JPG, PNG o WEBP.');
      return;
    }

    try {
      const base64 = await loadImageAsBase64(file);
      setMapImage(base64);
    } catch (error) {
      alert('Error al cargar la imagen');
      console.error(error);
    }
  };

  const handleTokenClick = (tokenId: string | null) => {
    selectToken(tokenId);
  };

  const handleTokenDrag = (tokenId: string, x: number, y: number) => {
    const snapped = snapToGrid(x, y, imageBounds, grid);
    if (snapped) {
      moveToken(tokenId, snapped.x, snapped.y, snapped.gridX, snapped.gridY);
    }
  };

  const handleAddToken = () => {
    // Si hay imagen, añadir token en el centro de la imagen; si no, en el centro del canvas
    let centerX = canvasDimensions.width / 2;
    let centerY = canvasDimensions.height / 2;
    
    if (imageBounds) {
      centerX = imageBounds.x + imageBounds.width / 2;
      centerY = imageBounds.y + imageBounds.height / 2;
    }
    
    const snapped = snapToGrid(centerX, centerY, imageBounds, grid);
    if (snapped) {
      addToken(snapped.x, snapped.y, snapped.gridX, snapped.gridY);
    }
  };

  const handleAddEffect = (type: EffectType) => {
    // En lugar de agregar directamente, activar modo "pendiente"
    // El efecto se agregará cuando el usuario haga clic en el canvas
    setPendingEffectType(type);
  };

  const handleAddEffectAtPosition = (type: string, startX: number, startY: number, endX: number, endY: number) => {
    // Calcular ancho y alto desde el punto inicial al final
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    
    // Si el tamaño es muy pequeño, usar tamaño mínimo
    const finalWidth = Math.max(20, width);
    const finalHeight = Math.max(20, height);
    
    // Centro del efecto (usar el centro exacto del área arrastrada)
    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;
    
    // Para efectos, no hacer snap automático - usar la posición exacta
    // Solo calcular gridX/gridY para referencia, pero usar las coordenadas exactas
    const gridPos = pixelToGrid(centerX, centerY, imageBounds, grid);
    const gridX = gridPos?.gridX ?? 0;
    const gridY = gridPos?.gridY ?? 0;
    
    addEffect(
      type as EffectType,
      centerX,
      centerY,
      finalWidth,
      finalHeight,
      defaultEffectShape,
      gridX,
      gridY
    );
    
    setPendingEffectType(null); // Desactivar modo pendiente
  };

  const handleEffectClick = (effectId: string | null) => {
    selectEffect(effectId);
  };

  const handleEffectDrag = (effectId: string, x: number, y: number) => {
    // Para efectos, no hacer snap automático - usar posición exacta
    // Solo calcular gridX/gridY para referencia
    const gridPos = pixelToGrid(x, y, imageBounds, grid);
    const gridX = gridPos?.gridX ?? 0;
    const gridY = gridPos?.gridY ?? 0;
    
    moveEffect(effectId, x, y, gridX, gridY);
  };

  const handleDeleteEffect = () => {
    if (selectedEffectId) {
      deleteEffect(selectedEffectId);
    }
  };

  const handleEffectShapeChange = (shape: 'square' | 'circle') => {
    if (selectedEffectId) {
      setEffectShape(selectedEffectId, shape);
    } else {
      // Si no hay efecto seleccionado, guardar la forma para el próximo efecto
      setDefaultEffectShape(shape);
    }
  };

  const handleEffectOpacityChange = (opacity: number) => {
    if (selectedEffectId) {
      setEffectOpacity(selectedEffectId, opacity);
    }
  };

  const handleDeleteToken = () => {
    if (selectedTokenId) {
      deleteToken(selectedTokenId);
    }
  };

  const handleColorChange = (color: string) => {
    if (selectedTokenId) {
      setTokenColor(selectedTokenId, color);
    }
  };

  const handleSizeChange = (size: number) => {
    if (selectedTokenId) {
      setTokenSize(selectedTokenId, size);
    }
  };

  const togglePresentationMode = async () => {
    if (!isPresentationMode) {
      if (containerRef.current?.requestFullscreen) {
        await containerRef.current.requestFullscreen();
      }
      setIsPresentationMode(true);
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
      setIsPresentationMode(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsPresentationMode(false);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPresentationMode) {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        }
        setIsPresentationMode(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isPresentationMode]);

  // Persistir estado en localStorage (solo después de inicialización)
  useEffect(() => {
    if (!isInitialized) return;

    const state: MapState = {
      mapImage,
      imageBounds,
      grid,
      tokens,
      selectedTokenId,
      effects,
      selectedEffectId,
      zoom,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [mapImage, imageBounds, grid, tokens, selectedTokenId, effects, selectedEffectId, zoom, isInitialized]);

  const selectedToken = tokens.find((t) => t.id === selectedTokenId) || null;

  // Memoizar los callbacks para evitar re-renders innecesarios
  const handleImageBoundsChange = useCallback((bounds: ImageBounds | null) => {
    setImageBounds(bounds);
  }, []);

  const handleZoomChange = useCallback((newZoom: ZoomState) => {
    setZoom(newZoom);
  }, []);

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => ({
      ...prev,
      level: Math.min(4, prev.level * 1.2),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => ({
      ...prev,
      level: Math.max(0.25, prev.level / 1.2),
    }));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoom({ level: 1, panX: 0, panY: 0 });
  }, []);

  return (
    <div
      ref={containerRef}
      className={`app ${isPresentationMode ? 'presentation-mode' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {!isPresentationMode && (
        <div className="sidebar">
          <div className="header">
            <h1>Kalak'thuling</h1>
            <button onClick={() => fileInputRef.current?.click()} className="load-map-btn">
              Cargar Mapa
            </button>
            <button onClick={togglePresentationMode} className="presentation-btn">
              Modo Presentación
            </button>
          </div>

              <CollapsibleSection title="Grilla" defaultExpanded={true}>
                <GridControls
                  grid={grid}
                  onRowsChange={setRows}
                  onColumnsChange={setColumns}
                  onOpacityChange={setOpacity}
                  onColorChange={setColor}
                  onToggleVisibility={toggleVisibility}
                />
              </CollapsibleSection>

              <CollapsibleSection title="Efectos" defaultExpanded={true}>
                <EffectControls
                  selectedEffectType={effects.find(e => e.id === selectedEffectId)?.type || null}
                  selectedShape={effects.find(e => e.id === selectedEffectId)?.shape || defaultEffectShape}
                  onAddEffect={handleAddEffect}
                  onDeleteEffect={handleDeleteEffect}
                  onShapeChange={handleEffectShapeChange}
                  onOpacityChange={handleEffectOpacityChange}
                  selectedOpacity={effects.find(e => e.id === selectedEffectId)?.opacity}
                />
              </CollapsibleSection>

              <CollapsibleSection title="Tokens" defaultExpanded={false}>
                <TokenControls
                  selectedToken={selectedToken}
                  onColorChange={handleColorChange}
                  onSizeChange={handleSizeChange}
                  onDelete={handleDeleteToken}
                  onAddToken={handleAddToken}
                />
              </CollapsibleSection>

              <CollapsibleSection title="Zoom" defaultExpanded={false}>
                <ZoomControls
                  zoom={zoom}
                  onZoomIn={handleZoomIn}
                  onZoomOut={handleZoomOut}
                  onZoomReset={handleZoomReset}
                />
              </CollapsibleSection>
        </div>
      )}

      <div className="canvas-container">
        <MapCanvas
          mapImage={mapImage}
          imageBounds={imageBounds}
          grid={grid}
          tokens={tokens}
          selectedTokenId={selectedTokenId}
          effects={effects}
          selectedEffectId={selectedEffectId}
          pendingEffectType={pendingEffectType}
          zoom={zoom}
          onTokenClick={handleTokenClick}
          onTokenDrag={handleTokenDrag}
          onEffectClick={handleEffectClick}
          onEffectDrag={handleEffectDrag}
          onAddEffectAtPosition={handleAddEffectAtPosition}
          onImageBoundsChange={handleImageBoundsChange}
          onZoomChange={handleZoomChange}
          canvasDimensions={canvasDimensions}
        />
        {/* Renderizar efectos sobre el canvas */}
        <div className="effects-layer">
          {effects.map((effect) => (
            <EffectRenderer
              key={effect.id}
              effect={effect}
              imageBounds={imageBounds}
              canvasWidth={canvasDimensions.width}
              canvasHeight={canvasDimensions.height}
              zoom={zoom}
            />
          ))}
        </div>
        {isPresentationMode && (
          <>
            <ZoomControls
              zoom={zoom}
              onZoomIn={handleZoomIn}
              onZoomOut={handleZoomOut}
              onZoomReset={handleZoomReset}
              compact={true}
            />
            <button
              onClick={togglePresentationMode}
              className="exit-presentation-btn"
              title="Salir del modo presentación (Esc)"
            >
              ✕
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
