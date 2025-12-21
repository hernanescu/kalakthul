export interface GridConfig {
  rows: number;
  columns: number;
  opacity: number; // 0-1
  color: string; // Color hexadecimal
  visible: boolean;
}

export interface ZoomState {
  level: number; // Nivel de zoom (1.0 = 100%, 2.0 = 200%, etc.)
  panX: number; // Desplazamiento horizontal
  panY: number; // Desplazamiento vertical
}

export interface MapState {
  mapImage: string | null; // URL o base64 de la imagen
  imageBounds: ImageBounds | null; // Dimensiones y posición de la imagen renderizada
  grid: GridConfig;
  effects: Effect[]; // Efectos animados en el mapa
  selectedEffectId: string | null;
  zoom?: ZoomState; // Estado de zoom (opcional para compatibilidad)
  fogOfWar?: FogOfWarState; // Estado de niebla de guerra (opcional para compatibilidad)
  particleLayer?: ParticleLayerState; // Estado de capa de partículas (opcional para compatibilidad)
  tokens?: Token[]; // Tokens colocados en el mapa (opcional para compatibilidad)
  selectedTokenId?: string | null; // Token seleccionado (opcional para compatibilidad)
}

export interface CanvasDimensions {
  width: number;
  height: number;
  cellWidth: number;
  cellHeight: number;
}

export interface ImageBounds {
  x: number; // Posición X donde se dibuja la imagen en el canvas
  y: number; // Posición Y donde se dibuja la imagen en el canvas
  width: number; // Ancho de la imagen renderizada
  height: number; // Alto de la imagen renderizada
  originalWidth: number; // Ancho original de la imagen
  originalHeight: number; // Alto original de la imagen
}

export type EffectType = 'fire' | 'ice' | 'poison' | 'lightning' | 'magic' | 'wind' | 'water' | 'darkness';

export type EffectShape = 'square' | 'circle';

export interface Effect {
  id: string;
  type: EffectType;
  x: number; // Posición X en píxeles del canvas (centro)
  y: number; // Posición Y en píxeles del canvas (centro)
  gridX: number; // Posición X en celdas de la grilla
  gridY: number; // Posición Y en celdas de la grilla
  width: number; // Ancho del efecto en píxeles
  height: number; // Alto del efecto en píxeles
  shape: EffectShape; // Forma del efecto (cuadrado o redondo)
  opacity: number; // Opacidad del efecto (0-1)
  animationUrl?: string; // URL para animación Lottie o GIF
}

// Sistema de Librería de Mapas
// Legacy interface (Base64) - mantenido para compatibilidad
export interface MapEntry {
  id: string;
  name: string;
  folderId: string;
  thumbnail: string;        // base64 miniatura pequeña (200x200px) - legacy
  compressedImage: string;  // imagen comprimida para uso (80% calidad) - legacy
  originalSize: number;     // tamaño original en bytes
  compressedSize: number;   // tamaño comprimido en bytes
  dimensions: { width: number; height: number }; // dimensiones originales
  uploadDate: string;       // ISO string
  lastUsed: string;         // ISO string
  // Nuevos campos para API (opcionales para compatibilidad)
  storage_url?: string;     // URL del archivo en MinIO/S3
  thumbnail_url?: string;   // URL de la miniatura en MinIO/S3
}

// Nueva interfaz para assets desde API
export interface MapEntryApi {
  id: string;
  name: string;
  folderId: string;
  storage_url: string;      // URL del archivo en MinIO/S3
  thumbnail_url: string | null; // URL de la miniatura
  originalSize: number | null;
  compressedSize: number | null;
  dimensions: { width: number; height: number } | null;
  uploadDate: string;       // created_at desde API
  lastUsed: string;         // last_used desde API
}

export interface MapFolder {
  id: string;
  name: string;
  color: string;           // color CSS para distinguir carpetas
  createdAt: string;       // ISO string
}

export interface MapLibrary {
  version: string;         // para migraciones futuras
  folders: MapFolder[];
  maps: MapEntry[];
  currentFolder: string;   // ID de la carpeta activa
}

// Fog of War System
export interface Polygon {
  id: string;
  points: { x: number; y: number }[];
}

export interface FogOfWarState {
  isEnabled: boolean;
  darknessAreas: Polygon[]; // Áreas de oscuridad total (negras)
}

export type FogTool = 'darkness' | 'select' | null;

// Particle Layer System
export type ParticleType = 'sand' | 'leaves' | 'wind' | 'snow' | 'dust' | 'sparks' | 'greenLeaves' | null;

export interface ParticleLayerState {
  isEnabled: boolean;
  particleType: ParticleType;
  intensity: number; // 0-1, densidad de partículas
  speed: number; // 0-1, velocidad de movimiento
}

// Sistema de Tokens
// Legacy interface (Base64) - mantenido para compatibilidad
export interface TokenEntry {
  id: string;
  name: string;
  folderId: string;
  thumbnail: string;        // base64 miniatura pequeña (100x100px) - legacy
  image: string;            // imagen base64 para uso - legacy
  originalSize: number;     // tamaño original en bytes
  compressedSize: number;   // tamaño comprimido en bytes
  dimensions: { width: number; height: number }; // dimensiones originales
  uploadDate: string;       // ISO string
  lastUsed: string;         // ISO string
  // Nuevos campos para API (opcionales para compatibilidad)
  storage_url?: string;     // URL del archivo en MinIO/S3
  thumbnail_url?: string;   // URL de la miniatura en MinIO/S3
}

// Nueva interfaz para assets desde API
export interface TokenEntryApi {
  id: string;
  name: string;
  folderId: string;
  storage_url: string;      // URL del archivo en MinIO/S3
  thumbnail_url: string | null; // URL de la miniatura
  originalSize: number | null;
  compressedSize: number | null;
  dimensions: { width: number; height: number } | null;
  uploadDate: string;       // created_at desde API
  lastUsed: string;         // last_used desde API
}

export interface TokenFolder {
  id: string;
  name: string;
  color: string;           // color CSS para distinguir carpetas
  createdAt: string;       // ISO string
}

export interface TokenLibrary {
  version: string;         // para migraciones futuras
  folders: TokenFolder[];
  tokens: TokenEntry[];
  currentFolder: string;    // ID de la carpeta activa
}

export interface Token {
  id: string;
  tokenEntryId: string;     // ID del TokenEntry en la librería (o asset_id desde API)
  x: number;                // Posición X en píxeles del canvas (centro)
  y: number;                // Posición Y en píxeles del canvas (centro)
  gridX: number;            // Posición X en celdas de la grilla
  gridY: number;            // Posición Y en celdas de la grilla
  width: number;            // Ancho del token en píxeles
  height: number;           // Alto del token en píxeles
  name?: string;            // Nombre opcional del token
  opacity: number;           // Opacidad del token (0-1)
  // Campos adicionales desde API
  token_image_url?: string; // URL de la imagen del token (desde API)
  asset_id?: string;        // ID del asset (desde API)
}

