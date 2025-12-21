import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  // In development, allow demo mode without authentication
  if (process.env.NODE_ENV === 'development' && process.env.DEMO_MODE === 'true') {
    // Use demo user
    req.user = {
      userId: 'demo-user-id',
      email: 'demo@example.com',
    };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
  
  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }
    
    req.user = decoded as JwtPayload;
    next();
  });
};

// Optional authentication - doesn't fail if no token
export const optionalAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (process.env.NODE_ENV === 'development' && process.env.DEMO_MODE === 'true') {
    req.user = {
      userId: '00000000-0000-0000-0000-000000000000', // UUID válido para desarrollo
      email: 'demo@example.com',
    };
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    jwt.verify(token, jwtSecret, (err, decoded) => {
      if (!err) {
        req.user = decoded as JwtPayload;
      }
    });
  }
  
  next();
};

