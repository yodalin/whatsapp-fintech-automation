/**
 * Core intent types for fintech operations
 * Each intent represents a specific user action
 */
export type FintechIntent = 
  | 'transfer'           // Send money to someone
  | 'balance_inquiry'    // Check account balance
  | 'transaction_history' // View past transactions
  | 'loan_inquiry'       // Ask about loans
  | 'bill_payment'       // Pay utility bills
  | 'airtime_topup'      // Buy mobile airtime
  | 'account_management' // Update account settings
  | 'customer_support'   // Need human help
  | 'greeting'           // Hello, hi, start conversation
  | 'unknown';           // Could not determine

/**
 * Intent detection result with confidence score
 */
export interface IntentResult {
  intent: FintechIntent;
  confidence: number;  // 0.0 to 1.0
  source: 'openai' | 'regex' | 'fallback';
}

/**
 * Human-readable descriptions (for logging/debugging)
 */
export const INTENT_DESCRIPTIONS: Record<FintechIntent, string> = {
  transfer: 'User wants to send money',
  balance_inquiry: 'User wants to check balance',
  transaction_history: 'User wants to see transactions',
  loan_inquiry: 'User asks about loans',
  bill_payment: 'User wants to pay bills',
  airtime_topup: 'User wants to buy airtime',
  account_management: 'User wants to manage account',
  customer_support: 'User needs human assistance',
  greeting: 'User says hello',
  unknown: 'Intent unclear'
};

/**
 * Example phrases for each intent (for testing)
 */
export const INTENT_EXAMPLES: Record<FintechIntent, string[]> = {
  transfer: [
    'Send 500 ETB to savings',
    'Transfer money to my checking account',
    'Pay 1000 to John',
    'ውሰድ 500 ብር ወደ ቁጠባ'
  ],
  balance_inquiry: [
    'What is my balance?',
    'How much money do I have?',
    'Show my account balance',
    'ሂሳቤ ስንት ነው?'
  ],
  transaction_history: [
    'Show my transactions',
    'Recent activity',
    'What did I spend last week?',
    'እንቅስቃሴዬ አሳይ'
  ],
  loan_inquiry: [
    'Can I get a loan?',
    'Loan interest rates',
    'How to borrow money',
    'ብድር ፈልጋለሁ'
  ],
  bill_payment: [
    'Pay electricity bill',
    'Water bill payment',
    'Pay 850 birr for internet',
    'የኤሌክትሪክ ክፍያ'
  ],
  airtime_topup: [
    'Buy airtime',
    'Top up 100 ETB',
    'Recharge 0912345678',
    'አየር ሰዓት'
  ],
  account_management: [
    'Change my PIN',
    'Update phone number',
    'Close account',
    'መለያዬን ለውጥ'
  ],
  customer_support: [
    'Talk to agent',
    'Need help',
    'Customer service',
    'እርዳታ'
  ],
  greeting: [
    'Hi',
    'Hello',
    'Good morning',
    'ሰላም'
  ],
  unknown: []
};