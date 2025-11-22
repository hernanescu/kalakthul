import { useState, useEffect, useCallback } from 'react';
import { TokenLibrary, TokenEntry, TokenFolder } from '../types';
import { processTokenImage, generateFolderId, getRandomFolderColor } from '../utils/imageUtils';

const LIBRARY_KEY = 'kalakthuling-token-library';
const LIBRARY_VERSION = '1.0.0';

/**
 * Hook para manejar la librería de tokens
 */
export const useTokenLibrary = () => {
  const [library, setLibrary] = useState<TokenLibrary>({
    version: LIBRARY_VERSION,
    folders: [],
    tokens: [],
    currentFolder: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  // Función para cargar librería desde localStorage
  const loadLibrary = useCallback(() => {
    try {
      const saved = localStorage.getItem(LIBRARY_KEY);
      if (saved) {
        const parsedLibrary: TokenLibrary = JSON.parse(saved);

        // Crear carpeta por defecto si no existe
        if (parsedLibrary.folders.length === 0) {
          const defaultFolder: TokenFolder = {
            id: 'default',
            name: 'PJs',
            color: '#3B82F6',
            createdAt: new Date().toISOString(),
          };
          parsedLibrary.folders = [defaultFolder];
          parsedLibrary.currentFolder = 'default';
        }

        setLibrary(parsedLibrary);
      } else {
        // Inicializar con carpetas por defecto
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

        const initialLibrary: TokenLibrary = {
          version: LIBRARY_VERSION,
          folders: defaultFolders,
          tokens: [],
          currentFolder: 'default',
        };

        setLibrary(initialLibrary);
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(initialLibrary));
      }
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

  // Cargar librería desde localStorage al montar
  useEffect(() => {
    loadLibrary();
  }, [loadLibrary]);

  // Escuchar cambios en localStorage desde otras pestañas/instancias
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === LIBRARY_KEY && e.newValue) {
        try {
          const parsedLibrary: TokenLibrary = JSON.parse(e.newValue);
          setLibrary(parsedLibrary);
        } catch (error) {
          console.error('Error sincronizando librería de tokens:', error);
        }
      }
    };

    // También escuchar eventos personalizados para cambios en la misma pestaña
    const handleCustomStorageChange = () => {
      loadLibrary();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('tokenLibraryUpdated', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('tokenLibraryUpdated', handleCustomStorageChange);
    };
  }, [loadLibrary]);

  // Guardar librería en localStorage
  const saveLibrary = useCallback((newLibrary: TokenLibrary) => {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLibrary));
      setLibrary(newLibrary);
      // Disparar evento personalizado para sincronizar otras instancias del hook
      window.dispatchEvent(new Event('tokenLibraryUpdated'));
    } catch (error) {
      console.error('Error guardando librería de tokens:', error);
    }
  }, []);

  // Crear nueva carpeta
  const createFolder = useCallback((name: string) => {
    const newFolder: TokenFolder = {
      id: generateFolderId(),
      name: name.trim(),
      color: getRandomFolderColor(),
      createdAt: new Date().toISOString(),
    };

    const updatedLibrary = {
      ...library,
      folders: [...library.folders, newFolder],
    };

    saveLibrary(updatedLibrary);
    return newFolder.id;
  }, [library, saveLibrary]);

  // Cambiar carpeta activa
  const setCurrentFolder = useCallback((folderId: string) => {
    const updatedLibrary = {
      ...library,
      currentFolder: folderId,
    };
    saveLibrary(updatedLibrary);
  }, [library, saveLibrary]);

  // Agregar token a carpeta
  const addToken = useCallback(async (file: File, folderId?: string) => {
    try {
      const targetFolderId = folderId || library.currentFolder;
      const tokenEntry = await processTokenImage(file);
      tokenEntry.folderId = targetFolderId;

      const updatedLibrary = {
        ...library,
        tokens: [...library.tokens, tokenEntry],
      };

      saveLibrary(updatedLibrary);
      return tokenEntry;
    } catch (error) {
      console.error('Error agregando token:', error);
      throw error;
    }
  }, [library, saveLibrary]);

  // Eliminar token
  const deleteToken = useCallback((tokenId: string) => {
    const updatedLibrary = {
      ...library,
      tokens: library.tokens.filter(token => token.id !== tokenId),
    };
    saveLibrary(updatedLibrary);
  }, [library, saveLibrary]);

  // Eliminar carpeta (y mover tokens a default)
  const deleteFolder = useCallback((folderId: string) => {
    if (folderId === 'default') return; // No eliminar carpeta por defecto

    const updatedTokens = library.tokens.map(token =>
      token.folderId === folderId ? { ...token, folderId: 'default' } : token
    );

    const updatedLibrary = {
      ...library,
      folders: library.folders.filter(folder => folder.id !== folderId),
      tokens: updatedTokens,
      currentFolder: library.currentFolder === folderId ? 'default' : library.currentFolder,
    };

    saveLibrary(updatedLibrary);
  }, [library, saveLibrary]);

  // Mover token a otra carpeta
  const moveToken = useCallback((tokenId: string, newFolderId: string) => {
    const updatedTokens = library.tokens.map(token =>
      token.id === tokenId ? { ...token, folderId: newFolderId } : token
    );

    const updatedLibrary = {
      ...library,
      tokens: updatedTokens,
    };

    saveLibrary(updatedLibrary);
  }, [library, saveLibrary]);

  // Actualizar último uso de un token
  const markTokenAsUsed = useCallback((tokenId: string) => {
    const updatedTokens = library.tokens.map(token =>
      token.id === tokenId
        ? { ...token, lastUsed: new Date().toISOString() }
        : token
    );

    const updatedLibrary = {
      ...library,
      tokens: updatedTokens,
    };

    saveLibrary(updatedLibrary);
  }, [library, saveLibrary]);

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
  const clearLibrary = useCallback(() => {
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

    const emptyLibrary: TokenLibrary = {
      version: LIBRARY_VERSION,
      folders: defaultFolders,
      tokens: [],
      currentFolder: 'default',
    };

    saveLibrary(emptyLibrary);
  }, [saveLibrary]);

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

