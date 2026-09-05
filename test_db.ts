import { checkDbConnection, pool } from './src/db/index.js';
async function test() {
  const isConnected = await checkDbConnection();
  console.log("Connected:", isConnected);
  pool.end();
}
test();
