import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

let dbUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost/dummy';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
    ssl: dbUrl.includes('supabase.co') ? { rejectUnauthorized: false } : undefined
  },
});
