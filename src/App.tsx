import { useState, useRef, useEffect, useCallback } from 'react';
import { useGrid } from './hooks/useGrid';
import { useTokens } from './hooks/useTokens';
import { loadImageAsBase64 } from './utils/canvasUtils';
import { snapToGrid } from './utils/gridUtils';
import { MapState, ImageBounds } from './types';
import MapCanvas from './components/MapCanvas';
import GridControls from './components/GridControls';
import TokenControls from './components/TokenControls';
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
      if (saved) {
        const parsed = JSON.parse(saved) as MapState;
        setInitialState(parsed);
      }
      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading from localStorage:', error);
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

  const [mapImage, setMapImage] = useState<string | null>(initialState?.mapImage || null);
  const [imageBounds, setImageBounds] = useState<ImageBounds | null>(initialState?.imageBounds || null);

  // Sincronizar mapImage y imageBounds cuando se carga el estado inicial
  useEffect(() => {
    if (initialState?.mapImage) {
      setMapImage(initialState.mapImage);
    }
    if (initialState?.imageBounds) {
      setImageBounds(initialState.imageBounds);
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

  const handleTokenClick = (tokenId: string) => {
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
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [mapImage, imageBounds, grid, tokens, selectedTokenId, isInitialized]);

  const selectedToken = tokens.find((t) => t.id === selectedTokenId) || null;

  // Memoizar el callback para evitar re-renders innecesarios
  const handleImageBoundsChange = useCallback((bounds: ImageBounds | null) => {
    setImageBounds(bounds);
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
            <h1>Mapa TTRPG</h1>
            <button onClick={() => fileInputRef.current?.click()} className="load-map-btn">
              Cargar Mapa
            </button>
            <button onClick={togglePresentationMode} className="presentation-btn">
              Modo Presentación
            </button>
          </div>

          <GridControls
            grid={grid}
            onRowsChange={setRows}
            onColumnsChange={setColumns}
            onOpacityChange={setOpacity}
            onColorChange={setColor}
            onToggleVisibility={toggleVisibility}
          />

          <TokenControls
            selectedToken={selectedToken}
            onColorChange={handleColorChange}
            onSizeChange={handleSizeChange}
            onDelete={handleDeleteToken}
            onAddToken={handleAddToken}
          />
        </div>
      )}

      <div className="canvas-container">
        <MapCanvas
          mapImage={mapImage}
          imageBounds={imageBounds}
          grid={grid}
          tokens={tokens}
          selectedTokenId={selectedTokenId}
          onTokenClick={handleTokenClick}
          onTokenDrag={handleTokenDrag}
          onImageBoundsChange={handleImageBoundsChange}
          canvasDimensions={canvasDimensions}
        />
        {isPresentationMode && (
          <button
            onClick={togglePresentationMode}
            className="exit-presentation-btn"
            title="Salir del modo presentación (Esc)"
          >
            ✕
          </button>
        )}
      </div>
    </div>
  );
}

export default App;
