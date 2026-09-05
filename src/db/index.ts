import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

let connectionString = process.env.DATABASE_URL;

const poolConfig: any = {
  connectionString: connectionString || 'postgresql://dummy:dummy@localhost/dummy',
};

if (connectionString && connectionString.includes('supabase.co')) {
  poolConfig.ssl = { rejectUnauthorized: false };
}

// We initialize a pool if the connection string is provided.
export const pool = new Pool(poolConfig);

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
