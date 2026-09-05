import { checkDbConnection, getDbStatus } from './src/db/index.js';
async function run() {
  await checkDbConnection();
  console.log("Status:", getDbStatus());
  process.exit();
}
run();
