import { Router, Request, Response } from 'express';
import multer from 'multer';
import pool from '../config/database';
import { processAndUploadImage, deleteImageFromStorage } from '../utils/imageProcessor';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP, and GIF are allowed.'));
    }
  },
});

// Upload asset
router.post('/upload', optionalAuth, upload.single('image'), async (req: Request, res: Response) => {
  try {
    console.log('[Assets] Upload request received');
    if (!req.file) {
      console.log('[Assets] No file in request');
      return res.status(400).json({ error: 'No file uploaded' });
    }
    console.log('[Assets] File:', req.file.originalname, 'Size:', req.file.size, 'Type:', req.file.mimetype);

    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const type = (req.query.type as string) || (req.body.type as string) || 'map';
    const folderId = req.body.folderId || null;
    const name = req.body.name || req.file.originalname.replace(/\.[^/.]+$/, '');

    if (type !== 'map' && type !== 'token') {
      return res.status(400).json({ error: 'Type must be "map" or "token"' });
    }

    // Process and upload image
    const processed = await processAndUploadImage(req.file.buffer, req.file.originalname, type);

    // Save to database
    const result = await pool.query(
      `INSERT INTO assets (id, user_id, type, storage_url, thumbnail_url, name, folder_id, dimensions, original_size, compressed_size)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        uuidv4(),
        userId,
        type,
        processed.storageUrl,
        processed.thumbnailUrl,
        name,
        folderId,
        JSON.stringify(processed.dimensions),
        processed.originalSize,
        processed.compressedSize,
      ]
    );

    const asset = result.rows[0];
    // PostgreSQL returns JSONB as parsed objects, no need to parse again
    asset.dimensions = asset.dimensions;

    res.status(201).json(asset);
  } catch (error) {
    console.error('Error uploading asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get assets (with pagination and filters)
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const type = req.query.type as string;
    const folderId = req.query.folderId as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM assets WHERE user_id = $1';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    if (folderId) {
      query += ` AND folder_id = $${paramIndex}`;
      params.push(folderId);
      paramIndex++;
    }

    query += ` ORDER BY last_used DESC, created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);

    // Parse JSONB fields
    const assets = result.rows.map(asset => ({
      ...asset,
      dimensions: asset.dimensions ? JSON.parse(asset.dimensions) : null,
    }));

    res.json(assets);
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get asset by ID
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const { id } = req.params;

    const result = await pool.query(
      'SELECT * FROM assets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const asset = result.rows[0];
    asset.dimensions = asset.dimensions ? JSON.parse(asset.dimensions) : null;

    res.json(asset);
  } catch (error) {
    console.error('Error fetching asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete asset
router.delete('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const { id } = req.params;

    // Get asset to get storage URL
    const assetResult = await pool.query(
      'SELECT storage_url FROM assets WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (assetResult.rows.length === 0) {
      return res.status(404).json({ error: 'Asset not found' });
    }

    const storageUrl = assetResult.rows[0].storage_url;

    // Delete from storage
    try {
      await deleteImageFromStorage(storageUrl);
    } catch (error) {
      console.error('Error deleting from storage:', error);
      // Continue with DB deletion even if storage deletion fails
    }

    // Delete from database
    await pool.query('DELETE FROM assets WHERE id = $1 AND user_id = $2', [id, userId]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting asset:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

