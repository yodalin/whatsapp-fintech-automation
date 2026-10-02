import app from './app';
import './config/environment'; // Validate env vars
import { pool } from './config/database'; // Initialize DB connection

// Convert PORT to number properly
const PORT = Number(process.env.PORT) || 3000;
// Listen on all network interfaces
const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n=================================');
  console.log(`🚀 Server running on:`);
  console.log(`   ➜ Local: http://localhost:${PORT}`);
  console.log(`   ➜ Network: http://${getLocalIP()}:${PORT}`);
  console.log(`📝 Webhook URL: http://localhost:${PORT}/api/webhook`);
  console.log(`🔍 Health: http://localhost:${PORT}/health`);
  console.log(`🗄️  Database: ${process.env.DB_NAME} @ ${process.env.DB_HOST}`);
  console.log('=================================\n');
});

// Helper function to get local IP address
function getLocalIP(): string {
  const { networkInterfaces } = require('os');
  const nets = networkInterfaces();
  
  for (const name of Object.keys(nets)) {
    for (const net of nets[name]) {
      // Skip internal and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        return net.address;
      }
    }
  }
  return '127.0.0.1';
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM received, closing connections...');
  await pool.end();
  server.close(() => process.exit(0));
});

// Also handle SIGINT (Ctrl+C)
process.on('SIGINT', async () => {
  console.log('🛑 SIGINT received, closing connections...');
  await pool.end();
  server.close(() => process.exit(0));
});