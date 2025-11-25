import React, { useRef, useState } from 'react';
import { MapEntry, TokenEntry } from '../types';
import { useMapLibrary } from '../hooks/useMapLibrary';
import { useTokenLibrary } from '../hooks/useTokenLibrary';
import './Header.css';

interface HeaderProps {
  onMapSelect: (map: MapEntry) => void;
  onTokenSelect?: (token: TokenEntry) => void;
  currentMapId?: string;
  onTogglePresentation?: () => void;
  onClearMap?: () => void;
  onClearAll?: () => void;
}

/**
 * Componente Header unificado con menús desplegables para Mapas y Tokens
 */
const Header: React.FC<HeaderProps> = ({
  onMapSelect,
  onTokenSelect,
  onTogglePresentation,
  onClearMap,
  onClearAll,
}) => {
  // Hooks para mapas y tokens
  const {
    library: mapLibrary,
    isLoading: mapsLoading,
    currentFolder: mapCurrentFolder,
    mapsInCurrentFolder,
    createFolder: createMapFolder,
    setCurrentFolder: setMapCurrentFolder,
    addMap,
    clearLibrary: clearMapLibrary,
    getStorageStats: getMapStats,
  } = useMapLibrary();

  const {
    library: tokenLibrary,
    isLoading: tokensLoading,
    currentFolder: tokenCurrentFolder,
    tokensInCurrentFolder,
    createFolder: createTokenFolder,
    setCurrentFolder: setTokenCurrentFolder,
    addToken,
    clearLibrary: clearTokenLibrary,
    getStorageStats: getTokenStats,
  } = useTokenLibrary();

  // Estados para menús desplegables
  const [mapsMenuOpen, setMapsMenuOpen] = useState(false);
  const [tokensMenuOpen, setTokensMenuOpen] = useState(false);
  const [mapFolderExpanded, setMapFolderExpanded] = useState(false);
  const [tokenFolderExpanded, setTokenFolderExpanded] = useState(false);

  // Estados para diálogos
  const [showNewMapFolderDialog, setShowNewMapFolderDialog] = useState(false);
  const [showNewTokenFolderDialog, setShowNewTokenFolderDialog] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddingMap, setIsAddingMap] = useState(false);
  const [isAddingToken, setIsAddingToken] = useState(false);

  const mapFileInputRef = useRef<HTMLInputElement>(null);
  const tokenFileInputRef = useRef<HTMLInputElement>(null);

  // Handlers para Mapas
  const handleCreateMapFolder = () => {
    if (newFolderName.trim()) {
      createMapFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewMapFolderDialog(false);
    }
  };

  const handleMapFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Formato no soportado. Use JPG, PNG, WEBP o GIF.');
      return;
    }

    setIsAddingMap(true);
    try {
      const newMap = await addMap(file);
      onMapSelect(newMap);
    } catch (error) {
      console.error('Error cargando mapa:', error);
      alert('Error al cargar el mapa. Intente con un archivo más pequeño.');
    } finally {
      setIsAddingMap(false);
      if (mapFileInputRef.current) {
        mapFileInputRef.current.value = '';
      }
    }
  };

  // Handlers para Tokens
  const handleCreateTokenFolder = () => {
    if (newFolderName.trim()) {
      createTokenFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewTokenFolderDialog(false);
    }
  };

  const handleTokenFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Formato no soportado. Use JPG, PNG, WEBP o GIF.');
      return;
    }

    setIsAddingToken(true);
    try {
      await addToken(file);
    } catch (error) {
      console.error('Error cargando token:', error);
      alert('Error al cargar el token. Intente con un archivo más pequeño.');
    } finally {
      setIsAddingToken(false);
      if (tokenFileInputRef.current) {
        tokenFileInputRef.current.value = '';
      }
    }
  };

  // Handler para borrar todo
  const handleClearAll = () => {
    if (window.confirm('¿Está seguro de que quiere eliminar TODOS los mapas, tokens y carpetas? Esta acción no se puede deshacer.')) {
      clearMapLibrary();
      clearTokenLibrary();
      if (onClearAll) {
        onClearAll();
      }
    }
  };

  if (mapsLoading || tokensLoading) {
    return (
      <div className="header">
        <div className="header-loading">Cargando...</div>
      </div>
    );
  }

  const mapStats = getMapStats();
  const tokenStats = getTokenStats();

  return (
    <>
      <div className="header">
        {/* Título */}
        <div className="header-title">
          <h1>Kalak'thul</h1>
        </div>

        {/* Menú Mapas */}
        <div className="header-menu">
          <button
            className="header-menu-toggle"
            onClick={() => setMapsMenuOpen(!mapsMenuOpen)}
          >
            🗺️ Mapas {mapsMenuOpen ? '▲' : '▼'}
          </button>
          {mapsMenuOpen && (
            <div className="header-menu-dropdown">
              <div className="header-menu-section">
                <button
                  className="header-menu-item"
                  onClick={() => setMapFolderExpanded(!mapFolderExpanded)}
                >
                  📁 {mapCurrentFolder?.name || 'Sin carpeta'} {mapFolderExpanded ? '▲' : '▼'}
                </button>
                {mapFolderExpanded && (
                  <div className="header-menu-submenu">
                    {mapLibrary.folders.map(folder => (
                      <button
                        key={folder.id}
                        className={`header-menu-subitem ${mapLibrary.currentFolder === folder.id ? 'active' : ''}`}
                        onClick={() => {
                          setMapCurrentFolder(folder.id);
                          setMapFolderExpanded(false);
                        }}
                      >
                        📁 {folder.name}
                        {mapsInCurrentFolder.length > 0 && mapLibrary.currentFolder === folder.id && (
                          <span className="item-count">({mapsInCurrentFolder.length})</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="header-menu-item"
                onClick={() => setShowNewMapFolderDialog(true)}
              >
                ➕ Carpeta
              </button>
              <button
                className="header-menu-item"
                onClick={() => mapFileInputRef.current?.click()}
                disabled={isAddingMap}
              >
                📤 Cargar
              </button>
              <button
                className="header-menu-item"
                onClick={() => setShowMapSelector(true)}
                disabled={mapsInCurrentFolder.length === 0}
              >
                🗺️ Mapa
              </button>
            </div>
          )}
        </div>

        {/* Menú Tokens */}
        <div className="header-menu">
          <button
            className="header-menu-toggle"
            onClick={() => setTokensMenuOpen(!tokensMenuOpen)}
          >
            🎴 Tokens {tokensMenuOpen ? '▲' : '▼'}
          </button>
          {tokensMenuOpen && (
            <div className="header-menu-dropdown">
              <div className="header-menu-section">
                <button
                  className="header-menu-item"
                  onClick={() => setTokenFolderExpanded(!tokenFolderExpanded)}
                >
                  📁 {tokenCurrentFolder?.name || 'Sin carpeta'} {tokenFolderExpanded ? '▲' : '▼'}
                </button>
                {tokenFolderExpanded && (
                  <div className="header-menu-submenu">
                    {tokenLibrary.folders.map(folder => (
                      <button
                        key={folder.id}
                        className={`header-menu-subitem ${tokenLibrary.currentFolder === folder.id ? 'active' : ''}`}
                        onClick={() => {
                          setTokenCurrentFolder(folder.id);
                          setTokenFolderExpanded(false);
                        }}
                      >
                        📁 {folder.name}
                        {tokensInCurrentFolder.length > 0 && tokenLibrary.currentFolder === folder.id && (
                          <span className="item-count">({tokensInCurrentFolder.length})</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="header-menu-item"
                onClick={() => setShowNewTokenFolderDialog(true)}
              >
                ➕ Carpeta
              </button>
              <button
                className="header-menu-item"
                onClick={() => tokenFileInputRef.current?.click()}
                disabled={isAddingToken}
              >
                📤 Cargar
              </button>
              <button
                className="header-menu-item"
                onClick={() => setShowTokenSelector(true)}
                disabled={tokensInCurrentFolder.length === 0}
              >
                🎴 Token
              </button>
            </div>
          )}
        </div>

        {/* Botones globales */}
        <button
          className="header-btn header-btn-danger"
          onClick={handleClearAll}
          disabled={mapStats.totalMaps === 0 && tokenStats.totalTokens === 0}
        >
          🗑️ Borrar Todo
        </button>

        {onClearMap && (
          <button
            className="header-btn"
            onClick={onClearMap}
          >
            🗺️ Limpiar Mapa
          </button>
        )}

        {onTogglePresentation && (
          <button
            className="header-btn header-btn-primary"
            onClick={onTogglePresentation}
          >
            🖥️ Pantalla Completa
          </button>
        )}

        <button
          className="header-btn header-btn-help"
          onClick={() => setShowHelpModal(true)}
        >
          ❓ Ayuda
        </button>

        {/* Estadísticas */}
        <div className="header-stats">
          {mapStats.totalMaps} mapas • {tokenStats.totalTokens} tokens
        </div>
      </div>

      {/* Inputs ocultos para archivos */}
      <input
        ref={mapFileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleMapFileSelect}
        style={{ display: 'none' }}
      />
      <input
        ref={tokenFileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleTokenFileSelect}
        style={{ display: 'none' }}
      />

      {/* Diálogo para nueva carpeta de mapas */}
      {showNewMapFolderDialog && (
        <div className="dialog-overlay" onClick={() => setShowNewMapFolderDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Crear Nueva Carpeta de Mapas</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nombre de la carpeta"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateMapFolder()}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={() => setShowNewMapFolderDialog(false)}>Cancelar</button>
              <button onClick={handleCreateMapFolder}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo para nueva carpeta de tokens */}
      {showNewTokenFolderDialog && (
        <div className="dialog-overlay" onClick={() => setShowNewTokenFolderDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Crear Nueva Carpeta de Tokens</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nombre de la carpeta"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateTokenFolder()}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={() => setShowNewTokenFolderDialog(false)}>Cancelar</button>
              <button onClick={handleCreateTokenFolder}>Crear</button>
            </div>
          </div>
        </div>
      )}

      {/* Selector de mapas */}
      {showMapSelector && (
        <div className="dialog-overlay" onClick={() => setShowMapSelector(false)}>
          <div className="map-selector-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Seleccionar Mapa</h3>
            <div className="map-grid">
              {mapsInCurrentFolder.map(map => (
                <div
                  key={map.id}
                  className="map-item"
                  onClick={() => {
                    onMapSelect(map);
                    setShowMapSelector(false);
                  }}
                >
                  <img src={map.thumbnail} alt={map.name} />
                  <div className="map-item-name">{map.name}</div>
                </div>
              ))}
            </div>
            <div className="dialog-buttons">
              <button onClick={() => setShowMapSelector(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Selector de tokens */}
      {showTokenSelector && (
        <div className="dialog-overlay" onClick={() => setShowTokenSelector(false)}>
          <div className="token-selector-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Seleccionar Token</h3>
            <div className="token-grid">
              {tokensInCurrentFolder.map(token => (
                <div
                  key={token.id}
                  className="token-item"
                  onClick={() => {
                    if (onTokenSelect) {
                      onTokenSelect(token);
                    }
                    setShowTokenSelector(false);
                  }}
                >
                  <img src={token.thumbnail} alt={token.name} />
                  <div className="token-item-name">{token.name}</div>
                </div>
              ))}
            </div>
            <div className="dialog-buttons">
              <button onClick={() => setShowTokenSelector(false)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de ayuda */}
      {showHelpModal && (
        <div className="dialog-overlay" onClick={() => setShowHelpModal(false)}>
          <div className="help-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>❓ Cómo usar Kalak'thul</h3>
              <button
                className="close-btn"
                onClick={() => setShowHelpModal(false)}
                title="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="help-content">
              <div className="help-section">
                <h4>🎯 Inicio</h4>
                <p>
                  Al abrir la aplicación verás una pantalla de bienvenida con la imagen de Kalak'thul. Para comenzar, carga un mapa usando el botón <strong>"📤 Cargar"</strong> en el menú Mapas.<br/>
                  <strong>Nota:</strong> En modo normal, el panel de controles lateral está oculto para una experiencia más limpia. Los controles solo aparecen en modo pantalla completa.
                </p>
              </div>

              <div className="help-section">
                <h4>🗺️ Gestión de Mapas</h4>
                <p>
                  • <strong>Cargar mapas:</strong> Usa "📤 Cargar" en el menú Mapas para subir imágenes JPG, PNG, WEBP o GIF<br/>
                  • <strong>Organizar:</strong> Crea carpetas con "➕ Carpeta" para organizar tus mapas<br/>
                  • <strong>Seleccionar:</strong> Usa "🗺️ Mapa" para elegir de mapas guardados<br/>
                  • <strong>Limpiar:</strong> "🗺️ Limpiar Mapa" para volver a la pantalla de inicio
                </p>
              </div>

              <div className="help-section">
                <h4>🎴 Gestión de Tokens</h4>
                <p>
                  • <strong>Cargar tokens:</strong> Usa "📤 Cargar" en el menú Tokens para subir imágenes de tokens<br/>
                  • <strong>Organizar:</strong> Crea carpetas (PJs, Monstruos, NPCs, Objetos) para organizar tus tokens<br/>
                  • <strong>Seleccionar:</strong> Usa "🎴 Token" para elegir un token de la librería<br/>
                  • <strong>Colocar:</strong> Haz clic y arrastra en el mapa para definir tamaño y posición del token<br/>
                  • <strong>Editar:</strong> Selecciona un token colocado para cambiar nombre y opacidad
                </p>
              </div>

              <div className="help-section">
                <h4>🎨 Grilla</h4>
                <p>
                  • Expande la sección "Grilla" en el panel izquierdo (modo pantalla completa)<br/>
                  • Configura filas y columnas según tu mapa<br/>
                  • Ajusta opacidad y color de la grilla<br/>
                  • Activa/desactiva la visibilidad
                </p>
              </div>

              <div className="help-section">
                <h4>✨ Efectos</h4>
                <p>
                  • Expande la sección "Efectos" en el panel izquierdo (modo pantalla completa)<br/>
                  • Elige un tipo de efecto (🔥 Fuego, ❄️ Hielo, ☠️ Veneno, etc.)<br/>
                  • Haz clic y arrastra en el mapa para definir tamaño y posición<br/>
                  • Selecciona efectos para editar forma, opacidad o eliminarlos<br/>
                  • "🗑️ Borrar Todos los Efectos" elimina todos de una vez
                </p>
              </div>

              <div className="help-section">
                <h4>🌑 Zonas de Oscuridad</h4>
                <p>
                  • Expande la sección "Zonas de Oscuridad" en el panel izquierdo (modo pantalla completa)<br/>
                  • Activa las zonas de oscuridad con el checkbox<br/>
                  • Haz clic en <strong>"✏️ Editar Zonas"</strong> para entrar en modo edición<br/>
                  • <strong>🌑 Añadir Oscuridad:</strong> Haz clic en varios puntos del mapa para crear un área oscura. Doble clic o Enter para finalizar<br/>
                  • <strong>👆 Seleccionar Zonas:</strong> Activa esta herramienta y haz clic en una zona existente para seleccionarla (se resaltará en azul)<br/>
                  • <strong>🗑️ Eliminar Zona Seleccionada:</strong> Aparece cuando tienes una zona seleccionada<br/>
                  • Haz clic fuera de las zonas o en la misma zona seleccionada para deseleccionar<br/>
                  • Puedes crear múltiples zonas de oscuridad y eliminarlas individualmente
                </p>
              </div>

              <div className="help-section">
                <h4>🔍 Zoom y Navegación</h4>
                <p>
                  • Usa la rueda del mouse para hacer zoom<br/>
                  • Mantén Shift + clic para panear el mapa<br/>
                  • O usa los controles en la sección "Zoom" (modo pantalla completa)<br/>
                  • "🖥️ Pantalla completa" para modo presentación
                </p>
              </div>

              <div className="help-section">
                <h4>🖥️ Modo Pantalla Completa</h4>
                <p>
                  • Haz clic en <strong>"🖥️ Pantalla completa"</strong> para entrar en modo presentación<br/>
                  • En modo pantalla completa, el panel de controles está oculto por defecto<br/>
                  • <strong>Mueve el cursor al borde izquierdo</strong> de la pantalla para mostrar el panel deslizante<br/>
                  • El panel se oculta automáticamente cuando quitas el cursor<br/>
                  • Todos los controles (Grilla, Efectos, Zonas de Oscuridad, Zoom, Partículas, Tokens) están disponibles en el panel<br/>
                  • Presiona <strong>Esc</strong> o haz clic en el botón "✕" para salir del modo presentación
                </p>
              </div>

              <div className="help-section">
                <h4>💡 Consejos</h4>
                <p>
                  • Todos los cambios se guardan automáticamente en IndexedDB<br/>
                  • Puedes tener múltiples mapas y tokens organizados en carpetas<br/>
                  • La grilla no se muestra en la pantalla de inicio<br/>
                  • En modo normal, el panel lateral está oculto para una experiencia más limpia<br/>
                  • El panel lateral solo aparece en modo pantalla completa<br/>
                  • Las zonas de oscuridad se dibujan sobre el mapa y no se pueden revelar una vez creadas<br/>
                  • Los datos se migran automáticamente desde localStorage a IndexedDB al iniciar
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;

