import { db } from './src/db/index.js';
import { users } from './src/db/schema.js';

async function test() {
  try {
    const res = await db.select().from(users).limit(1);
    console.log("Users:", res);
  } catch(e) {
    console.error("Query failed:", e);
  }
  process.exit(0);
}
test();
