import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../config/database';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Register new user
router.post('/register', async (req: Request, res: Response) => {
  try {
    console.log('[Auth] Register request:', req.body.email);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'User already exists' });
    }

    // Create new user
    const result = await pool.query(
      'INSERT INTO users (id, email, subscription_tier) VALUES ($1, $2, $3) RETURNING id, email, subscription_tier',
      [uuidv4(), email, 'free']
    );

    const user = result.rows[0];

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        subscription_tier: user.subscription_tier,
      },
      token,
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login (for MVP, just verify email exists and return token)
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Find user
    const result = await pool.query(
      'SELECT id, email, subscription_tier FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        subscription_tier: user.subscription_tier,
      },
      token,
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;

