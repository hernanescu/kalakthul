import { useState, useEffect, useCallback } from 'react';
import { TokenLibrary, TokenEntry, TokenFolder } from '../types';
import { processTokenImage, generateFolderId, getRandomFolderColor } from '../utils/imageUtils';
import { tokenDB, tokenFolderDB, migrateFromLocalStorage } from '../utils/indexedDB';

const LIBRARY_VERSION = '1.0.0';
const CURRENT_FOLDER_KEY = 'kalakthul-current-token-folder';

/**
 * Hook para manejar la librería de tokens usando IndexedDB
 */
export const useTokenLibrary = () => {
  const [library, setLibrary] = useState<TokenLibrary>({
    version: LIBRARY_VERSION,
    folders: [],
    tokens: [],
    currentFolder: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  // Cargar librería desde IndexedDB
  const loadLibrary = useCallback(async () => {
    try {
      // Migrar datos desde localStorage si es necesario
      await migrateFromLocalStorage();

      // Cargar carpetas
      let folders = await tokenFolderDB.getAll();
      
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

        await tokenFolderDB.putAll(defaultFolders);
        folders = defaultFolders;
      }

      // Cargar tokens
      const tokens = await tokenDB.getAll();

      // Obtener carpeta actual desde localStorage (preferencia del usuario)
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
  }, []);

  // Cargar librería al montar
  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Escuchar cambios en IndexedDB desde otras pestañas
  useEffect(() => {
    const handleStorageChange = () => {
      loadLibrary();
    };

    window.addEventListener('tokenLibraryUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('tokenLibraryUpdated', handleStorageChange);
    };
  }, [loadLibrary]);

  // Guardar carpeta actual en localStorage
  const saveCurrentFolder = useCallback((folderId: string) => {
    localStorage.setItem(CURRENT_FOLDER_KEY, folderId);
  }, []);

  // Crear nueva carpeta
  const createFolder = useCallback(async (name: string) => {
    const newFolder: TokenFolder = {
      id: generateFolderId(),
      name: name.trim(),
      color: getRandomFolderColor(),
      createdAt: new Date().toISOString(),
    };

    await tokenFolderDB.put(newFolder);
    
    setLibrary(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder],
    }));

    window.dispatchEvent(new Event('tokenLibraryUpdated'));
    return newFolder.id;
  }, []);

  // Cambiar carpeta activa
  const setCurrentFolder = useCallback((folderId: string) => {
    saveCurrentFolder(folderId);
    setLibrary(prev => ({
      ...prev,
      currentFolder: folderId,
    }));
  }, [saveCurrentFolder]);

  // Agregar token a carpeta
  const addToken = useCallback(async (file: File, folderId?: string) => {
    try {
      const targetFolderId = folderId || library.currentFolder;
      const tokenEntry = await processTokenImage(file);
      tokenEntry.folderId = targetFolderId;

      await tokenDB.put(tokenEntry);

      setLibrary(prev => ({
        ...prev,
        tokens: [...prev.tokens, tokenEntry],
      }));

      window.dispatchEvent(new Event('tokenLibraryUpdated'));
      return tokenEntry;
    } catch (error) {
      console.error('Error agregando token:', error);
      throw error;
    }
  }, [library.currentFolder]);

  // Eliminar token
  const deleteToken = useCallback(async (tokenId: string) => {
    await tokenDB.delete(tokenId);

    setLibrary(prev => ({
      ...prev,
      tokens: prev.tokens.filter(token => token.id !== tokenId),
    }));

    window.dispatchEvent(new Event('tokenLibraryUpdated'));
  }, []);

  // Eliminar carpeta (y mover tokens a default)
  const deleteFolder = useCallback(async (folderId: string) => {
    if (folderId === 'default') return; // No eliminar carpeta por defecto

    // Mover tokens a default
    const tokensInFolder = await tokenDB.getByFolderId(folderId);
    for (const token of tokensInFolder) {
      token.folderId = 'default';
      await tokenDB.put(token);
    }

    // Eliminar carpeta
    await tokenFolderDB.delete(folderId);

    // Recargar librería
    await loadLibrary();
    window.dispatchEvent(new Event('tokenLibraryUpdated'));
  }, [loadLibrary]);

  // Mover token a otra carpeta
  const moveToken = useCallback(async (tokenId: string, newFolderId: string) => {
    const token = await tokenDB.get(tokenId);
    if (token) {
      token.folderId = newFolderId;
      await tokenDB.put(token);

      setLibrary(prev => ({
        ...prev,
        tokens: prev.tokens.map(t => t.id === tokenId ? token : t),
      }));

      window.dispatchEvent(new Event('tokenLibraryUpdated'));
    }
  }, []);

  // Actualizar último uso de un token
  const markTokenAsUsed = useCallback(async (tokenId: string) => {
    const token = await tokenDB.get(tokenId);
    if (token) {
      token.lastUsed = new Date().toISOString();
      await tokenDB.put(token);

      setLibrary(prev => ({
        ...prev,
        tokens: prev.tokens.map(t => t.id === tokenId ? token : t),
      }));
    }
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
    const totalSize = library.tokens.reduce((sum, token) => sum + token.compressedSize, 0);
    const totalOriginalSize = library.tokens.reduce((sum, token) => sum + token.originalSize, 0);

    return {
      totalTokens,
      totalSize,
      totalOriginalSize,
      compressionRatio: totalOriginalSize > 0 ? (totalOriginalSize - totalSize) / totalOriginalSize : 0,
    };
  }, [library.tokens]);

  // Limpiar toda la librería
  const clearLibrary = useCallback(async () => {
    await tokenDB.clear();
    await tokenFolderDB.clear();

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

    await tokenFolderDB.putAll(defaultFolders);
    saveCurrentFolder('default');

    setLibrary({
      version: LIBRARY_VERSION,
      folders: defaultFolders,
      tokens: [],
      currentFolder: 'default',
    });

    window.dispatchEvent(new Event('tokenLibraryUpdated'));
  }, [saveCurrentFolder]);

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
