import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { minioClient, BUCKET_NAME } from '../config/minio';

export interface ProcessedImage {
  storageUrl: string;
  thumbnailUrl: string;
  dimensions: { width: number; height: number };
  originalSize: number;
  compressedSize: number;
}

export const processAndUploadImage = async (
  buffer: Buffer,
  originalName: string,
  type: 'map' | 'token'
): Promise<ProcessedImage> => {
  const imageId = uuidv4();
  const extension = 'webp';
  
  // Get original image metadata
  const metadata = await sharp(buffer).metadata();
  const originalSize = buffer.length;
  
  // Process main image (convert to WebP, optimize)
  const processedBuffer = await sharp(buffer)
    .webp({ quality: 80 })
    .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  
  const compressedSize = processedBuffer.length;
  
  // Generate thumbnail (200x200)
  const thumbnailBuffer = await sharp(buffer)
    .webp({ quality: 70 })
    .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
    .toBuffer();
  
  // Upload main image
  const mainFileName = `${imageId}.${extension}`;
  await minioClient.putObject(
    BUCKET_NAME,
    mainFileName,
    processedBuffer,
    processedBuffer.length,
    {
      'Content-Type': 'image/webp',
    }
  );
  
  // Upload thumbnail
  const thumbnailFileName = `${imageId}_thumb.${extension}`;
  await minioClient.putObject(
    BUCKET_NAME,
    thumbnailFileName,
    thumbnailBuffer,
    thumbnailBuffer.length,
    {
      'Content-Type': 'image/webp',
    }
  );
  
  // Construct URLs (assuming MinIO is accessible at configured endpoint)
  // In Docker, use the service name; in local dev, use localhost
  const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
  const port = process.env.MINIO_PORT || '9000';
  const useSSL = process.env.MINIO_USE_SSL === 'true';
  const protocol = useSSL ? 'https' : 'http';
  
  // For Docker, if endpoint is the service name, use localhost for client access
  const publicEndpoint = endpoint === 'dnd-storage' ? 'localhost' : endpoint;
  
  const storageUrl = `${protocol}://${publicEndpoint}:${port}/${BUCKET_NAME}/${mainFileName}`;
  const thumbnailUrl = `${protocol}://${publicEndpoint}:${port}/${BUCKET_NAME}/${thumbnailFileName}`;
  
  return {
    storageUrl,
    thumbnailUrl,
    dimensions: {
      width: metadata.width || 0,
      height: metadata.height || 0,
    },
    originalSize,
    compressedSize,
  };
};

export const deleteImageFromStorage = async (storageUrl: string): Promise<void> => {
  try {
    // Extract object name from URL
    const urlParts = storageUrl.split('/');
  const objectName = urlParts[urlParts.length - 1];
  
    // Delete main image
    await minioClient.removeObject(BUCKET_NAME, objectName);
    
    // Try to delete thumbnail (same name with _thumb suffix)
    const thumbnailName = objectName.replace(/\.(webp|jpg|jpeg|png)$/i, '_thumb.$1');
    try {
      await minioClient.removeObject(BUCKET_NAME, thumbnailName);
    } catch (error) {
      // Thumbnail might not exist, ignore
      console.warn(`Thumbnail ${thumbnailName} not found, skipping deletion`);
    }
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    throw error;
  }
};

