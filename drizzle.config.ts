import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

dotenv.config();

let dbUrl = process.env.DATABASE_URL || 'postgresql://dummy:dummy@localhost/dummy';
if (dbUrl.includes('supabase.co') && !dbUrl.includes('sslmode=')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: dbUrl,
  },
});
