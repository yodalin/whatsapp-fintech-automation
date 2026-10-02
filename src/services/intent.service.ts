// Define intent response interface
export interface IntentData {
  intent: 'transfer' | 'balance' | 'history' | 'help' | 'unknown';
  amount?: number;
  currency?: string;
  account?: string;
}

export class IntentService {
  
  /**
   * Simple keyword-based intent detection
   * In production, this would be replaced with NLP/ML
   */
  static detectIntent(message: string): IntentData {
    const lowercase = message.toLowerCase();
    
    // Detect transfer intent
    if (lowercase.includes('send') || lowercase.includes('transfer')) {
      // Extract amount using regex
      const amountMatch = message.match(/(\d+(?:[.,]\d+)?)/);
      const amount = amountMatch ? parseFloat(amountMatch[1]) : undefined;
      
      // Detect currency
      let currency = 'ETB'; // Default
      if (lowercase.includes('usd')) currency = 'USD';
      if (lowercase.includes('eur')) currency = 'EUR';
      if (lowercase.includes('gbp')) currency = 'GBP';
      
      // Detect account type
      let account = 'default';
      if (lowercase.includes('saving')) account = 'savings';
      if (lowercase.includes('check')) account = 'checking';
      
      return { intent: 'transfer', amount, currency, account };
    }
    
    // Detect balance inquiry
    if (lowercase.includes('balance') || lowercase.includes('how much')) {
      return { intent: 'balance' };
    }
    
    // Detect transaction history
    if (lowercase.includes('history') || lowercase.includes('transaction')) {
      return { intent: 'history' };
    }
    
    // Detect help request
    if (lowercase.includes('help') || lowercase.includes('hi') || lowercase.includes('hello')) {
      return { intent: 'help' };
    }
    
    return { intent: 'unknown' };
  }
}