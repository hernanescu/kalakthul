import { useState, useRef, useEffect, useCallback } from 'react';
import { useGrid } from './hooks/useGrid';
import { useEffects } from './hooks/useEffects';
import { useFogOfWar } from './hooks/useFogOfWar';
import { loadImageAsBase64 } from './utils/canvasUtils';
import { pixelToGrid } from './utils/gridUtils';
import { MapState, ImageBounds, ZoomState, EffectType } from './types';
import MapCanvas from './components/MapCanvas';
import GridControls from './components/GridControls';
import ZoomControls from './components/ZoomControls';
import EffectControls from './components/EffectControls';
import FogControls from './components/FogControls';
import CollapsibleSection from './components/CollapsibleSection';
import EffectRenderer from './components/EffectRenderer';
import MapLibrary from './components/MapLibrary';
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
          effectsCount: parsed.effects?.length || 0
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
    effects,
    selectedEffectId,
    addEffect,
    deleteEffect,
    selectEffect,
    moveEffect,
    setEffectShape,
    setEffectOpacity,
  } = useEffects(initialState?.effects || []);

  const {
    fogState,
    isEditMode,
    selectedTool,
    currentPolygon,
    toggleFog,
    enterEditMode,
    exitEditMode,
    selectTool,
    addPolygonPoint,
    finishPolygon,
    resetFog,
    resetAllFog,
  } = useFogOfWar(initialState?.fogOfWar);

  const [mapImage, setMapImage] = useState<string | null>(null); // Siempre arranca sin mapa
  const [imageBounds, setImageBounds] = useState<ImageBounds | null>(null);
  const [zoom, setZoom] = useState<ZoomState>({ level: 1, panX: 0, panY: 0 });
  const [pendingEffectType, setPendingEffectType] = useState<EffectType | null>(null);
  const [currentMapId, setCurrentMapId] = useState<string | undefined>();
  const [defaultEffectShape, setDefaultEffectShape] = useState<'square' | 'circle'>('circle');


  // La app siempre arranca limpia, sin estado guardado

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

  const handleClearMap = () => {
    setMapImage(null);
    setImageBounds(null);
    // Limpiar zoom y efectos también
    setZoom({ level: 1, panX: 0, panY: 0 });
    // Limpiar efectos
    effects.forEach(effect => {
      deleteEffect(effect.id);
    });
    // Limpiar niebla de guerra
    resetAllFog();
  };

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

  const handleMapSelect = (mapEntry: any) => {
    setMapImage(mapEntry.compressedImage);
    setCurrentMapId(mapEntry.id);
    // Reset zoom, effects and fog when changing maps
    setZoom({ level: 1, panX: 0, panY: 0 });
    // Reset effects and fog for clean slate on new map
    effects.forEach(effect => {
      deleteEffect(effect.id);
    });
    resetAllFog();
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

  const handleDeleteAllEffects = () => {
    // Borrar todos los efectos
    effects.forEach(effect => {
      deleteEffect(effect.id);
    });
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
      effects,
      selectedEffectId,
      zoom,
      fogOfWar: fogState,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [mapImage, imageBounds, grid, effects, selectedEffectId, zoom, fogState, isInitialized]);


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

      {/* Header con librería de mapas y contenido principal */}
      {!isPresentationMode && (
        <>
          <MapLibrary
            onMapSelect={handleMapSelect}
            currentMapId={currentMapId}
            onTogglePresentation={togglePresentationMode}
            onClearMap={handleClearMap}
          />

          <div className="main-content">
            <div className="sidebar">
              <CollapsibleSection title="Grilla" defaultExpanded={false}>
                <GridControls
                  grid={grid}
                  onRowsChange={setRows}
                  onColumnsChange={setColumns}
                  onOpacityChange={setOpacity}
                  onColorChange={setColor}
                  onToggleVisibility={toggleVisibility}
                />
              </CollapsibleSection>

                    <CollapsibleSection title="Efectos" defaultExpanded={false}>
                      <EffectControls
                        selectedEffectType={effects.find(e => e.id === selectedEffectId)?.type || null}
                        selectedShape={effects.find(e => e.id === selectedEffectId)?.shape || defaultEffectShape}
                        onAddEffect={handleAddEffect}
                        onDeleteEffect={handleDeleteEffect}
                        onDeleteAllEffects={handleDeleteAllEffects}
                        onShapeChange={handleEffectShapeChange}
                        onOpacityChange={handleEffectOpacityChange}
                        selectedOpacity={effects.find(e => e.id === selectedEffectId)?.opacity}
                      />
                    </CollapsibleSection>

              <CollapsibleSection title="Zonas de Oscuridad" defaultExpanded={false}>
                <FogControls
                  isEnabled={fogState.isEnabled}
                  isEditMode={isEditMode}
                  selectedTool={selectedTool}
                  darknessAreasCount={fogState.darknessAreas.length}
                  onToggleFog={toggleFog}
                  onEnterEditMode={enterEditMode}
                  onExitEditMode={exitEditMode}
                  onSelectTool={selectTool}
                  onResetFog={resetFog}
                  onClearAllFog={resetAllFog}
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

            <div className="canvas-container">
              <MapCanvas
                mapImage={mapImage}
                imageBounds={imageBounds}
                grid={grid}
                effects={effects}
                selectedEffectId={selectedEffectId}
                pendingEffectType={pendingEffectType}
                zoom={zoom}
                onEffectClick={handleEffectClick}
                onEffectDrag={handleEffectDrag}
                onAddEffectAtPosition={handleAddEffectAtPosition}
                onImageBoundsChange={handleImageBoundsChange}
                onZoomChange={handleZoomChange}
                canvasDimensions={canvasDimensions}
                fogOfWar={fogState}
                fogEditMode={isEditMode}
                fogSelectedTool={selectedTool}
                fogCurrentPolygon={currentPolygon}
                onFogPolygonPoint={addPolygonPoint}
                onFogFinishPolygon={finishPolygon}
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
                    isPresentationMode={false}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

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

          {/* Canvas en modo presentación - sin header/sidebar */}
          <div className="presentation-canvas-container">
            <MapCanvas
              mapImage={mapImage}
              imageBounds={imageBounds}
              grid={grid}
              effects={effects}
              selectedEffectId={selectedEffectId}
              pendingEffectType={pendingEffectType}
              zoom={zoom}
              onEffectClick={handleEffectClick}
              onEffectDrag={handleEffectDrag}
              onAddEffectAtPosition={handleAddEffectAtPosition}
              onImageBoundsChange={handleImageBoundsChange}
              onZoomChange={handleZoomChange}
              canvasDimensions={{ width: window.innerWidth, height: window.innerHeight }}
              fogOfWar={fogState}
              fogEditMode={false} // En modo presentación no hay edición
              fogSelectedTool={null}
              fogCurrentPolygon={[]}
            />
            {/* Renderizar efectos sobre el canvas */}
            <div className="effects-layer">
              {effects.map((effect) => (
                <EffectRenderer
                  key={effect.id}
                  effect={effect}
                  imageBounds={imageBounds}
                  canvasWidth={window.innerWidth}
                  canvasHeight={window.innerHeight}
                  zoom={zoom}
                  isPresentationMode={true}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
