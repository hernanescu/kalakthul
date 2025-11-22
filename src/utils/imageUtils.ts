import { MapEntry, TokenEntry } from '../types';

/**
 * Utilidades para procesamiento de imágenes en la librería de mapas
 */

// Generar ID único para mapas
export const generateMapId = (): string => {
  return `map_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generar ID único para carpetas
export const generateFolderId = (): string => {
  return `folder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Colores disponibles para carpetas
export const FOLDER_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#F97316', // orange
  '#06B6D4', // cyan
  '#84CC16', // lime
];

/**
 * Comprimir imagen manteniendo calidad aceptable
 */
export const compressImage = (
  file: File,
  quality: number = 0.8,
  maxWidth: number = 2048,
  maxHeight: number = 2048
): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('No se pudo obtener el contexto del canvas'));
      return;
    }

    img.onload = () => {
      // Calcular nuevas dimensiones manteniendo aspect ratio
      let { width, height } = img;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }

      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      // Configurar canvas
      canvas.width = width;
      canvas.height = height;

      // Dibujar imagen comprimida
      ctx.drawImage(img, 0, 0, width, height);

      resolve(img);
    };

    img.onerror = () => reject(new Error('Error al cargar la imagen'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Crear miniatura pequeña de la imagen
 */
export const createThumbnail = (
  file: File,
  size: number = 200
): Promise<HTMLCanvasElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      reject(new Error('No se pudo obtener el contexto del canvas'));
      return;
    }

    img.onload = () => {
      // Calcular dimensiones manteniendo aspect ratio
      const aspectRatio = img.width / img.height;
      let width = size;
      let height = size;

      if (aspectRatio > 1) {
        height = size / aspectRatio;
      } else {
        width = size * aspectRatio;
      }

      // Centrar la imagen en el canvas cuadrado
      canvas.width = size;
      canvas.height = size;

      const x = (size - width) / 2;
      const y = (size - height) / 2;

      // Fondo blanco
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);

      // Dibujar imagen escalada
      ctx.drawImage(img, x, y, width, height);

      resolve(canvas);
    };

    img.onerror = () => reject(new Error('Error al crear la miniatura'));
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Convertir canvas a base64
 */
export const canvasToBase64 = (canvas: HTMLCanvasElement, quality: number = 0.8): string => {
  return canvas.toDataURL('image/jpeg', quality);
};

/**
 * Calcular tamaño de imagen en KB
 */
export const calculateImageSize = (base64: string): number => {
  // Remover el prefijo "data:image/jpeg;base64," y calcular tamaño real
  const base64Data = base64.split(',')[1];
  return Math.round((base64Data.length * 3) / 4 / 1024); // KB
};

/**
 * Procesar imagen completa para la librería
 */
export const processMapImage = async (file: File): Promise<MapEntry> => {
  try {
    const isGif = file.type === 'image/gif';
    
    // Para GIFs, preservar el formato original sin convertir a JPEG
    if (isGif) {
      // Leer GIF directamente como base64 para preservar la animación
      const gifBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // Crear miniatura del GIF (primer frame)
      const thumbnailCanvas = await createThumbnail(file, 200);
      const thumbnailBase64 = canvasToBase64(thumbnailCanvas, 0.7);

      // Obtener dimensiones del GIF
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = gifBase64;
      });

      return {
        id: generateMapId(),
        name: file.name.replace(/\.[^/.]+$/, ''), // quitar extensión
        folderId: '', // se asignará después
        thumbnail: thumbnailBase64,
        compressedImage: gifBase64, // Preservar GIF original
        originalSize: file.size,
        compressedSize: file.size, // GIF no se comprime
        dimensions: {
          width: img.width,
          height: img.height
        },
        uploadDate: new Date().toISOString(),
        lastUsed: new Date().toISOString(),
      };
    }

    // Para imágenes normales, usar el proceso de compresión
    // Crear imagen comprimida
    const compressedImg = await compressImage(file, 0.8);
    const compressedCanvas = document.createElement('canvas');
    const compressedCtx = compressedCanvas.getContext('2d');

    if (!compressedCtx) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }

    compressedCanvas.width = compressedImg.width;
    compressedCanvas.height = compressedImg.height;
    compressedCtx.drawImage(compressedImg, 0, 0);

    // Crear miniatura
    const thumbnailCanvas = await createThumbnail(file, 200);

    // Convertir a base64
    const compressedBase64 = canvasToBase64(compressedCanvas, 0.8);
    const thumbnailBase64 = canvasToBase64(thumbnailCanvas, 0.7);

    // Calcular tamaños
    const originalSize = file.size;
    const compressedSize = calculateImageSize(compressedBase64) * 1024; // bytes

    return {
      id: generateMapId(),
      name: file.name.replace(/\.[^/.]+$/, ''), // quitar extensión
      folderId: '', // se asignará después
      thumbnail: thumbnailBase64,
      compressedImage: compressedBase64,
      originalSize,
      compressedSize,
      dimensions: {
        width: compressedImg.width,
        height: compressedImg.height
      },
      uploadDate: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error procesando imagen:', error);
    throw error;
  }
};

/**
 * Obtener color aleatorio para carpeta
 */
export const getRandomFolderColor = (): string => {
  return FOLDER_COLORS[Math.floor(Math.random() * FOLDER_COLORS.length)];
};

/**
 * Formatear tamaño de archivo
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Generar ID único para tokens
 */
export const generateTokenId = (): string => {
  return `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Procesar imagen de token para la librería
 */
export const processTokenImage = async (file: File): Promise<TokenEntry> => {
  try {
    // Crear miniatura pequeña (100x100px para tokens)
    const thumbnailCanvas = await createThumbnail(file, 100);
    
    // Crear imagen comprimida (más pequeña que mapas, tokens suelen ser más pequeños)
    const compressedImg = await compressImage(file, 0.9, 512, 512);
    const compressedCanvas = document.createElement('canvas');
    const compressedCtx = compressedCanvas.getContext('2d');

    if (!compressedCtx) {
      throw new Error('No se pudo obtener el contexto del canvas');
    }

    compressedCanvas.width = compressedImg.width;
    compressedCanvas.height = compressedImg.height;
    compressedCtx.drawImage(compressedImg, 0, 0);

    // Convertir a base64
    const compressedBase64 = canvasToBase64(compressedCanvas, 0.9);
    const thumbnailBase64 = canvasToBase64(thumbnailCanvas, 0.8);

    // Calcular tamaños
    const originalSize = file.size;
    const compressedSize = calculateImageSize(compressedBase64) * 1024; // bytes

    return {
      id: generateTokenId(),
      name: file.name.replace(/\.[^/.]+$/, ''), // quitar extensión
      folderId: '', // se asignará después
      thumbnail: thumbnailBase64,
      image: compressedBase64,
      originalSize,
      compressedSize,
      dimensions: {
        width: compressedImg.width,
        height: compressedImg.height
      },
      uploadDate: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error procesando token:', error);
    throw error;
  }
};
