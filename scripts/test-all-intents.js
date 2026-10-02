const axios = require('axios');

// USE THIS IP - it's your current network address
const SERVER_URL = 'http://172.25.192.1:3001';
const WEBHOOK_URL = `${SERVER_URL}/api/webhook`;

const testMessages = [
  // Transfer intents
  { desc: "Transfer to savings", msg: "Send 500 ETB to savings" },
  { desc: "Transfer to checking", msg: "Transfer 1000 to checking" },
  
  // Balance inquiries
  { desc: "Balance check", msg: "What's my balance?" },
  { desc: "Balance check (alt)", msg: "How much money do I have?" },
  
  // Transaction history
  { desc: "Transaction history", msg: "Show my transactions" },
  { desc: "Recent activity", msg: "What did I spend last week?" },
  
  // Bill payments
  { desc: "Electricity bill", msg: "Pay electricity bill 850 birr" },
  { desc: "Water bill", msg: "Pay water bill 300" },
  { desc: "Internet bill", msg: "Pay internet 1200" },
  
  // Airtime top-up
  { desc: "Airtime purchase", msg: "Buy airtime 100 for 0912345678" },
  { desc: "Airtime (alt)", msg: "Top up 50 ETB" },
  
  // Loan inquiries
  { desc: "Loan inquiry", msg: "I need a loan" },
  { desc: "Loan rates", msg: "What are your loan interest rates?" },
  
  // Account management
  { desc: "Update account", msg: "Change my PIN" },
  { desc: "Account help", msg: "Update my phone number" },
  
  // Customer support
  { desc: "Help request", msg: "Talk to an agent" },
  { desc: "Support", msg: "I need help with my account" },
  
  // Greetings
  { desc: "Greeting (English)", msg: "Hello" },
  { desc: "Greeting (Amharic)", msg: "ሰላም" },
  { desc: "Greeting (morning)", msg: "Good morning" },
  
  // Complex messages
  { desc: "Complex transfer", msg: "I want to send 2,500 birr to my savings account tomorrow morning" },
  { desc: "Mixed request", msg: "Can you help me? I need to check my balance and also pay my electricity bill" },
];

async function testAllIntents() {
  console.log('\n🧪 ===== TESTING ALL NLP INTENTS =====\n');
  console.log(`🔗 Webhook URL: ${WEBHOOK_URL}\n`);

  let success = 0;
  let failed = 0;

  for (let i = 0; i < testMessages.length; i++) {
    const { desc, msg } = testMessages[i];
    
    console.log(`[${i + 1}/${testMessages.length}] 📨 ${desc}: "${msg}"`);
    
    try {
      const start = Date.now();
      
      await axios.post(WEBHOOK_URL, {
        entry: [{
          changes: [{
            value: {
              messages: [{
                from: '251911223344',
                type: 'text',
                text: { body: msg }
              }]
            }
          }]
        }]
      }, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 5000
      });
      
      const time = Date.now() - start;
      console.log(`   ✅ Sent (${time}ms)`);
      success++;
      
    } catch (error) {
      console.log(`   ❌ Failed: ${error.message}`);
      failed++;
    }
    
    console.log('---');
    
    // Wait 1.5 seconds between tests
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log('\n📊 ===== TEST RESULTS =====');
  console.log(`✅ Successful: ${success}/${testMessages.length}`);
  console.log(`❌ Failed: ${failed}/${testMessages.length}`);
  console.log('\n👉 Check your server logs above for NLP results!\n');
}

testAllIntents();