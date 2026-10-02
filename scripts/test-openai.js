const axios = require('axios');

// Use the IP that worked from your server output
const SERVER_URL = 'http://172.21.16.1:3001';  // ← Use this IP
const HEALTH_URL = `${SERVER_URL}/health`;
const WEBHOOK_URL = `${SERVER_URL}/api/webhook`;

const TEST_MESSAGES = [
  "Send 500 ETB to savings",
  "What's my balance?",
  "Pay electricity bill 850 birr",
  "Buy airtime for 0912345678",
  "I need a loan",
  "ሰላም 1000 ብር ላክ",
  "Help me with my account"
];

async function testOpenAI() {
  console.log('\n🧪 ===== TESTING OPENAI INTEGRATION =====\n');
  console.log(`🔍 Checking server at: ${HEALTH_URL}`);

  try {
    const healthCheck = await axios.get(HEALTH_URL, { 
      timeout: 2000
    });
    
    console.log('✅ Server is running\n');
  } catch (error) {
    console.error('❌ Cannot connect to server!');
    console.error(`   Error: ${error.message}`);
    console.error(`\n   Make sure server is running on: ${SERVER_URL}`);
    process.exit(1);
  }

  for (const message of TEST_MESSAGES) {
    console.log(`📨 Sending: "${message}"`);
    
    try {
      await axios.post(
        WEBHOOK_URL,
        {
          entry: [{
            changes: [{
              value: {
                messages: [{
                  from: '251911223344',
                  type: 'text',
                  text: { body: message }
                }]
              }
            }]
          }]
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      console.log(`   ✅ Success`);
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
    }

    console.log('---');
    await new Promise(r => setTimeout(r, 1000));
  }
}

testOpenAI();