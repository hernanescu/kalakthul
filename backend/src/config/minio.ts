import * as MinIO from 'minio';
import dotenv from 'dotenv';

dotenv.config();

const minioClient = new MinIO.Client({
  endPoint: process.env.MINIO_ENDPOINT || 'localhost',
  port: parseInt(process.env.MINIO_PORT || '9000'),
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
  secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
});

const BUCKET_NAME = process.env.MINIO_BUCKET || 'dnd-assets';

// Initialize bucket if it doesn't exist
export const initializeBucket = async (): Promise<void> => {
  try {
    console.log('[MinIO] Checking bucket:', BUCKET_NAME);
    console.log('[MinIO] Endpoint:', process.env.MINIO_ENDPOINT || 'localhost');
    console.log('[MinIO] Port:', process.env.MINIO_PORT || '9000');
    
    const exists = await minioClient.bucketExists(BUCKET_NAME);
    if (!exists) {
      console.log('[MinIO] Bucket does not exist, creating...');
      await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
      
      // Set bucket policy to public read
      const policy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: { AWS: ['*'] },
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${BUCKET_NAME}/*`],
          },
        ],
      };
      
      await minioClient.setBucketPolicy(BUCKET_NAME, JSON.stringify(policy));
      console.log('[MinIO] Bucket', BUCKET_NAME, 'created and set to public');
    } else {
      console.log('[MinIO] Bucket', BUCKET_NAME, 'already exists');
    }
  } catch (error) {
    console.error('[MinIO] Error initializing bucket:', error);
    if (error instanceof Error) {
      console.error('[MinIO] Error message:', error.message);
      console.error('[MinIO] Error stack:', error.stack);
    }
    throw error;
  }
};

export { minioClient, BUCKET_NAME };

