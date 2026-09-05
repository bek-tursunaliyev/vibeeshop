import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let connectionString = process.env.DATABASE_URL;

// Add sslmode=require for Supabase if not present
if (connectionString && connectionString.includes('supabase.co') && !connectionString.includes('sslmode=')) {
  connectionString += (connectionString.includes('?') ? '&' : '?') + 'sslmode=require';
}

// We initialize a pool if the connection string is provided.
export const pool = new Pool({
  connectionString: connectionString || 'postgresql://dummy:dummy@localhost/dummy',
});

export const db = drizzle(pool, { schema });

let isDbConnected = false;

export async function checkDbConnection() {
  if (!connectionString) {
    console.warn('⚠️ DATABASE_URL muhit o‘zgaruvchisi o‘rnatilmagan! Ma‘lumotlar bazasi ishlamaydi.');
    isDbConnected = false;
    return false;
  }
  try {
    const client = await pool.connect();
    client.release();
    console.log('✅ PostgreSQL ma‘lumotlar bazasiga ulanish muvaffaqiyatli.');
    isDbConnected = true;
    return true;
  } catch (err) {
    console.error('❌ Ma‘lumotlar bazasiga ulanishda xatolik:', err);
    isDbConnected = false;
    return false;
  }
}

export function getDbStatus() {
  return isDbConnected;
}
