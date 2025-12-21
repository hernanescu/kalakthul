import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { optionalAuth } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get all scenes for user
router.get('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';

    const result = await pool.query(
      'SELECT * FROM scenes WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );

    const scenes = result.rows.map(scene => ({
      ...scene,
      grid_config: scene.grid_config ? JSON.parse(scene.grid_config) : null,
      fog_data: scene.fog_data ? JSON.parse(scene.fog_data) : null,
      image_bounds: scene.image_bounds ? JSON.parse(scene.image_bounds) : null,
      zoom_state: scene.zoom_state ? JSON.parse(scene.zoom_state) : null,
    }));

    res.json(scenes);
  } catch (error) {
    console.error('Error fetching scenes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get scene by ID with full data
router.get('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    console.log('[Scenes] GET /:', req.params.id);
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const { id } = req.params;

    // Get scene
    const sceneResult = await pool.query(
      'SELECT * FROM scenes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (sceneResult.rows.length === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const scene = sceneResult.rows[0];

    // Get background asset URL if exists
    let backgroundUrl = null;
    if (scene.background_asset_id) {
      const assetResult = await pool.query(
        'SELECT storage_url FROM assets WHERE id = $1',
        [scene.background_asset_id]
      );
      if (assetResult.rows.length > 0) {
        backgroundUrl = assetResult.rows[0].storage_url;
      }
    }

    // Get active tokens
    const tokensResult = await pool.query(
      `SELECT at.*, a.storage_url as token_image_url
       FROM active_tokens at
       LEFT JOIN assets a ON at.asset_id = a.id
       WHERE at.scene_id = $1
       ORDER BY at.created_at`,
      [id]
    );

    // Get effects
    const effectsResult = await pool.query(
      'SELECT * FROM effects WHERE scene_id = $1 ORDER BY created_at',
      [id]
    );

    res.json({
      id: scene.id,
      user_id: scene.user_id,
      background_asset_id: scene.background_asset_id,
      background_url: backgroundUrl,
      grid_config: scene.grid_config ? JSON.parse(scene.grid_config) : null,
      fog_data: scene.fog_data ? JSON.parse(scene.fog_data) : null,
      image_bounds: scene.image_bounds ? JSON.parse(scene.image_bounds) : null,
      zoom_state: scene.zoom_state ? JSON.parse(scene.zoom_state) : null,
      tokens: tokensResult.rows.map(token => ({
        ...token,
        properties: token.properties ? JSON.parse(token.properties) : null,
      })),
      effects: effectsResult.rows,
      created_at: scene.created_at,
      updated_at: scene.updated_at,
    });
  } catch (error) {
    console.error('Error fetching scene:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new scene
router.post('/', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const {
      background_asset_id,
      grid_config,
      fog_data,
      image_bounds,
      zoom_state,
    } = req.body;

    const result = await pool.query(
      `INSERT INTO scenes (id, user_id, background_asset_id, grid_config, fog_data, image_bounds, zoom_state)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        uuidv4(),
        userId,
        background_asset_id || null,
        grid_config ? JSON.stringify(grid_config) : null,
        fog_data ? JSON.stringify(fog_data) : null,
        image_bounds ? JSON.stringify(image_bounds) : null,
        zoom_state ? JSON.stringify(zoom_state) : null,
      ]
    );

    const scene = result.rows[0];
    res.status(201).json({
      ...scene,
      grid_config: scene.grid_config ? JSON.parse(scene.grid_config) : null,
      fog_data: scene.fog_data ? JSON.parse(scene.fog_data) : null,
      image_bounds: scene.image_bounds ? JSON.parse(scene.image_bounds) : null,
      zoom_state: scene.zoom_state ? JSON.parse(scene.zoom_state) : null,
    });
  } catch (error) {
    console.error('Error creating scene:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update scene
router.put('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const { id } = req.params;
    const {
      background_asset_id,
      grid_config,
      fog_data,
      image_bounds,
      zoom_state,
    } = req.body;

    // Check if scene exists and belongs to user
    const checkResult = await pool.query(
      'SELECT id FROM scenes WHERE id = $1 AND user_id = $2',
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    // Build update query dynamically
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (background_asset_id !== undefined) {
      updates.push(`background_asset_id = $${paramIndex}`);
      values.push(background_asset_id);
      paramIndex++;
    }

    if (grid_config !== undefined) {
      updates.push(`grid_config = $${paramIndex}`);
      values.push(JSON.stringify(grid_config));
      paramIndex++;
    }

    if (fog_data !== undefined) {
      updates.push(`fog_data = $${paramIndex}`);
      values.push(JSON.stringify(fog_data));
      paramIndex++;
    }

    if (image_bounds !== undefined) {
      updates.push(`image_bounds = $${paramIndex}`);
      values.push(JSON.stringify(image_bounds));
      paramIndex++;
    }

    if (zoom_state !== undefined) {
      updates.push(`zoom_state = $${paramIndex}`);
      values.push(JSON.stringify(zoom_state));
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id, userId);

    const query = `UPDATE scenes SET ${updates.join(', ')} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1} RETURNING *`;
    const result = await pool.query(query, values);

    const scene = result.rows[0];
    res.json({
      ...scene,
      grid_config: scene.grid_config ? JSON.parse(scene.grid_config) : null,
      fog_data: scene.fog_data ? JSON.parse(scene.fog_data) : null,
      image_bounds: scene.image_bounds ? JSON.parse(scene.image_bounds) : null,
      zoom_state: scene.zoom_state ? JSON.parse(scene.zoom_state) : null,
    });
  } catch (error) {
    console.error('Error updating scene:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete scene
router.delete('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM scenes WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting scene:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

