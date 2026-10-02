import { IntentResult } from './intent.types';  // ← IMPORT THIS!

/**
 * Types of entities we can extract from messages
 */
export type EntityType =
  | 'amount'           // 500, 1000.50
  | 'currency'         // ETB, USD, EUR
  | 'account_type'     // savings, checking, loan
  | 'account_number'   // 334455
  | 'phone_number'     // 0912345678
  | 'date'            // tomorrow, next week
  | 'time_period'     // monthly, yearly
  | 'bill_type'       // electric, water, internet
  | 'loan_term'       // 12 months, 5 years
  | 'interest_rate';  // 7.5%

/**
 * A single extracted entity with metadata
 */
export interface ExtractedEntity {
  type: EntityType;
  value: string | number;
  confidence: number;  // 0.0 to 1.0
  position?: {
    start: number;  // Character position in original text
    end: number;
  };
  normalized?: string | number;  // Standardized format
}

/**
 * Collection of extracted entities by type
 */
export interface ExtractedEntities {
  [key: string]: ExtractedEntity[];
}

/**
 * Complete NLP result for a message
 */
export interface NLPResult {
  intent: IntentResult;  // ← Now this is properly imported
  entities: ExtractedEntities;
  raw_text: string;
  language: 'english' | 'amharic' | 'mixed' | 'unknown';
  processing_time_ms: number;
  confidence: number;  // Overall confidence
}

/**
 * Entity patterns for regex fallback
 */
export const ENTITY_PATTERNS: Record<EntityType, RegExp> = {
  amount: /\b(\d{1,3}(?:,\d{3})*|\d+)(?:\.(\d+))?\b/,
  currency: /\b(ETB|USD|EUR|GBP|ብር)\b/i,
  account_type: /\b(savings?|check(?:ing)?|loan|business|ቁጠባ|ተራ)\b/i,
  account_number: /\b(\d{6,10})\b/,
  phone_number: /\b(?:251|0)?(9\d{8})\b/,
  date: /\b(today|tomorrow|next week|ነገ|ዛሬ)\b/i,
  time_period: /\b(monthly|yearly|daily|ወርሃዊ|አመታዊ)\b/i,
  bill_type: /\b(electric|water|internet|wifi|ኤሌክትሪክ|ውሃ|ኢንተርኔት)\b/i,
  loan_term: /\b(\d+)\s*(month|year|ወር|አመት)s?\b/i,
  interest_rate: /\b(\d+(?:\.\d+)?)%\b/
};