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
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      alert('Formato no soportado. Use JPG, PNG o WEBP.');
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
          <h1>Kalak'thuling</h1>
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
        accept="image/jpeg,image/jpg,image/png,image/webp"
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
    </>
  );
};

export default MapLibrary;
