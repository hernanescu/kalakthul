import { useState, useEffect, useCallback } from 'react';
import { MapLibrary, MapEntry, MapFolder } from '../types';
import { processMapImage, generateFolderId, getRandomFolderColor } from '../utils/imageUtils';

const LIBRARY_KEY = 'kalakthuling-map-library';
const LIBRARY_VERSION = '1.0.0';

/**
 * Hook para manejar la librería de mapas
 */
export const useMapLibrary = () => {
  const [library, setLibrary] = useState<MapLibrary>({
    version: LIBRARY_VERSION,
    folders: [],
    maps: [],
    currentFolder: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  // Cargar librería desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LIBRARY_KEY);
      if (saved) {
        const parsedLibrary: MapLibrary = JSON.parse(saved);

        // Crear carpeta por defecto si no existe
        if (parsedLibrary.folders.length === 0) {
          const defaultFolder: MapFolder = {
            id: 'default',
            name: 'Mapas',
            color: '#3B82F6',
            createdAt: new Date().toISOString(),
          };
          parsedLibrary.folders = [defaultFolder];
          parsedLibrary.currentFolder = 'default';
        }

        setLibrary(parsedLibrary);
      } else {
        // Inicializar con carpeta por defecto
        const defaultFolder: MapFolder = {
          id: 'default',
          name: 'Mapas',
          color: '#3B82F6',
          createdAt: new Date().toISOString(),
        };

        const initialLibrary: MapLibrary = {
          version: LIBRARY_VERSION,
          folders: [defaultFolder],
          maps: [],
          currentFolder: 'default',
        };

        setLibrary(initialLibrary);
        localStorage.setItem(LIBRARY_KEY, JSON.stringify(initialLibrary));
      }
    } catch (error) {
      console.error('Error cargando librería de mapas:', error);
      // En caso de error, usar librería vacía
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

  // Guardar librería en localStorage
  const saveLibrary = useCallback((newLibrary: MapLibrary) => {
    try {
      localStorage.setItem(LIBRARY_KEY, JSON.stringify(newLibrary));
      setLibrary(newLibrary);
    } catch (error) {
      console.error('Error guardando librería:', error);
      // Podríamos mostrar un toast de error aquí
    }
  }, []);

  // Crear nueva carpeta
  const createFolder = useCallback((name: string) => {
    const newFolder: MapFolder = {
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

  // Agregar mapa a carpeta
  const addMap = useCallback(async (file: File, folderId?: string) => {
    try {
      const targetFolderId = folderId || library.currentFolder;
      const mapEntry = await processMapImage(file);
      mapEntry.folderId = targetFolderId;

      const updatedLibrary = {
        ...library,
        maps: [...library.maps, mapEntry],
      };

      saveLibrary(updatedLibrary);
      return mapEntry;
    } catch (error) {
      console.error('Error agregando mapa:', error);
      throw error;
    }
  }, [library, saveLibrary]);

  // Eliminar mapa
  const deleteMap = useCallback((mapId: string) => {
    const updatedLibrary = {
      ...library,
      maps: library.maps.filter(map => map.id !== mapId),
    };
    saveLibrary(updatedLibrary);
  }, [library, saveLibrary]);

  // Eliminar carpeta (y mover mapas a default)
  const deleteFolder = useCallback((folderId: string) => {
    if (folderId === 'default') return; // No eliminar carpeta por defecto

    const updatedMaps = library.maps.map(map =>
      map.folderId === folderId ? { ...map, folderId: 'default' } : map
    );

    const updatedLibrary = {
      ...library,
      folders: library.folders.filter(folder => folder.id !== folderId),
      maps: updatedMaps,
      currentFolder: library.currentFolder === folderId ? 'default' : library.currentFolder,
    };

    saveLibrary(updatedLibrary);
  }, [library, saveLibrary]);

  // Mover mapa a otra carpeta
  const moveMap = useCallback((mapId: string, newFolderId: string) => {
    const updatedMaps = library.maps.map(map =>
      map.id === mapId ? { ...map, folderId: newFolderId } : map
    );

    const updatedLibrary = {
      ...library,
      maps: updatedMaps,
    };

    saveLibrary(updatedLibrary);
  }, [library, saveLibrary]);

  // Actualizar último uso de un mapa
  const markMapAsUsed = useCallback((mapId: string) => {
    const updatedMaps = library.maps.map(map =>
      map.id === mapId
        ? { ...map, lastUsed: new Date().toISOString() }
        : map
    );

    const updatedLibrary = {
      ...library,
      maps: updatedMaps,
    };

    saveLibrary(updatedLibrary);
  }, [library, saveLibrary]);

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
  const clearLibrary = useCallback(() => {
    const defaultFolder: MapFolder = {
      id: 'default',
      name: 'Mapas',
      color: '#3B82F6',
      createdAt: new Date().toISOString(),
    };

    const emptyLibrary: MapLibrary = {
      version: LIBRARY_VERSION,
      folders: [defaultFolder],
      maps: [],
      currentFolder: 'default',
    };

    saveLibrary(emptyLibrary);
  }, [saveLibrary]);

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
