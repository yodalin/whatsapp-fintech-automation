import app from './app';
import './config/environment'; // Validate env vars
import { pool } from './config/database'; // Initialize DB connection

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('\n=================================');
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📝 Webhook URL: http://localhost:${PORT}/api/webhook`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);
  console.log('=================================\n');
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing connections...');
  await pool.end();
  server.close(() => process.exit(0));
});