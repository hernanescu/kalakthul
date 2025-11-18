export interface Token {
  id: string;
  x: number; // Posición X en píxeles del canvas
  y: number; // Posición Y en píxeles del canvas
  color: string; // Color hexadecimal del token
  size: number; // Tamaño en celdas (1, 2, o 3)
  gridX: number; // Posición X en celdas de la grilla
  gridY: number; // Posición Y en celdas de la grilla
}

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
  tokens: Token[];
  selectedTokenId: string | null;
  effects: Effect[]; // Efectos animados en el mapa
  selectedEffectId: string | null;
  zoom?: ZoomState; // Estado de zoom (opcional para compatibilidad)
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

