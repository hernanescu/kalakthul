import { useState, useEffect, useCallback } from 'react';
import { TokenLibrary, TokenEntry, TokenFolder } from '../types';
import { generateFolderId, getRandomFolderColor } from '../utils/imageUtils';
import { assetsApi } from '../api/assets';
import { Asset } from '../api/assets';

const LIBRARY_VERSION = '1.0.0';
const CURRENT_FOLDER_KEY = 'kalakthul-current-token-folder';
const FOLDERS_KEY = 'kalakthul-token-folders';

/**
 * Hook para manejar la librería de tokens usando API
 */
export const useTokenLibrary = () => {
  const [library, setLibrary] = useState<TokenLibrary>({
    version: LIBRARY_VERSION,
    folders: [],
    tokens: [],
    currentFolder: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  // Cargar carpetas desde localStorage (solo UI, no se persisten en backend)
  const loadFolders = useCallback((): TokenFolder[] => {
    try {
      const stored = localStorage.getItem(FOLDERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
    
    // Carpetas por defecto
    return [
      {
        id: 'default',
        name: 'PJs',
        color: '#3B82F6',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'monsters',
        name: 'Monstruos',
        color: '#EF4444',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'npcs',
        name: 'NPCs',
        color: '#10B981',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'objects',
        name: 'Objetos',
        color: '#F59E0B',
        createdAt: new Date().toISOString(),
      },
    ];
  }, []);

  // Guardar carpetas en localStorage
  const saveFolders = useCallback((folders: TokenFolder[]) => {
    try {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  }, []);

  // Convertir Asset de API a TokenEntry
  const assetToTokenEntry = useCallback((asset: Asset): TokenEntry => {
    return {
      id: asset.id,
      name: asset.name || 'Unnamed Token',
      folderId: asset.folder_id || 'default',
      thumbnail: asset.thumbnail_url || '',
      image: asset.storage_url, // Usar storage_url como image
      originalSize: asset.original_size || 0,
      compressedSize: asset.compressed_size || 0,
      dimensions: asset.dimensions || { width: 0, height: 0 },
      uploadDate: asset.created_at,
      lastUsed: asset.last_used,
      storage_url: asset.storage_url,
      thumbnail_url: asset.thumbnail_url,
    };
  }, []);

  // Cargar librería desde API
  const loadLibrary = useCallback(async () => {
    try {
      // Cargar carpetas desde localStorage
      let folders = loadFolders();
      
      // Si no hay carpetas, crear carpetas por defecto
      if (folders.length === 0) {
        const defaultFolders: TokenFolder[] = [
          {
            id: 'default',
            name: 'PJs',
            color: '#3B82F6',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'monsters',
            name: 'Monstruos',
            color: '#EF4444',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'npcs',
            name: 'NPCs',
            color: '#10B981',
            createdAt: new Date().toISOString(),
          },
          {
            id: 'objects',
            name: 'Objetos',
            color: '#F59E0B',
            createdAt: new Date().toISOString(),
          },
        ];
        folders = defaultFolders;
        saveFolders(folders);
      }

      // Cargar tokens desde API
      const assets = await assetsApi.getAll('token');
      const tokens = assets.map(assetToTokenEntry);

      // Obtener carpeta actual desde localStorage
      let currentFolder = localStorage.getItem(CURRENT_FOLDER_KEY) || 'default';
      if (!folders.find(f => f.id === currentFolder)) {
        currentFolder = 'default';
      }

      setLibrary({
        version: LIBRARY_VERSION,
        folders,
        tokens,
        currentFolder,
      });
    } catch (error) {
      console.error('Error cargando librería de tokens:', error);
      // En caso de error, usar librería con carpetas por defecto
      const defaultFolders: TokenFolder[] = [
        {
          id: 'default',
          name: 'PJs',
          color: '#3B82F6',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'monsters',
          name: 'Monstruos',
          color: '#EF4444',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'npcs',
          name: 'NPCs',
          color: '#10B981',
          createdAt: new Date().toISOString(),
        },
        {
          id: 'objects',
          name: 'Objetos',
          color: '#F59E0B',
          createdAt: new Date().toISOString(),
        },
      ];

      setLibrary({
        version: LIBRARY_VERSION,
        folders: defaultFolders,
        tokens: [],
        currentFolder: 'default',
      });
    } finally {
      setIsLoading(false);
    }
  }, [loadFolders, saveFolders, assetToTokenEntry]);

  // Cargar librería al montar
  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Guardar carpeta actual en localStorage
  const saveCurrentFolder = useCallback((folderId: string) => {
    localStorage.setItem(CURRENT_FOLDER_KEY, folderId);
  }, []);

  // Crear nueva carpeta (solo en localStorage)
  const createFolder = useCallback(async (name: string) => {
    const newFolder: TokenFolder = {
      id: generateFolderId(),
      name: name.trim(),
      color: getRandomFolderColor(),
      createdAt: new Date().toISOString(),
    };

    const folders = loadFolders();
    folders.push(newFolder);
    saveFolders(folders);
    
    setLibrary(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder],
    }));

    return newFolder.id;
  }, [loadFolders, saveFolders]);

  // Cambiar carpeta activa
  const setCurrentFolder = useCallback((folderId: string) => {
    saveCurrentFolder(folderId);
    setLibrary(prev => ({
      ...prev,
      currentFolder: folderId,
    }));
  }, [saveCurrentFolder]);

  // Agregar token (subir a API)
  const addToken = useCallback(async (file: File, folderId?: string) => {
    try {
      const targetFolderId = folderId || library.currentFolder;
      
      // Subir a API
      const asset = await assetsApi.upload(file, 'token', targetFolderId, file.name.replace(/\.[^/.]+$/, ''));
      
      // Convertir a TokenEntry
      const tokenEntry = assetToTokenEntry(asset);

      setLibrary(prev => ({
        ...prev,
        tokens: [...prev.tokens, tokenEntry],
      }));

      return tokenEntry;
    } catch (error) {
      console.error('Error agregando token:', error);
      throw error;
    }
  }, [library.currentFolder, assetToTokenEntry]);

  // Eliminar token
  const deleteToken = useCallback(async (tokenId: string) => {
    try {
      await assetsApi.delete(tokenId);

      setLibrary(prev => ({
        ...prev,
        tokens: prev.tokens.filter(token => token.id !== tokenId),
      }));
    } catch (error) {
      console.error('Error eliminando token:', error);
      throw error;
    }
  }, []);

  // Eliminar carpeta (y mover tokens a default)
  const deleteFolder = useCallback(async (folderId: string) => {
    if (folderId === 'default') return; // No eliminar carpeta por defecto

    // Mover tokens a default (solo en estado local por ahora)
    // TODO: Agregar endpoint para actualizar folder_id de assets

    // Eliminar carpeta de localStorage
    const folders = loadFolders().filter(f => f.id !== folderId);
    saveFolders(folders);

    // Actualizar tokens localmente
    setLibrary(prev => ({
      ...prev,
      folders,
      tokens: prev.tokens.map(token => 
        token.folderId === folderId ? { ...token, folderId: 'default' } : token
      ),
    }));
  }, [library.tokens, loadFolders, saveFolders]);

  // Mover token a otra carpeta
  const moveToken = useCallback(async (tokenId: string, newFolderId: string) => {
    // Actualizar solo en estado local por ahora
    // TODO: Agregar endpoint para actualizar folder_id
    setLibrary(prev => ({
      ...prev,
      tokens: prev.tokens.map(t => 
        t.id === tokenId ? { ...t, folderId: newFolderId } : t
      ),
    }));
  }, []);

  // Actualizar último uso de un token (no se persiste en backend por ahora)
  const markTokenAsUsed = useCallback(async (tokenId: string) => {
    setLibrary(prev => ({
      ...prev,
      tokens: prev.tokens.map(t => 
        t.id === tokenId ? { ...t, lastUsed: new Date().toISOString() } : t
      ),
    }));
  }, []);

  // Obtener tokens de una carpeta
  const getTokensInFolder = useCallback((folderId: string) => {
    return library.tokens
      .filter(token => token.folderId === folderId)
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
  }, [library.tokens]);

  // Obtener carpeta por ID
  const getFolderById = useCallback((folderId: string) => {
    return library.folders.find(folder => folder.id === folderId);
  }, [library.folders]);

  // Obtener token por ID
  const getTokenById = useCallback((tokenId: string) => {
    return library.tokens.find(token => token.id === tokenId);
  }, [library.tokens]);

  // Calcular estadísticas de storage
  const getStorageStats = useCallback(() => {
    const totalTokens = library.tokens.length;
    const totalSize = library.tokens.reduce((sum, token) => sum + (token.compressedSize || 0), 0);
    const totalOriginalSize = library.tokens.reduce((sum, token) => sum + (token.originalSize || 0), 0);

    return {
      totalTokens,
      totalSize,
      totalOriginalSize,
      compressionRatio: totalOriginalSize > 0 ? (totalOriginalSize - totalSize) / totalOriginalSize : 0,
    };
  }, [library.tokens]);

  // Limpiar toda la librería
  const clearLibrary = useCallback(async () => {
    // Eliminar todos los tokens de la API
    for (const token of library.tokens) {
      try {
        await assetsApi.delete(token.id);
      } catch (error) {
        console.error(`Error eliminando token ${token.id}:`, error);
      }
    }

    // Resetear carpetas
    const defaultFolders: TokenFolder[] = [
      {
        id: 'default',
        name: 'PJs',
        color: '#3B82F6',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'monsters',
        name: 'Monstruos',
        color: '#EF4444',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'npcs',
        name: 'NPCs',
        color: '#10B981',
        createdAt: new Date().toISOString(),
      },
      {
        id: 'objects',
        name: 'Objetos',
        color: '#F59E0B',
        createdAt: new Date().toISOString(),
      },
    ];

    saveFolders(defaultFolders);
    saveCurrentFolder('default');

    setLibrary({
      version: LIBRARY_VERSION,
      folders: defaultFolders,
      tokens: [],
      currentFolder: 'default',
    });
  }, [library.tokens, saveFolders, saveCurrentFolder]);

  return {
    library,
    isLoading,
    currentFolder: getFolderById(library.currentFolder),
    tokensInCurrentFolder: getTokensInFolder(library.currentFolder),

    // Acciones
    createFolder,
    setCurrentFolder,
    addToken,
    deleteToken,
    deleteFolder,
    moveToken,
    markTokenAsUsed,

    // Utilidades
    getStorageStats,
    clearLibrary,

    // Getters
    getTokensInFolder,
    getFolderById,
    getTokenById,
  };
};
