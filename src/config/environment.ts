import dotenv from 'dotenv';

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  
  database: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
  },
  
  whatsapp: {
    verifyToken: process.env.WHATSAPP_VERIFY_TOKEN,
    phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    mockMode: process.env.WHATSAPP_MOCK_MODE === 'true',
  },
};

// Validate production credentials if mock mode is off
if (!config.whatsapp.mockMode) {
  const required = ['WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_ACCESS_TOKEN'];
  required.forEach(envVar => {
    if (!process.env[envVar]) {
      console.error(`❌ Production WhatsApp requires: ${envVar}`);
      process.exit(1);
    }
  });
}