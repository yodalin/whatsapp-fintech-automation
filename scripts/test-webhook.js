/**
 * WhatsApp Fintech Automation - Webhook Test Script
 * 
 * This script simulates a WhatsApp message sent to your webhook
 * Run this to test your entire flow: receive → persist → understand → reply
 */

const axios = require('axios');

// Configuration
const WEBHOOK_URL = 'http://localhost:3000/api/webhook';
const TEST_NUMBER = '251911223344';  // Ethiopian test number

// Test messages - try different intents
const TEST_MESSAGES = [
  'Send 500 ETB to savings',
  'What is my balance?',
  'Show my transactions',
  'Hello, I need help'
];

/**
 * Send a test message to your webhook
 */
async function testWebhook(message = TEST_MESSAGES[0]) {
  console.log('\n🧪 ========== TESTING WEBHOOK ==========');
  console.log(`📨 Sending: "${message}"`);
  console.log(`📞 From: ${TEST_NUMBER}`);
  console.log('========================================\n');

  const payload = {
    entry: [{
      changes: [{
        value: {
          messages: [{
            from: TEST_NUMBER,
            type: 'text',
            text: { body: message }
          }]
        }
      }]
    }]
  };

  try {
    const startTime = Date.now();
    
    const response = await axios.post(
      WEBHOOK_URL,
      payload,
      { 
        headers: { 
          'Content-Type': 'application/json' 
        } 
      }
    );
    
    const duration = Date.now() - startTime;
    
    console.log('\n✅ ========== TEST SUCCESSFUL ==========');
    console.log(`   Status: ${response.status} ${response.statusText}`);
    console.log(`   Response time: ${duration}ms`);
    console.log('========================================\n');
    
    return { success: true, status: response.status, duration };
    
  } catch (error) {
    console.log('\n❌ ========== TEST FAILED ==========');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('   Error: Server not running!');
      console.error('   Run: npm run dev');
    } else if (error.response) {
      console.error(`   Status: ${error.response.status}`);
      console.error(`   Message: ${error.response.data}`);
    } else {
      console.error(`   Error: ${error.message}`);
    }
    
    console.log('====================================\n');
    
    return { success: false, error: error.message };
  }
}

/**
 * Run all test messages sequentially
 */
async function testAllMessages() {
  console.log('\n🚀 ========== RUNNING FULL TEST SUITE ==========');
  
  for (const message of TEST_MESSAGES) {
    await testWebhook(message);
    // Wait 1 second between tests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n📊 ========== TEST SUITE COMPLETE ==========');
  console.log('   Check your database and server logs!');
  console.log('   PostgreSQL: SELECT * FROM messages;');
  console.log('============================================\n');
}

// If this script is run directly
if (require.main === module) {
  // Get message from command line argument
  const customMessage = process.argv[2];
  
  if (customMessage) {
    testWebhook(customMessage);
  } else {
    // Run all tests if no custom message provided
    testAllMessages();
  }
}

// Export for use in other files
module.exports = { testWebhook, testAllMessages };