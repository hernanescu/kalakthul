import { Router, Request, Response } from 'express';
import pool from '../config/database';
import { optionalAuth } from '../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Get tokens for a scene
router.get('/scene/:sceneId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const { sceneId } = req.params;

    // Verify scene belongs to user
    const sceneCheck = await pool.query(
      'SELECT id FROM scenes WHERE id = $1 AND user_id = $2',
      [sceneId, userId]
    );

    if (sceneCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const result = await pool.query(
      `SELECT at.*, a.storage_url as token_image_url
       FROM active_tokens at
       LEFT JOIN assets a ON at.asset_id = a.id
       WHERE at.scene_id = $1
       ORDER BY at.created_at`,
      [sceneId]
    );

    const tokens = result.rows.map(token => ({
      ...token,
      properties: token.properties ? JSON.parse(token.properties) : null,
    }));

    res.json(tokens);
  } catch (error) {
    console.error('Error fetching tokens:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create token
router.post('/scene/:sceneId', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const { sceneId } = req.params;
    const {
      asset_id,
      x,
      y,
      grid_x,
      grid_y,
      width,
      height,
      name,
      opacity,
      properties,
    } = req.body;

    // Verify scene belongs to user
    const sceneCheck = await pool.query(
      'SELECT id FROM scenes WHERE id = $1 AND user_id = $2',
      [sceneId, userId]
    );

    if (sceneCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Scene not found' });
    }

    const result = await pool.query(
      `INSERT INTO active_tokens (id, scene_id, asset_id, x, y, grid_x, grid_y, width, height, name, opacity, properties)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [
        uuidv4(),
        sceneId,
        asset_id || null,
        x,
        y,
        grid_x || null,
        grid_y || null,
        width || null,
        height || null,
        name || null,
        opacity !== undefined ? opacity : 1.0,
        properties ? JSON.stringify(properties) : null,
      ]
    );

    const token = result.rows[0];
    res.status(201).json({
      ...token,
      properties: token.properties ? JSON.parse(token.properties) : null,
    });
  } catch (error) {
    console.error('Error creating token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update token
router.put('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const { id } = req.params;
    const {
      x,
      y,
      grid_x,
      grid_y,
      width,
      height,
      name,
      opacity,
      properties,
    } = req.body;

    // Verify token belongs to user's scene
    const checkResult = await pool.query(
      `SELECT at.id FROM active_tokens at
       JOIN scenes s ON at.scene_id = s.id
       WHERE at.id = $1 AND s.user_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    // Build update query
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (x !== undefined) {
      updates.push(`x = $${paramIndex}`);
      values.push(x);
      paramIndex++;
    }

    if (y !== undefined) {
      updates.push(`y = $${paramIndex}`);
      values.push(y);
      paramIndex++;
    }

    if (grid_x !== undefined) {
      updates.push(`grid_x = $${paramIndex}`);
      values.push(grid_x);
      paramIndex++;
    }

    if (grid_y !== undefined) {
      updates.push(`grid_y = $${paramIndex}`);
      values.push(grid_y);
      paramIndex++;
    }

    if (width !== undefined) {
      updates.push(`width = $${paramIndex}`);
      values.push(width);
      paramIndex++;
    }

    if (height !== undefined) {
      updates.push(`height = $${paramIndex}`);
      values.push(height);
      paramIndex++;
    }

    if (name !== undefined) {
      updates.push(`name = $${paramIndex}`);
      values.push(name);
      paramIndex++;
    }

    if (opacity !== undefined) {
      updates.push(`opacity = $${paramIndex}`);
      values.push(opacity);
      paramIndex++;
    }

    if (properties !== undefined) {
      updates.push(`properties = $${paramIndex}`);
      values.push(JSON.stringify(properties));
      paramIndex++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `UPDATE active_tokens SET ${updates.join(', ')} WHERE id = $${paramIndex} RETURNING *`;
    const result = await pool.query(query, values);

    const token = result.rows[0];
    res.json({
      ...token,
      properties: token.properties ? JSON.parse(token.properties) : null,
    });
  } catch (error) {
    console.error('Error updating token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete token
router.delete('/:id', optionalAuth, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || '00000000-0000-0000-0000-000000000000';
    const { id } = req.params;

    // Verify token belongs to user's scene
    const checkResult = await pool.query(
      `SELECT at.id FROM active_tokens at
       JOIN scenes s ON at.scene_id = s.id
       WHERE at.id = $1 AND s.user_id = $2`,
      [id, userId]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Token not found' });
    }

    await pool.query('DELETE FROM active_tokens WHERE id = $1', [id]);

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting token:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

