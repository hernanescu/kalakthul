import { useState, useEffect, useCallback } from 'react';
import { MapLibrary, MapEntry, MapFolder } from '../types';
import { generateFolderId, getRandomFolderColor } from '../utils/imageUtils';
import { assetsApi } from '../api/assets';
import { Asset } from '../api/assets';

const LIBRARY_VERSION = '1.0.0';
const CURRENT_FOLDER_KEY = 'kalakthul-current-map-folder';
const FOLDERS_KEY = 'kalakthul-map-folders';

/**
 * Hook para manejar la librería de mapas usando API
 */
export const useMapLibrary = () => {
  const [library, setLibrary] = useState<MapLibrary>({
    version: LIBRARY_VERSION,
    folders: [],
    maps: [],
    currentFolder: '',
  });

  const [isLoading, setIsLoading] = useState(true);

  // Cargar carpetas desde localStorage (solo UI, no se persisten en backend)
  const loadFolders = useCallback((): MapFolder[] => {
    try {
      const stored = localStorage.getItem(FOLDERS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading folders:', error);
    }
    
    // Carpeta por defecto
    return [{
      id: 'default',
      name: 'Mapas',
      color: '#3B82F6',
      createdAt: new Date().toISOString(),
    }];
  }, []);

  // Guardar carpetas en localStorage
  const saveFolders = useCallback((folders: MapFolder[]) => {
    try {
      localStorage.setItem(FOLDERS_KEY, JSON.stringify(folders));
    } catch (error) {
      console.error('Error saving folders:', error);
    }
  }, []);

  // Convertir Asset de API a MapEntry
  const assetToMapEntry = useCallback((asset: Asset): MapEntry => {
    return {
      id: asset.id,
      name: asset.name || 'Unnamed Map',
      folderId: asset.folder_id || 'default',
      thumbnail: asset.thumbnail_url || '',
      compressedImage: asset.storage_url, // Usar storage_url como compressedImage
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
      
      // Si no hay carpetas, crear carpeta por defecto
      if (folders.length === 0) {
        const defaultFolder: MapFolder = {
          id: 'default',
          name: 'Mapas',
          color: '#3B82F6',
          createdAt: new Date().toISOString(),
        };
        folders = [defaultFolder];
        saveFolders(folders);
      }

      // Cargar mapas desde API
      const assets = await assetsApi.getAll('map');
      const maps = assets.map(assetToMapEntry);

      // Obtener carpeta actual desde localStorage
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
  }, [loadFolders, saveFolders, assetToMapEntry]);

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
    const newFolder: MapFolder = {
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

  // Agregar mapa (subir a API)
  const addMap = useCallback(async (file: File, folderId?: string) => {
    try {
      const targetFolderId = folderId || library.currentFolder;
      
      // Subir a API
      const asset = await assetsApi.upload(file, 'map', targetFolderId, file.name.replace(/\.[^/.]+$/, ''));
      
      // Convertir a MapEntry
      const mapEntry = assetToMapEntry(asset);

      setLibrary(prev => ({
        ...prev,
        maps: [...prev.maps, mapEntry],
      }));

      return mapEntry;
    } catch (error) {
      console.error('Error agregando mapa:', error);
      throw error;
    }
  }, [library.currentFolder, assetToMapEntry]);

  // Eliminar mapa
  const deleteMap = useCallback(async (mapId: string) => {
    try {
      await assetsApi.delete(mapId);

      setLibrary(prev => ({
        ...prev,
        maps: prev.maps.filter(map => map.id !== mapId),
      }));
    } catch (error) {
      console.error('Error eliminando mapa:', error);
      throw error;
    }
  }, []);

  // Eliminar carpeta (y mover mapas a default)
  const deleteFolder = useCallback(async (folderId: string) => {
    if (folderId === 'default') return; // No eliminar carpeta por defecto

    // Mover mapas a default (actualizar en API)
    const mapsInFolder = library.maps.filter(map => map.folderId === folderId);
    // Nota: El backend no soporta actualizar folder_id directamente,
    // así que solo actualizamos el estado local por ahora
    // TODO: Agregar endpoint para actualizar folder_id de assets

    // Eliminar carpeta de localStorage
    const folders = loadFolders().filter(f => f.id !== folderId);
    saveFolders(folders);

    // Actualizar mapas localmente
    setLibrary(prev => ({
      ...prev,
      folders,
      maps: prev.maps.map(map => 
        map.folderId === folderId ? { ...map, folderId: 'default' } : map
      ),
    }));
  }, [library.maps, loadFolders, saveFolders]);

  // Mover mapa a otra carpeta
  const moveMap = useCallback(async (mapId: string, newFolderId: string) => {
    // Actualizar solo en estado local por ahora
    // TODO: Agregar endpoint para actualizar folder_id
    setLibrary(prev => ({
      ...prev,
      maps: prev.maps.map(m => 
        m.id === mapId ? { ...m, folderId: newFolderId } : m
      ),
    }));
  }, []);

  // Actualizar último uso de un mapa (no se persiste en backend por ahora)
  const markMapAsUsed = useCallback(async (mapId: string) => {
    setLibrary(prev => ({
      ...prev,
      maps: prev.maps.map(m => 
        m.id === mapId ? { ...m, lastUsed: new Date().toISOString() } : m
      ),
    }));
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
    const totalSize = library.maps.reduce((sum, map) => sum + (map.compressedSize || 0), 0);
    const totalOriginalSize = library.maps.reduce((sum, map) => sum + (map.originalSize || 0), 0);

    return {
      totalMaps,
      totalSize,
      totalOriginalSize,
      compressionRatio: totalOriginalSize > 0 ? (totalOriginalSize - totalSize) / totalOriginalSize : 0,
    };
  }, [library.maps]);

  // Limpiar toda la librería
  const clearLibrary = useCallback(async () => {
    // Eliminar todos los mapas de la API
    for (const map of library.maps) {
      try {
        await assetsApi.delete(map.id);
      } catch (error) {
        console.error(`Error eliminando mapa ${map.id}:`, error);
      }
    }

    // Resetear carpetas
    const defaultFolder: MapFolder = {
      id: 'default',
      name: 'Mapas',
      color: '#3B82F6',
      createdAt: new Date().toISOString(),
    };

    saveFolders([defaultFolder]);
    saveCurrentFolder('default');

    setLibrary({
      version: LIBRARY_VERSION,
      folders: [defaultFolder],
      maps: [],
      currentFolder: 'default',
    });
  }, [library.maps, saveFolders, saveCurrentFolder]);

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
