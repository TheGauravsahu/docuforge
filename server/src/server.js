import app from './app.js';
import { ENV } from './config/env.js';
import { verifyDbConnection } from './config/db.js';

const PORT = ENV.PORT || 5000;

async function startServer() {
  // Test Neon DB connection before starting server
  await verifyDbConnection();

  app.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`🚀 DocuForge Backend API Server Running!`);
    console.log(`📡 URL: http://localhost:${PORT}`);
    console.log(`📚 Swagger Docs: http://localhost:${PORT}/api/docs`);
    console.log(`==================================================\n`);
  });
}

startServer().catch((err) => {
  console.error(`❌ Startup Error:`, err);
  process.exit(1);
});
