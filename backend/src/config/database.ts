import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Log database configuration (without password)
const dbUrl = process.env.DATABASE_URL;
const dbUrlSafe = dbUrl ? dbUrl.replace(/:[^:@]+@/, ':****@') : 'not set';
console.log('[DB Config] DATABASE_URL:', dbUrlSafe);

// Parse DATABASE_URL to extract components
if (dbUrl) {
  try {
    const url = new URL(dbUrl);
    console.log('[DB Config] Parsed components:');
    console.log('  - Host:', url.hostname);
    console.log('  - Port:', url.port || '5432');
    console.log('  - Database:', url.pathname.substring(1));
    console.log('  - User:', url.username);
  } catch (e) {
    console.warn('[DB Config] Could not parse DATABASE_URL:', e);
  }
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://dnd_user:dnd_password@localhost:5432/dnd_db',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('[DB Error] Unexpected error on idle client:', err);
  process.exit(-1);
});

// Test connection on pool creation
pool.on('connect', (client) => {
  console.log('[DB] New client connected to database');
});

pool.on('acquire', () => {
  console.log('[DB] Client acquired from pool');
});

pool.on('remove', () => {
  console.log('[DB] Client removed from pool');
});

export default pool;

