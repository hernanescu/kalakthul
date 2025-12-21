import { useState, useRef, useEffect, useCallback } from 'react';
import { useGrid } from './hooks/useGrid';
import { useEffects } from './hooks/useEffects';
import { useFogOfWar } from './hooks/useFogOfWar';
import { useParticleLayer } from './hooks/useParticleLayer';
import { useTokens } from './hooks/useTokens';
import { useTokenLibrary } from './hooks/useTokenLibrary';
import { loadImageAsBase64 } from './utils/canvasUtils';
import { pixelToGrid } from './utils/gridUtils';
import { MapState, ImageBounds, ZoomState, EffectType, TokenEntry } from './types';
import { scenesApi } from './api/scenes';
import MapCanvas from './components/MapCanvas';
import EffectRenderer from './components/EffectRenderer';
import TokenRenderer from './components/TokenRenderer';
import ParticleLayer from './components/ParticleLayer';
import Header from './components/Header';
import { FullscreenLayout } from './components/FullscreenLayout';
import './App.css';

const SCENE_ID_KEY = 'ttrpg-scene-id';

function App() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Cargar estado inicial desde API
  const [initialState, setInitialState] = useState<MapState | null>(null);
  const [currentSceneId, setCurrentSceneId] = useState<string | null>(null);

  useEffect(() => {
    const loadScene = async () => {
      try {
        const savedSceneId = localStorage.getItem(SCENE_ID_KEY);
        console.log('[App] Loading scene from API:', savedSceneId || 'No scene ID');
        
        if (savedSceneId) {
          try {
            const scene = await scenesApi.getById(savedSceneId);
            console.log('[App] Loaded scene:', {
              id: scene.id,
              hasBackground: !!scene.background_url,
              tokensCount: scene.tokens?.length || 0,
              effectsCount: scene.effects?.length || 0
            });

            setCurrentSceneId(scene.id);
            
            // Convertir escena a MapState
            const mapState: MapState = {
              mapImage: scene.background_url || null,
              imageBounds: scene.image_bounds,
              grid: scene.grid_config || {
                rows: 10,
                columns: 10,
                opacity: 0.5,
                color: '#000000',
                visible: true,
              },
              effects: scene.effects || [],
              selectedEffectId: null,
              zoom: scene.zoom_state || { level: 1, panX: 0, panY: 0 },
              fogOfWar: scene.fog_data || { isEnabled: false, darknessAreas: [] },
              particleLayer: { isEnabled: false, particleType: null, intensity: 0.5, speed: 0.5 },
              tokens: scene.tokens?.map((t: any) => ({
                id: t.id,
                tokenEntryId: t.asset_id || t.tokenEntryId,
                x: t.x,
                y: t.y,
                gridX: t.grid_x || t.gridX || 0,
                gridY: t.grid_y || t.gridY || 0,
                width: t.width || 50,
                height: t.height || 50,
                name: t.name,
                opacity: t.opacity || 1,
                token_image_url: t.token_image_url,
                asset_id: t.asset_id,
              })) || [],
              selectedTokenId: null,
            };
            
            setInitialState(mapState);
          } catch (error) {
            console.error('[App] Error loading scene from API:', error);
            // Si falla, crear nueva escena
            setInitialState(null);
          }
        } else {
          setInitialState(null);
        }
      } catch (error) {
        console.error('[App] Error loading scene:', error);
        setInitialState(null);
      } finally {
        setIsInitialized(true);
      }
    };

    loadScene();
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
    selectedDarknessAreaId,
    toggleFog,
    enterEditMode,
    exitEditMode,
    selectTool,
    addPolygonPoint,
    finishPolygon,
    deletePolygon,
    resetFog,
    resetAllFog,
    selectDarknessArea,
  } = useFogOfWar(initialState?.fogOfWar);

  const {
    particleState,
    toggleParticles,
    setParticleType,
    setIntensity,
    setSpeed,
  } = useParticleLayer(initialState?.particleLayer);

  const {
    tokens,
    selectedTokenId,
    addToken,
    deleteToken,
    selectToken,
    moveToken,
    setTokenName,
    setTokenOpacity,
    deleteAllTokens,
  } = useTokens(initialState?.tokens || []);

  const {
    library: tokenLibrary,
    getTokenById,
    markTokenAsUsed,
  } = useTokenLibrary();

  const [mapImage, setMapImage] = useState<string | null>(null); // Siempre arranca sin mapa
  const [imageBounds, setImageBounds] = useState<ImageBounds | null>(null);
  const [zoom, setZoom] = useState<ZoomState>({ level: 1, panX: 0, panY: 0 });
  const [pendingEffectType, setPendingEffectType] = useState<EffectType | null>(null);
  const [pendingTokenEntryId, setPendingTokenEntryId] = useState<string | null>(null);
  const [currentMapId, setCurrentMapId] = useState<string | undefined>();
  const [defaultEffectShape, setDefaultEffectShape] = useState<'square' | 'circle'>('circle');
  const [isDraggingToken, setIsDraggingToken] = useState(false);
  const [draggingTokenId, setDraggingTokenId] = useState<string | null>(null);
  const [dragTokenOffset, setDragTokenOffset] = useState({ x: 0, y: 0 });


  // La app siempre arranca limpia, sin estado guardado

  // Calcular dimensiones del canvas dinámicamente
  const getCanvasDimensions = () => {
    if (isPresentationMode) {
      return {
        width: window.innerWidth,
        height: window.innerHeight,
      };
    } else {
      // En modo normal, el canvas ocupa todo el ancho de la ventana
      return {
        width: window.innerWidth,
        height: window.innerHeight - 50, // Restar altura del header
      };
    }
  };

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
    const validFormats = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!validFormats.includes(file.type)) {
      alert('Formato no soportado. Use JPG, PNG, WEBP o GIF.');
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

  const handleMapSelect = async (mapEntry: any) => {
    // Usar storage_url si está disponible, sino compressedImage (legacy)
    const imageUrl = mapEntry.storage_url || mapEntry.compressedImage;
    setMapImage(imageUrl);
    setCurrentMapId(mapEntry.id);
    
    // Actualizar o crear escena con el nuevo background
    try {
      if (currentSceneId) {
        await scenesApi.update(currentSceneId, {
          background_asset_id: mapEntry.id,
          zoom_state: { level: 1, panX: 0, panY: 0 },
        });
      } else {
        const newScene = await scenesApi.create({
          background_asset_id: mapEntry.id,
          grid_config: grid,
          fog_data: fogState,
          zoom_state: { level: 1, panX: 0, panY: 0 },
        });
        setCurrentSceneId(newScene.id);
        localStorage.setItem(SCENE_ID_KEY, newScene.id);
      }
    } catch (error) {
      console.error('Error updating scene:', error);
    }
    
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

  const handleSelectToken = (tokenEntry: TokenEntry) => {
    setPendingTokenEntryId(tokenEntry.id);
    markTokenAsUsed(tokenEntry.id);
  };

  const handleAddTokenAtPosition = (tokenEntryId: string, startX: number, startY: number, endX: number, endY: number) => {
    const width = Math.abs(endX - startX);
    const height = Math.abs(endY - startY);
    const finalWidth = Math.max(20, width);
    const finalHeight = Math.max(20, height);
    const centerX = (startX + endX) / 2;
    const centerY = (startY + endY) / 2;
    const gridPos = pixelToGrid(centerX, centerY, imageBounds, grid);
    const gridX = gridPos?.gridX ?? 0;
    const gridY = gridPos?.gridY ?? 0;

    addToken(tokenEntryId, centerX, centerY, finalWidth, finalHeight, gridX, gridY);
    setPendingTokenEntryId(null);
  };

  const handleTokenClick = (tokenId: string | null) => {
    selectToken(tokenId);
  };

  const handleTokenDrag = useCallback((tokenId: string, x: number, y: number) => {
    const gridPos = pixelToGrid(x, y, imageBounds, grid);
    const gridX = gridPos?.gridX ?? 0;
    const gridY = gridPos?.gridY ?? 0;
    moveToken(tokenId, x, y, gridX, gridY);
  }, [imageBounds, grid, moveToken]);

  const handleTokenDragStart = (tokenId: string, offsetX: number, offsetY: number) => {
    selectToken(tokenId);
    setIsDraggingToken(true);
    setDraggingTokenId(tokenId);
    setDragTokenOffset({ x: offsetX, y: offsetY });
  };

  // Manejar arrastre global de tokens
  useEffect(() => {
    if (!isDraggingToken || !draggingTokenId) return;

    const handleMouseMove = (e: MouseEvent) => {
      const canvas = document.querySelector('.canvas-container, .presentation-canvas-container');
      if (!canvas) return;
      
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const canvasCoords = {
        x: (x - zoom.panX) / zoom.level,
        y: (y - zoom.panY) / zoom.level,
      };
      
      handleTokenDrag(
        draggingTokenId,
        canvasCoords.x - dragTokenOffset.x,
        canvasCoords.y - dragTokenOffset.y
      );
    };

    const handleMouseUp = () => {
      setIsDraggingToken(false);
      setDraggingTokenId(null);
      setDragTokenOffset({ x: 0, y: 0 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingToken, draggingTokenId, dragTokenOffset, zoom, handleTokenDrag]);

  const handleDeleteToken = () => {
    if (selectedTokenId) {
      deleteToken(selectedTokenId);
    }
  };

  const handleDeleteAllTokens = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar TODOS los tokens?')) {
      deleteAllTokens();
    }
  };

  const handleTokenNameChange = (name: string) => {
    if (selectedTokenId) {
      setTokenName(selectedTokenId, name || undefined);
    }
  };

  const handleTokenOpacityChange = (opacity: number) => {
    if (selectedTokenId) {
      setTokenOpacity(selectedTokenId, opacity);
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

  // Persistir estado en API (solo después de inicialización)
  useEffect(() => {
    if (!isInitialized || !currentSceneId) return;

    const saveScene = async () => {
      try {
        await scenesApi.update(currentSceneId, {
          grid_config: grid,
          fog_data: fogState,
          image_bounds: imageBounds,
          zoom_state: zoom,
        });
      } catch (error) {
        console.error('Error saving scene to API:', error);
      }
    };

    // Debounce para no hacer demasiadas llamadas
    const timeoutId = setTimeout(saveScene, 1000);
    return () => clearTimeout(timeoutId);
  }, [grid, fogState, imageBounds, zoom, isInitialized, currentSceneId]);

  // Crear escena inicial si no existe
  useEffect(() => {
    if (!isInitialized || currentSceneId) return;

    const createInitialScene = async () => {
      try {
        const scene = await scenesApi.create({
          grid_config: grid,
          fog_data: fogState,
          image_bounds: imageBounds,
          zoom_state: zoom,
        });
        setCurrentSceneId(scene.id);
        localStorage.setItem(SCENE_ID_KEY, scene.id);
      } catch (error) {
        console.error('Error creating initial scene:', error);
      }
    };

    createInitialScene();
  }, [isInitialized, currentSceneId, grid, fogState, imageBounds, zoom]);


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
      level: Math.min(8, prev.level * 1.2),
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

  // Calcular dimensiones del canvas dinámicamente

  return (
    <div
      ref={containerRef}
      className={`app ${isPresentationMode ? 'presentation-mode' : ''}`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,.webp,.gif"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Header unificado con menús desplegables - solo visible en modo normal */}
      {!isPresentationMode && (
        <Header
          onMapSelect={handleMapSelect}
          onTokenSelect={handleSelectToken}
          currentMapId={currentMapId}
          onTogglePresentation={togglePresentationMode}
          onClearMap={handleClearMap}
          onClearAll={() => {
            handleClearMap();
            deleteAllTokens();
          }}
        />
      )}

      {/* Botón de salir en modo presentación */}
      {isPresentationMode && (
        <button
          onClick={togglePresentationMode}
          className="exit-presentation-btn"
          title="Salir del modo presentación (Esc)"
        >
          ✕
        </button>
      )}

      <FullscreenLayout
        grid={grid}
        onRowsChange={setRows}
        onColumnsChange={setColumns}
        onOpacityChange={setOpacity}
        onColorChange={setColor}
        onToggleVisibility={toggleVisibility}
        selectedEffectType={effects.find(e => e.id === selectedEffectId)?.type || null}
        selectedShape={effects.find(e => e.id === selectedEffectId)?.shape || defaultEffectShape}
        selectedOpacity={effects.find(e => e.id === selectedEffectId)?.opacity}
        onAddEffect={handleAddEffect}
        onDeleteEffect={handleDeleteEffect}
        onDeleteAllEffects={handleDeleteAllEffects}
        onShapeChange={handleEffectShapeChange}
        onEffectOpacityChange={handleEffectOpacityChange}
        fogIsEnabled={fogState.isEnabled}
        fogIsEditMode={isEditMode}
        fogSelectedTool={selectedTool}
        fogDarknessAreasCount={fogState.darknessAreas.length}
        fogSelectedDarknessAreaId={selectedDarknessAreaId}
        onToggleFog={toggleFog}
        onEnterEditMode={enterEditMode}
        onExitEditMode={exitEditMode}
        onSelectTool={selectTool}
        onResetFog={resetFog}
        onClearAllFog={resetAllFog}
        onDeleteSelectedDarknessArea={() => {
          if (selectedDarknessAreaId) {
            deletePolygon(selectedDarknessAreaId);
          }
        }}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        particleIsEnabled={particleState.isEnabled}
        particleType={particleState.particleType}
        particleIntensity={particleState.intensity}
        particleSpeed={particleState.speed}
        onToggleParticles={toggleParticles}
        onParticleTypeChange={setParticleType}
        onParticleIntensityChange={setIntensity}
        onParticleSpeedChange={setSpeed}
        selectedTokenId={selectedTokenId}
        selectedTokenName={tokens.find(t => t.id === selectedTokenId)?.name}
        selectedTokenOpacity={tokens.find(t => t.id === selectedTokenId)?.opacity}
        tokensInLibrary={tokenLibrary.tokens}
        onSelectToken={handleSelectToken}
        onDeleteToken={handleDeleteToken}
        onDeleteAllTokens={handleDeleteAllTokens}
        onTokenNameChange={handleTokenNameChange}
        onTokenOpacityChange={handleTokenOpacityChange}
      >
        {/* Canvas container */}
        {(() => {
          const currentCanvasDimensions = getCanvasDimensions();
          return (
            <div className={isPresentationMode ? "presentation-canvas-container" : "canvas-container"}>
              <MapCanvas
                mapImage={mapImage}
                imageBounds={imageBounds}
                grid={grid}
                effects={effects}
                selectedEffectId={selectedEffectId}
                pendingEffectType={pendingEffectType}
                tokens={tokens}
                selectedTokenId={selectedTokenId}
                pendingTokenEntryId={pendingTokenEntryId}
                zoom={zoom}
                onEffectClick={handleEffectClick}
                onEffectDrag={handleEffectDrag}
                onAddEffectAtPosition={handleAddEffectAtPosition}
                onTokenClick={handleTokenClick}
                onTokenDrag={handleTokenDrag}
                onAddTokenAtPosition={handleAddTokenAtPosition}
                onImageBoundsChange={handleImageBoundsChange}
                onZoomChange={handleZoomChange}
                canvasDimensions={currentCanvasDimensions}
                fogOfWar={fogState}
                fogEditMode={isEditMode}
                fogSelectedTool={selectedTool}
                fogCurrentPolygon={currentPolygon}
                fogSelectedDarknessAreaId={selectedDarknessAreaId}
                onFogPolygonPoint={addPolygonPoint}
                onFogFinishPolygon={finishPolygon}
                onFogSelectDarknessArea={selectDarknessArea}
              />
              {/* Renderizar tokens sobre el canvas */}
              <div className="tokens-layer">
                {tokens.map((token) => {
                  const tokenEntry = getTokenById(token.tokenEntryId);
                  // Usar token_image_url desde API si está disponible, sino desde tokenEntry
                  const tokenImage = token.token_image_url || tokenEntry?.image || tokenEntry?.storage_url;
                  if (!tokenImage) return null;
                  return (
                    <TokenRenderer
                      key={token.id}
                      token={token}
                      tokenImage={tokenImage}
                      imageBounds={imageBounds}
                      canvasWidth={currentCanvasDimensions.width}
                      canvasHeight={currentCanvasDimensions.height}
                      zoom={zoom}
                      isSelected={selectedTokenId === token.id}
                      isPendingMode={!!pendingTokenEntryId}
                      onTokenClick={handleTokenClick}
                      onTokenDragStart={handleTokenDragStart}
                    />
                  );
                })}
              </div>
              {/* Renderizar efectos sobre el canvas */}
              <div className="effects-layer">
                {effects.map((effect) => (
                  <EffectRenderer
                    key={effect.id}
                    effect={effect}
                    imageBounds={imageBounds}
                    canvasWidth={currentCanvasDimensions.width}
                    canvasHeight={currentCanvasDimensions.height}
                    zoom={zoom}
                    isPresentationMode={isPresentationMode}
                  />
                ))}
              </div>
              {/* Renderizar capa de partículas */}
              <ParticleLayer
                isEnabled={particleState.isEnabled}
                particleType={particleState.particleType}
                intensity={particleState.intensity}
                speed={particleState.speed}
                canvasWidth={currentCanvasDimensions.width}
                canvasHeight={currentCanvasDimensions.height}
              />
            </div>
          );
        })()}
      </FullscreenLayout>
    </div>
  );
}

export default App;
