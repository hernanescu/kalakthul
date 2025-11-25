import { MapEntry, MapFolder, TokenEntry, TokenFolder } from '../types';

const DB_NAME = 'kalakthul-db';
const DB_VERSION = 1;

// Nombres de los object stores
const STORES = {
  MAPS: 'maps',
  MAP_FOLDERS: 'mapFolders',
  TOKENS: 'tokens',
  TOKEN_FOLDERS: 'tokenFolders',
} as const;

// Tipos para las claves
type StoreName = typeof STORES[keyof typeof STORES];

/**
 * Inicializar la base de datos IndexedDB
 */
export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('Error abriendo IndexedDB: ' + request.error));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Crear object stores si no existen
      if (!db.objectStoreNames.contains(STORES.MAPS)) {
        const mapsStore = db.createObjectStore(STORES.MAPS, { keyPath: 'id' });
        mapsStore.createIndex('folderId', 'folderId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.MAP_FOLDERS)) {
        db.createObjectStore(STORES.MAP_FOLDERS, { keyPath: 'id' });
      }

      if (!db.objectStoreNames.contains(STORES.TOKENS)) {
        const tokensStore = db.createObjectStore(STORES.TOKENS, { keyPath: 'id' });
        tokensStore.createIndex('folderId', 'folderId', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.TOKEN_FOLDERS)) {
        db.createObjectStore(STORES.TOKEN_FOLDERS, { keyPath: 'id' });
      }
    };
  });
};

/**
 * Obtener todos los items de un store
 */
const getAll = async <T>(storeName: StoreName): Promise<T[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error(`Error obteniendo ${storeName}: ${request.error}`));
    };
  });
};

/**
 * Agregar o actualizar un item en un store
 */
const put = async <T>(storeName: StoreName, item: T): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.put(item);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Error guardando ${storeName}: ${request.error}`));
    };
  });
};

/**
 * Agregar múltiples items a un store
 */
const putAll = async <T>(storeName: StoreName, items: T[]): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);

    let completed = 0;
    let hasError = false;

    if (items.length === 0) {
      resolve();
      return;
    }

    items.forEach((item) => {
      const request = store.put(item);
      request.onsuccess = () => {
        completed++;
        if (completed === items.length && !hasError) {
          resolve();
        }
      };
      request.onerror = () => {
        if (!hasError) {
          hasError = true;
          reject(new Error(`Error guardando ${storeName}: ${request.error}`));
        }
      };
    });
  });
};

/**
 * Eliminar un item de un store
 */
const deleteItem = async (storeName: StoreName, id: string): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.delete(id);

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Error eliminando ${storeName}: ${request.error}`));
    };
  });
};

/**
 * Obtener un item por ID
 */
const get = async <T>(storeName: StoreName, id: string): Promise<T | undefined> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error(`Error obteniendo ${storeName}: ${request.error}`));
    };
  });
};

/**
 * Obtener items por folderId
 */
const getByFolderId = async <T extends { folderId: string }>(
  storeName: StoreName,
  folderId: string
): Promise<T[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index('folderId');
    const request = index.getAll(folderId);

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(new Error(`Error obteniendo ${storeName} por folderId: ${request.error}`));
    };
  });
};

/**
 * Limpiar todos los items de un store
 */
const clear = async (storeName: StoreName): Promise<void> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.clear();

    request.onsuccess = () => {
      resolve();
    };

    request.onerror = () => {
      reject(new Error(`Error limpiando ${storeName}: ${request.error}`));
    };
  });
};

// API específica para Mapas
export const mapDB = {
  getAll: () => getAll<MapEntry>(STORES.MAPS),
  get: (id: string) => get<MapEntry>(STORES.MAPS, id),
  put: (map: MapEntry) => put(STORES.MAPS, map),
  putAll: (maps: MapEntry[]) => putAll(STORES.MAPS, maps),
  delete: (id: string) => deleteItem(STORES.MAPS, id),
  getByFolderId: (folderId: string) => getByFolderId<MapEntry>(STORES.MAPS, folderId),
  clear: () => clear(STORES.MAPS),
};

// API específica para Carpetas de Mapas
export const mapFolderDB = {
  getAll: () => getAll<MapFolder>(STORES.MAP_FOLDERS),
  get: (id: string) => get<MapFolder>(STORES.MAP_FOLDERS, id),
  put: (folder: MapFolder) => put(STORES.MAP_FOLDERS, folder),
  putAll: (folders: MapFolder[]) => putAll(STORES.MAP_FOLDERS, folders),
  delete: (id: string) => deleteItem(STORES.MAP_FOLDERS, id),
  clear: () => clear(STORES.MAP_FOLDERS),
};

// API específica para Tokens
export const tokenDB = {
  getAll: () => getAll<TokenEntry>(STORES.TOKENS),
  get: (id: string) => get<TokenEntry>(STORES.TOKENS, id),
  put: (token: TokenEntry) => put(STORES.TOKENS, token),
  putAll: (tokens: TokenEntry[]) => putAll(STORES.TOKENS, tokens),
  delete: (id: string) => deleteItem(STORES.TOKENS, id),
  getByFolderId: (folderId: string) => getByFolderId<TokenEntry>(STORES.TOKENS, folderId),
  clear: () => clear(STORES.TOKENS),
};

// API específica para Carpetas de Tokens
export const tokenFolderDB = {
  getAll: () => getAll<TokenFolder>(STORES.TOKEN_FOLDERS),
  get: (id: string) => get<TokenFolder>(STORES.TOKEN_FOLDERS, id),
  put: (folder: TokenFolder) => put(STORES.TOKEN_FOLDERS, folder),
  putAll: (folders: TokenFolder[]) => putAll(STORES.TOKEN_FOLDERS, folders),
  delete: (id: string) => deleteItem(STORES.TOKEN_FOLDERS, id),
  clear: () => clear(STORES.TOKEN_FOLDERS),
};

/**
 * Migrar datos desde localStorage a IndexedDB
 */
export const migrateFromLocalStorage = async (): Promise<{
  mapsMigrated: boolean;
  tokensMigrated: boolean;
}> => {
  const MAP_LIBRARY_KEY = 'kalakthuling-map-library';
  const TOKEN_LIBRARY_KEY = 'kalakthuling-token-library';
  const MIGRATION_FLAG_KEY = 'kalakthul-migration-complete';

  // Verificar si ya se migró
  const migrationComplete = localStorage.getItem(MIGRATION_FLAG_KEY);
  if (migrationComplete === 'true') {
    return { mapsMigrated: false, tokensMigrated: false };
  }

  let mapsMigrated = false;
  let tokensMigrated = false;

  try {
    // Migrar mapas
    const mapLibraryData = localStorage.getItem(MAP_LIBRARY_KEY);
    if (mapLibraryData) {
      const mapLibrary = JSON.parse(mapLibraryData);
      if (mapLibrary.maps && mapLibrary.maps.length > 0) {
        await mapDB.putAll(mapLibrary.maps);
        mapsMigrated = true;
      }
      if (mapLibrary.folders && mapLibrary.folders.length > 0) {
        await mapFolderDB.putAll(mapLibrary.folders);
      }
    }

    // Migrar tokens
    const tokenLibraryData = localStorage.getItem(TOKEN_LIBRARY_KEY);
    if (tokenLibraryData) {
      const tokenLibrary = JSON.parse(tokenLibraryData);
      if (tokenLibrary.tokens && tokenLibrary.tokens.length > 0) {
        await tokenDB.putAll(tokenLibrary.tokens);
        tokensMigrated = true;
      }
      if (tokenLibrary.folders && tokenLibrary.folders.length > 0) {
        await tokenFolderDB.putAll(tokenLibrary.folders);
      }
    }

    // Marcar migración como completa
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
  } catch (error) {
    console.error('Error durante migración:', error);
  }

  return { mapsMigrated, tokensMigrated };
};


