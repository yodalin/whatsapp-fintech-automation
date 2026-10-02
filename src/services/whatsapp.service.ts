import axios from 'axios';
import { config } from '../config/environment';

// Define the AxiosError type locally
interface AxiosError<T = any> {
  response?: {
    data?: T;
    status: number;
    headers: any;
  };
  message: string;
  code?: string;
  config?: any;
  request?: any;
}

// Update to match all intents from NLP
export type FintechIntent = 
  | 'transfer' 
  | 'balance_inquiry' 
  | 'transaction_history' 
  | 'loan_inquiry'
  | 'bill_payment'
  | 'airtime_topup'
  | 'account_management'
  | 'customer_support'
  | 'greeting'
  | 'help' 
  | 'default';

// Response template interface
interface ResponseTemplates {
  transfer: string;
  balance_inquiry: string;
  transaction_history: string;
  loan_inquiry: string;
  bill_payment: string;
  airtime_topup: string;
  account_management: string;
  customer_support: string;
  greeting: string;
  help: string;
  default: string;
}

// WhatsApp API response types
interface WhatsAppMessageResponse {
  messages: [{ id: string }];
}

interface TypingResponse {
  success: boolean;
}

export class WhatsAppService {
  private static readonly API_URL = `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  private static readonly MOCK_MODE = process.env.WHATSAPP_MOCK_MODE === 'true';

  /**
   * Send a WhatsApp message via Meta Cloud API
   * Falls back to mock mode if enabled or if credentials missing
   */
  static async sendMessage(to: string, message: string): Promise<void> {
    if (this.MOCK_MODE || !process.env.WHATSAPP_ACCESS_TOKEN) {
      return this.sendMockMessage(to, message);
    }

    try {
      const response = await axios.post<WhatsAppMessageResponse>(
        this.API_URL,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('\n📤 ===== WHATSAPP API MESSAGE SENT =====');
      console.log(`   To: ${to}`);
      console.log(`   Message ID: ${response.data.messages?.[0]?.id}`);
      console.log('========================================\n');

    } catch (error) {
      const err = error as any;
      console.error('❌ WhatsApp API Error:', 
        err.response?.data?.error?.message || err.message
      );
      
      console.log('⚠️  Falling back to mock mode...');
      await this.sendMockMessage(to, message);
    }
  }

  /**
   * Mock mode for development
   */
  private static async sendMockMessage(to: string, message: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800));

    console.log('\n📤 ===== WHATSAPP MOCK MESSAGE =====');
    console.log(`   To: ${to}`);
    console.log(`   Message: "${message.substring(0, 100)}${message.length > 100 ? '...' : ''}"`);
    console.log(`   Time: ${new Date().toLocaleTimeString()}`);
    console.log(`   Mode: 🧪 Mock`);
    console.log('====================================\n');
  }

  /**
   * Send typing indicator
   */
  static async sendTypingIndicator(to: string): Promise<void> {
    if (this.MOCK_MODE) {
      console.log(`✏️  Bot typing to ${to}...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      return;
    }

    try {
      await axios.post<TypingResponse>(
        this.API_URL,
        {
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'typing',
          typing: { action: 'typing_on' }
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } catch (error) {
      // Silently fail - typing indicator is optional
    }
  }

  /**
   * Format fintech response with professional branding
   */
  static formatFintechResponse(intent: string, data?: any): string {
    const timestamp = new Date().toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    const date = new Date().toLocaleDateString();
    const confidence = data?.confidence || 1;
    const confidenceEmoji = confidence > 0.8 ? '🎯' : confidence > 0.5 ? '📌' : '🤔';

    const responses: ResponseTemplates = {
      transfer: `✅ *Transfer Initiated* ${confidenceEmoji}\n\n` +
                `📤 Amount: ${data?.currency || 'ETB'} ${data?.amount || 0}\n` +
                `🏦 Account: ${data?.account || 'Savings'}\n` +
                `🆔 Ref: ${Math.random().toString(36).substring(7).toUpperCase()}\n` +
                `⏱️  Time: ${timestamp}\n\n` +
                `_You'll receive confirmation shortly._`,

      balance_inquiry: `💰 *Account Summary*\n\n` +
                       `🏦 Savings: ETB 15,750.00\n` +
                       `💳 Checking: ETB 8,420.50\n` +
                       `📊 Total: ETB 24,170.50\n\n` +
                       `📅 Updated: ${date}`,

      transaction_history: `📋 *Recent Transactions*\n\n` +
                          `1. Sent ETB 500 to Savings\n` +
                          `   • ${new Date(Date.now() - 86400000).toLocaleDateString()}\n` +
                          `2. Received ETB 1,200 from Deposit\n` +
                          `   • ${new Date(Date.now() - 172800000).toLocaleDateString()}\n` +
                          `3. Paid ETB 75 Transfer fee\n` +
                          `   • ${new Date(Date.now() - 259200000).toLocaleDateString()}`,

      loan_inquiry: `🏦 *Loan Products*\n\n` +
                    `• Personal Loan: 7-15% interest\n` +
                    `• Business Loan: 9-18% interest\n` +
                    `• Emergency Loan: Same day approval\n\n` +
                    `_Reply with "apply [type]" to start application_`,

      bill_payment: `💡 *Bill Payment*\n\n` +
                    `📋 Bill Type: ${data?.bill_type || 'Utility'}\n` +
                    `💰 Amount: ${data?.currency || 'ETB'} ${data?.amount || 0}\n` +
                    `🆔 Reference: ${Math.random().toString(36).substring(7).toUpperCase()}\n\n` +
                    `✅ Payment scheduled for ${timestamp}`,

      airtime_topup: `📱 *Airtime Top-up*\n\n` +
                     `📞 Phone: ${data?.phone_number || 'Your number'}\n` +
                     `💰 Amount: ${data?.currency || 'ETB'} ${data?.amount || 0}\n` +
                     `Status: Processing\n\n` +
                     `_You'll receive confirmation via SMS_`,

      account_management: `⚙️ *Account Management*\n\n` +
                          `What would you like to update?\n` +
                          `• PIN (reply "change pin")\n` +
                          `• Phone number (reply "update phone")\n` +
                          `• Address (reply "update address")`,

      customer_support: `👋 *Customer Support*\n\n` +
                        `An agent will respond within 5 minutes.\n` +
                        `Your ticket ID: ${Math.random().toString(36).substring(7).toUpperCase()}\n\n` +
                        `_For urgent issues, call 800-123-4567_`,

      greeting: `👋 *Welcome to Fintech Bot!*\n\n` +
                `I can help you with:\n` +
                `• Send money (e.g., "Send 500 to savings")\n` +
                `• Check balance (e.g., "What's my balance?")\n` +
                `• Pay bills (e.g., "Pay electricity 850")\n` +
                `• Buy airtime (e.g., "Buy 100 for 0912345678")\n` +
                `• Get help (e.g., "Help")\n\n` +
                `_How can I assist you today?_`,

      help: `🤝 *Available Commands*\n\n` +
            `• Send [amount] to [account]\n` +
            `• Check balance\n` +
            `• Transaction history\n` +
            `• Pay [bill] [amount]\n` +
            `• Buy airtime [amount] for [phone]\n` +
            `• Apply for loan\n` +
            `• Talk to agent\n\n` +
            `_24/7 Automated Support_`,

      default: `👋 *Message Received*\n\n` +
               `Your request is being processed.\n` +
               `Reference: ${Math.random().toString(36).substring(7).toUpperCase()}\n\n` +
               `_We'll respond within minutes._`
    };

    const validIntent = this.validateIntent(intent);
    return responses[validIntent];
  }

  /**
   * Validate and normalize intent string
   */
  private static validateIntent(intent: string): FintechIntent {
    const validIntents: FintechIntent[] = [
      'transfer', 
      'balance_inquiry', 
      'transaction_history', 
      'loan_inquiry',
      'bill_payment',
      'airtime_topup',
      'account_management',
      'customer_support',
      'greeting',
      'help', 
      'default'
    ];
    
    if (validIntents.includes(intent as FintechIntent)) {
      return intent as FintechIntent;
    }
    
    return 'default';
  }
}