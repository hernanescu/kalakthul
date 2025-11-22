import React, { useRef, useState } from 'react';
import { TokenEntry, TokenFolder } from '../types';
import { useTokenLibrary } from '../hooks/useTokenLibrary';
import { formatFileSize } from '../utils/imageUtils';
import './TokenLibrary.css';

interface TokenLibraryProps {
  onTokenSelect?: (token: TokenEntry) => void;
}

/**
 * Componente de la librería de tokens (header horizontal)
 */
const TokenLibrary: React.FC<TokenLibraryProps> = ({ onTokenSelect }) => {
  const {
    library,
    isLoading,
    currentFolder,
    tokensInCurrentFolder,
    createFolder,
    setCurrentFolder,
    addToken,
    deleteToken,
    deleteFolder,
    clearLibrary,
    getStorageStats,
  } = useTokenLibrary();

  const [isExpanded, setIsExpanded] = useState(false);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [showTokenSelector, setShowTokenSelector] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isAddingToken, setIsAddingToken] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Crear nueva carpeta
  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      createFolder(newFolderName.trim());
      setNewFolderName('');
      setShowNewFolderDialog(false);
    }
  };

  // Cargar token
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Limpiar librería
  const handleClear = () => {
    if (window.confirm('¿Está seguro de que quiere eliminar todos los tokens y carpetas? Esta acción no se puede deshacer.')) {
      clearLibrary();
    }
  };

  if (isLoading) {
    return (
      <div className="token-library-header">
        <div className="token-library-loading">Cargando librería...</div>
      </div>
    );
  }

  const stats = getStorageStats();

  return (
    <>
      {/* Header principal */}
      <div className="token-library-header">
        {/* Título */}
        <div className="token-library-title">
          <h2>🎴 Tokens</h2>
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
                  {tokensInCurrentFolder.length > 0 && folder.id === library.currentFolder && (
                    <span className="token-count">({tokensInCurrentFolder.length})</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Botones de acción */}
        <button
          className="action-btn"
          onClick={() => setShowNewFolderDialog(true)}
          title="Crear nueva carpeta"
        >
          ➕ Carpeta
        </button>

        <button
          className="action-btn"
          onClick={() => setShowTokenSelector(true)}
          disabled={tokensInCurrentFolder.length === 0}
          title="Seleccionar token de la librería"
        >
          🎴 Token
        </button>

        <button
          className="action-btn"
          onClick={() => fileInputRef.current?.click()}
          disabled={isAddingToken}
          title="Cargar nuevo token"
        >
          📤 Cargar
        </button>

        <button
          className="action-btn danger"
          onClick={handleClear}
          disabled={library.tokens.length === 0}
          title="Limpiar toda la librería"
        >
          🗑️ Limpiar
        </button>

        {/* Estadísticas */}
        <div className="storage-stats">
          {stats.totalTokens} tokens • {formatFileSize(stats.totalSize)}
        </div>
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
              <button onClick={handleCreateFolder}>Crear</button>
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
    </>
  );
};

export default TokenLibrary;

