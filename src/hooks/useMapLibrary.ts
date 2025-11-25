import { useState, useEffect, useCallback } from 'react';
import { MapLibrary, MapEntry, MapFolder } from '../types';
import { processMapImage, generateFolderId, getRandomFolderColor } from '../utils/imageUtils';
import { mapDB, mapFolderDB, migrateFromLocalStorage } from '../utils/indexedDB';

const LIBRARY_VERSION = '1.0.0';
const CURRENT_FOLDER_KEY = 'kalakthul-current-map-folder';

/**
 * Hook para manejar la librería de mapas usando IndexedDB
 */
export const useMapLibrary = () => {
  const [library, setLibrary] = useState<MapLibrary>({
    version: LIBRARY_VERSION,
    folders: [],
    maps: [],
    currentFolder: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  // Cargar librería desde IndexedDB
  const loadLibrary = useCallback(async () => {
    try {
      // Migrar datos desde localStorage si es necesario
      await migrateFromLocalStorage();

      // Cargar carpetas
      let folders = await mapFolderDB.getAll();
      
      // Si no hay carpetas, crear carpeta por defecto
      if (folders.length === 0) {
        const defaultFolder: MapFolder = {
          id: 'default',
          name: 'Mapas',
          color: '#3B82F6',
          createdAt: new Date().toISOString(),
        };
        await mapFolderDB.put(defaultFolder);
        folders = [defaultFolder];
      }

      // Cargar mapas
      const maps = await mapDB.getAll();

      // Obtener carpeta actual desde localStorage (preferencia del usuario)
      let currentFolder = localStorage.getItem(CURRENT_FOLDER_KEY) || 'default';
      if (!folders.find(f => f.id === currentFolder)) {
        currentFolder = 'default';
      }

      setLibrary({
        version: LIBRARY_VERSION,
        folders,
        maps,
        currentFolder,
      });
    } catch (error) {
      console.error('Error cargando librería de mapas:', error);
      // En caso de error, usar librería vacía con carpeta por defecto
      const defaultFolder: MapFolder = {
        id: 'default',
        name: 'Mapas',
        color: '#3B82F6',
        createdAt: new Date().toISOString(),
      };

      setLibrary({
        version: LIBRARY_VERSION,
        folders: [defaultFolder],
        maps: [],
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

    window.addEventListener('mapLibraryUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('mapLibraryUpdated', handleStorageChange);
    };
  }, [loadLibrary]);

  // Guardar carpeta actual en localStorage
  const saveCurrentFolder = useCallback((folderId: string) => {
    localStorage.setItem(CURRENT_FOLDER_KEY, folderId);
  }, []);

  // Crear nueva carpeta
  const createFolder = useCallback(async (name: string) => {
    const newFolder: MapFolder = {
      id: generateFolderId(),
      name: name.trim(),
      color: getRandomFolderColor(),
      createdAt: new Date().toISOString(),
    };

    await mapFolderDB.put(newFolder);
    
    setLibrary(prev => ({
      ...prev,
      folders: [...prev.folders, newFolder],
    }));

    window.dispatchEvent(new Event('mapLibraryUpdated'));
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

  // Agregar mapa a carpeta
  const addMap = useCallback(async (file: File, folderId?: string) => {
    try {
      const targetFolderId = folderId || library.currentFolder;
      const mapEntry = await processMapImage(file);
      mapEntry.folderId = targetFolderId;

      await mapDB.put(mapEntry);

      setLibrary(prev => ({
        ...prev,
        maps: [...prev.maps, mapEntry],
      }));

      window.dispatchEvent(new Event('mapLibraryUpdated'));
      return mapEntry;
    } catch (error) {
      console.error('Error agregando mapa:', error);
      throw error;
    }
  }, [library.currentFolder]);

  // Eliminar mapa
  const deleteMap = useCallback(async (mapId: string) => {
    await mapDB.delete(mapId);

    setLibrary(prev => ({
      ...prev,
      maps: prev.maps.filter(map => map.id !== mapId),
    }));

    window.dispatchEvent(new Event('mapLibraryUpdated'));
  }, []);

  // Eliminar carpeta (y mover mapas a default)
  const deleteFolder = useCallback(async (folderId: string) => {
    if (folderId === 'default') return; // No eliminar carpeta por defecto

    // Mover mapas a default
    const mapsInFolder = await mapDB.getByFolderId(folderId);
    for (const map of mapsInFolder) {
      map.folderId = 'default';
      await mapDB.put(map);
    }

    // Eliminar carpeta
    await mapFolderDB.delete(folderId);

    // Recargar librería
    await loadLibrary();
    window.dispatchEvent(new Event('mapLibraryUpdated'));
  }, [loadLibrary]);

  // Mover mapa a otra carpeta
  const moveMap = useCallback(async (mapId: string, newFolderId: string) => {
    const map = await mapDB.get(mapId);
    if (map) {
      map.folderId = newFolderId;
      await mapDB.put(map);

      setLibrary(prev => ({
        ...prev,
        maps: prev.maps.map(m => m.id === mapId ? map : m),
      }));

      window.dispatchEvent(new Event('mapLibraryUpdated'));
    }
  }, []);

  // Actualizar último uso de un mapa
  const markMapAsUsed = useCallback(async (mapId: string) => {
    const map = await mapDB.get(mapId);
    if (map) {
      map.lastUsed = new Date().toISOString();
      await mapDB.put(map);

      setLibrary(prev => ({
        ...prev,
        maps: prev.maps.map(m => m.id === mapId ? map : m),
      }));
    }
  }, []);

  // Obtener mapas de una carpeta
  const getMapsInFolder = useCallback((folderId: string) => {
    return library.maps
      .filter(map => map.folderId === folderId)
      .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime());
  }, [library.maps]);

  // Obtener carpeta por ID
  const getFolderById = useCallback((folderId: string) => {
    return library.folders.find(folder => folder.id === folderId);
  }, [library.folders]);

  // Calcular estadísticas de storage
  const getStorageStats = useCallback(() => {
    const totalMaps = library.maps.length;
    const totalSize = library.maps.reduce((sum, map) => sum + map.compressedSize, 0);
    const totalOriginalSize = library.maps.reduce((sum, map) => sum + map.originalSize, 0);

    return {
      totalMaps,
      totalSize,
      totalOriginalSize,
      compressionRatio: totalOriginalSize > 0 ? (totalOriginalSize - totalSize) / totalOriginalSize : 0,
    };
  }, [library.maps]);

  // Limpiar toda la librería
  const clearLibrary = useCallback(async () => {
    await mapDB.clear();
    await mapFolderDB.clear();

    const defaultFolder: MapFolder = {
      id: 'default',
      name: 'Mapas',
      color: '#3B82F6',
      createdAt: new Date().toISOString(),
    };

    await mapFolderDB.put(defaultFolder);
    saveCurrentFolder('default');

    setLibrary({
      version: LIBRARY_VERSION,
      folders: [defaultFolder],
      maps: [],
      currentFolder: 'default',
    });

    window.dispatchEvent(new Event('mapLibraryUpdated'));
  }, [saveCurrentFolder]);

  return {
    library,
    isLoading,
    currentFolder: getFolderById(library.currentFolder),
    mapsInCurrentFolder: getMapsInFolder(library.currentFolder),

    // Acciones
    createFolder,
    setCurrentFolder,
    addMap,
    deleteMap,
    deleteFolder,
    moveMap,
    markMapAsUsed,

    // Utilidades
    getStorageStats,
    clearLibrary,

    // Getters
    getMapsInFolder,
    getFolderById,
  };
};
