import { IntentResult, FintechIntent } from '../models/intent.types';
import { ExtractedEntities, NLPResult, ENTITY_PATTERNS } from '../models/entity.types';

export class RegexService {
  
  private static intentPatterns: Record<string, RegExp[]> = {
    transfer: [
      /send|transfer|pay|ላክ|ክፈል/i,
      /to\s+(.+?)(?:\s+account)?$/i
    ],
    balance_inquiry: [
      /balance|how much|ሂሳብ|ቀሪ/i,
      /what.*(left|have)/i
    ],
    transaction_history: [
      /history|transaction|statement|ታሪክ|እንቅስቃሴ/i,
      /recent|last.*(day|week|month)/i
    ],
    loan_inquiry: [
      /loan|ብድር/i,
      /borrow|credit/i
    ],
    bill_payment: [
      /bill|electric|water|internet|ክፍያ/i,
      /pay.*(electric|water|internet)/i
    ],
    airtime_topup: [
      /airtime|top[- ]?up|ማይል/i,
      /buy.*(credit|airtime)/i
    ],
    account_management: [
      /update|change|reset|አዘምን/i,
      /register|open.*account/i
    ],
    customer_support: [
      /help|support|agent|እገዛ/i,
      /speak.*human|talk.*person/i
    ],
    greeting: [
      /hi|hello|hey|selam|ሰላም/i,
      /good (morning|afternoon|evening)/i
    ]
  };

  static detectIntent(message: string): IntentResult {
    const lowercase = message.toLowerCase();
    let highestScore = 0;
    let detectedIntent: FintechIntent = 'unknown';

    for (const [intent, patterns] of Object.entries(this.intentPatterns)) {
      let matches = 0;
      patterns.forEach(pattern => {
        if (pattern.test(lowercase)) matches++;
      });

      if (matches > 0) {
        const score = matches / patterns.length;
        if (score > highestScore) {
          highestScore = score;
          detectedIntent = intent as FintechIntent;
        }
      }
    }

    return {
      intent: detectedIntent,
      confidence: Math.min(highestScore + 0.2, 0.9),
      source: 'regex'
    };
  }

  static extractEntities(message: string): ExtractedEntities {
    const entities: ExtractedEntities = {};

    Object.entries(ENTITY_PATTERNS).forEach(([type, pattern]) => {
      // FIX: Create a global version of the pattern for matchAll
      const globalPattern = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');
      const matches = [...message.matchAll(globalPattern)];
      
      if (matches.length > 0) {
        entities[type] = matches.map((match, index) => ({
          type: type as any,
          value: match[1] || match[0],
          confidence: 0.8 - (index * 0.1),
          normalized: this.normalizeValue(type, match[1] || match[0])
        }));
      }
    });

    return entities;
  }

  private static normalizeValue(type: string, value: string): any {
    switch (type) {
      case 'amount':
        return parseFloat(value.replace(/,/g, ''));
      case 'currency':
        return value.toUpperCase();
      default:
        return value;
    }
  }

  static extract(message: string): NLPResult {
    const startTime = Date.now();
    const intent = this.detectIntent(message);
    const entities = this.extractEntities(message);

    return {
      intent,
      entities,
      raw_text: message,
      language: message.match(/[ሀ-ፐ]/) ? 'amharic' : 'english',
      processing_time_ms: Date.now() - startTime,
      confidence: intent.confidence
    };
  }
}