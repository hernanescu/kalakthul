import React, { useRef, useState } from 'react';
import { MapEntry, MapFolder } from '../types';
import { useMapLibrary } from '../hooks/useMapLibrary';
import { formatFileSize } from '../utils/imageUtils';
import './MapLibrary.css';

interface MapLibraryProps {
  onMapSelect: (map: MapEntry) => void;
  currentMapId?: string;
  onTogglePresentation?: () => void;
  onClearMap?: () => void;
}

/**
 * Componente principal de la librería de mapas (header horizontal)
 */
const MapLibrary: React.FC<MapLibraryProps> = ({ onMapSelect, currentMapId, onTogglePresentation, onClearMap }) => {
  const {
    library,
    isLoading,
    currentFolder,
    mapsInCurrentFolder,
    createFolder,
    setCurrentFolder,
    addMap,
    deleteMap,
    deleteFolder,
    clearLibrary,
    getStorageStats,
  } = useMapLibrary();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddingMap, setIsAddingMap] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crear nueva carpeta
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderDialog(false);
    }
  };

  // Cargar mapa
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert('Formato no soportado. Use JPG, PNG, WEBP o GIF.');
      return;
    }

    // Nota: Sin límite de tamaño para mapas

    setIsAddingMap(true);
    try {
      const newMap = await addMap(file);
      // Seleccionar automáticamente el mapa recién cargado
      onMapSelect(newMap);
    } catch (error) {
      console.error('Error cargando mapa:', error);
      alert('Error al cargar el mapa. Intente con un archivo más pequeño.');
    } finally {
      setIsAddingMap(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };


  // Limpiar librería
  const handleClear = () => {
    if (window.confirm('¿Está seguro de que quiere eliminar todos los mapas y carpetas? Esta acción no se puede deshacer.')) {
      clearLibrary();
    }
  };

  if (isLoading) {
    return (
      <div className="map-library-header">
        <div className="map-library-loading">Cargando librería...</div>
      </div>
    );
  }

  const stats = getStorageStats();

  return (
    <>
      {/* Header principal */}
      <div className="map-library-header">
        {/* Título de la aplicación */}
        <div className="app-title">
          <h1>Kalak'thul</h1>
        </div>

        {/* Selector de carpeta */}
        <div className="folder-selector">
          <button
            className="folder-selector-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            📁 {currentFolder?.name || 'Sin carpeta'} ▼
          </button>
          {isExpanded && (
            <div className="folder-dropdown">
              {library.folders.map(folder => (
                <button
                  key={folder.id}
                  className={`folder-option ${folder.id === library.currentFolder ? 'active' : ''}`}
                  onClick={() => {
                    setCurrentFolder(folder.id);
                    setIsExpanded(false);
                  }}
                  style={{ '--folder-color': folder.color } as React.CSSProperties}
                >
                  📁 {folder.name}
                  {mapsInCurrentFolder.length > 0 && folder.id === library.currentFolder && (
                    <span className="map-count">({mapsInCurrentFolder.length})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción en línea */}
        <button
          className="action-btn"
          onClick={() => setShowNewFolderDialog(true)}
          title="Crear nueva carpeta"
        >
          ➕ Carpeta
        </button>

        <button
          className="action-btn"
          onClick={() => setShowMapSelector(true)}
          disabled={mapsInCurrentFolder.length === 0}
          title="Seleccionar mapa de la librería"
        >
          🖼️ Mapa
        </button>

        <button
          className="action-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAddingMap}
          title="Cargar nuevo mapa"
        >
          📤 Cargar
        </button>

        <button
          className="action-btn danger"
          onClick={handleClear}
          disabled={library.maps.length === 0}
          title="Limpiar toda la librería"
        >
          🗑️ Limpiar
        </button>

        <button
          className="action-btn"
          onClick={onClearMap}
          disabled={false}
          title="Limpiar mapa actual"
        >
          🗺️ Limpiar Mapa
        </button>

        <button
          className="action-btn danger"
          onClick={onTogglePresentation}
          disabled={false}
          title="Modo pantalla completa"
          style={{
            background: '#4a7c4a',
            borderColor: '#5a8c5a'
          }}
        >
          🖥️ Pantalla completa
        </button>

        {/* Botón de Ayuda */}
        <button
          className="action-btn"
          onClick={() => setShowHelpModal(true)}
          disabled={false}
          title="Ayuda - Cómo usar la aplicación"
          style={{
            background: '#6a7c9a',
            borderColor: '#7a8caa'
          }}
        >
          ❓ Ayuda
        </button>

        {/* Estadísticas al final */}
        <div className="storage-stats">
          {stats.totalMaps} mapas • {formatFileSize(stats.totalSize)}
        </div>

        {/* Información simple de mapas */}
        {mapsInCurrentFolder.length > 0 && (
          <div className="map-info-simple">
            {mapsInCurrentFolder.length} mapa{mapsInCurrentFolder.length !== 1 ? 's' : ''} en esta carpeta
          </div>
        )}
      </div>

      {/* Input oculto para archivos */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />

      {/* Dialog para nueva carpeta */}
      {showNewFolderDialog && (
        <div className="dialog-overlay" onClick={() => setShowNewFolderDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Crear Nueva Carpeta</h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Nombre de la carpeta"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateFolder()}
              autoFocus
            />
            <div className="dialog-buttons">
              <button onClick={() => setShowNewFolderDialog(false)}>Cancelar</button>
              <button onClick={handleCreateFolder} disabled={!newFolderName.trim()}>
                Crear
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal selector de mapas */}
      {showMapSelector && (
        <div className="dialog-overlay" onClick={() => setShowMapSelector(false)}>
          <div className="map-selector-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Seleccionar Mapa - {currentFolder?.name}</h3>
              <button
                className="close-btn"
                onClick={() => setShowMapSelector(false)}
                title="Cerrar"
              >
                ×
              </button>
            </div>
            <div className="map-grid">
              {mapsInCurrentFolder.map(map => (
                <div
                  key={map.id}
                  className={`map-selector-item ${map.id === currentMapId ? 'selected' : ''}`}
                  onClick={() => {
                    onMapSelect(map);
                    setShowMapSelector(false);
                  }}
                >
                  <div className="map-thumbnail">
                    <img src={map.thumbnail} alt={map.name} />
                  </div>
                  <div className="map-name">{map.name}</div>
                  <div className="map-size">
                    {map.dimensions.width}×{map.dimensions.height}
                  </div>
                  <button
                    className="delete-map-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm(`¿Eliminar "${map.name}"?`)) {
                        deleteMap(map.id);
                      }
                    }}
                    title="Eliminar mapa"
                  >
                    🗑️
                  </button>
                </div>
              ))}
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
                  Al abrir la aplicación verás una pantalla de bienvenida con la imagen de Kalak'thul. Para comenzar, carga un mapa usando el botón <strong>"📤 Cargar"</strong> en la parte superior.<br/>
                  <strong>Nota:</strong> En modo normal, el panel de controles lateral está oculto para una experiencia más limpia. Los controles solo aparecen en modo pantalla completa.
                </p>
              </div>

              <div className="help-section">
                <h4>🗺️ Gestión de Mapas</h4>
                <p>
                  • <strong>Cargar mapas:</strong> Usa "📤 Cargar" para subir imágenes JPG, PNG o WEBP<br/>
                  • <strong>Organizar:</strong> Crea carpetas con "➕ Carpeta" para organizar tus mapas<br/>
                  • <strong>Seleccionar:</strong> Usa "🖼️ Mapa" para elegir de mapas guardados<br/>
                  • <strong>Limpiar:</strong> "🗺️ Limpiar Mapa" para volver a la pantalla de inicio
                </p>
              </div>

              <div className="help-section">
                <h4>🎨 Grilla</h4>
                <p>
                  • Expande la sección "Grilla" en el panel izquierdo<br/>
                  • Configura filas y columnas según tu mapa<br/>
                  • Ajusta opacidad y color de la grilla<br/>
                  • Activa/desactiva la visibilidad
                </p>
              </div>

              <div className="help-section">
                <h4>✨ Efectos</h4>
                <p>
                  • Expande la sección "Efectos" en el panel izquierdo<br/>
                  • Elige un tipo de efecto (🔥 Fuego, ❄️ Hielo, ☠️ Veneno, etc.)<br/>
                  • Haz clic y arrastra en el mapa para definir tamaño y posición<br/>
                  • Selecciona efectos para editar forma, opacidad o eliminarlos<br/>
                  • "🗑️ Borrar Todos los Efectos" elimina todos de una vez
                </p>
              </div>

              <div className="help-section">
                <h4>🌑 Zonas de Oscuridad</h4>
                <p>
                  • Expande la sección "Zonas de Oscuridad" en el panel izquierdo<br/>
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
                  • O usa los controles en la sección "Zoom"<br/>
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
                  • Todos los controles (Grilla, Efectos, Zonas de Oscuridad, Zoom) están disponibles en el panel<br/>
                  • Presiona <strong>Esc</strong> o haz clic en el botón "✕" para salir del modo presentación
                </p>
              </div>

              <div className="help-section">
                <h4>💡 Consejos</h4>
                <p>
                  • Todos los cambios se guardan automáticamente<br/>
                  • Puedes tener múltiples mapas organizados en carpetas<br/>
                  • La grilla no se muestra en la pantalla de inicio<br/>
                  • En modo normal, el panel lateral está oculto para una experiencia más limpia<br/>
                  • El panel lateral solo aparece en modo pantalla completa<br/>
                  • Las zonas de oscuridad se dibujan sobre el mapa y no se pueden revelar una vez creadas
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MapLibrary;
