import OpenAI from 'openai';
import { 
  FintechIntent, 
  IntentResult, 
  INTENT_DESCRIPTIONS 
} from '../models/intent.types';
import { 
  NLPResult, 
  ExtractedEntities,
  ExtractedEntity 
} from '../models/entity.types';

// Define a custom error type for OpenAI errors
interface OpenAIError {
  message: string;
  code?: string;
  type?: string;
  param?: string;
}

export class OpenAIService {
  private static openai: OpenAI | null = null;
  private static isAvailable = false;
  private static model = process.env.OPENAI_MODEL || 'gpt-3.5-turbo';

  /**
   * Initialize OpenAI with API key
   */
  static initialize(): boolean {
    if (!process.env.OPENAI_API_KEY) {
      console.log('⚠️  OpenAI API key not found. Install from: https://platform.openai.com/api-keys');
      return false;
    }

    try {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      });
      this.isAvailable = true;
      console.log('✅ OpenAI initialized successfully');
      return true;
    } catch (error) {
      // Type the error properly
      const err = error as OpenAIError;
      console.error('❌ OpenAI initialization failed:', err.message);
      this.isAvailable = false;
      return false;
    }
  }

  /**
   * Check if OpenAI is available
   */
  static isReady(): boolean {
    return this.isAvailable && this.openai !== null;
  }

  /**
   * Extract intent and entities from message using OpenAI
   */
  static async extract(message: string): Promise<NLPResult | null> {
    if (!this.isReady()) return null;

    const startTime = Date.now();

    try {
      const completion = await this.openai!.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: `You are a fintech NLP extractor for Ethiopian users. 
            Extract intent and entities from WhatsApp messages.
            
            AVAILABLE INTENTS:
            ${Object.entries(INTENT_DESCRIPTIONS).map(([key, desc]) => 
              `- ${key}: ${desc}`
            ).join('\n')}
            
            ENTITIES TO EXTRACT:
            - amount (number): transaction amount (e.g., 500, 1000.50)
            - currency (string): ETB, USD, EUR, or ብር
            - account_type (string): savings, checking, loan, ቁጠባ, ተራ
            - account_number (string): 6-10 digit account number
            - phone_number (string): Ethiopian phone (09... or 2519...)
            - date (string): when to execute (today, tomorrow, next week)
            - bill_type (string): electric, water, internet, wifi
            - loan_term (string): e.g., "12 months", "5 years"
            - interest_rate (number): e.g., 7.5
            
            Return JSON only with this structure:
            {
              "intent": "intent_name",
              "confidence": 0.95,
              "entities": {
                "amount": [{"value": 500, "confidence": 1.0}],
                "currency": [{"value": "ETB", "confidence": 1.0}]
              },
              "language": "english or amharic"
            }`
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      });

      const response = completion.choices[0].message.content;
      if (!response) return null;

      const parsed = JSON.parse(response);
      
      const result: NLPResult = {
        intent: {
          intent: parsed.intent || 'unknown',
          confidence: parsed.confidence || 0.7,
          source: 'openai'
        },
        entities: this.transformEntities(parsed.entities || {}),
        raw_text: message,
        language: parsed.language || 'english',
        processing_time_ms: Date.now() - startTime,
        confidence: parsed.confidence || 0.7
      };

      console.log(`🧠 OpenAI: ${result.intent.intent} (${(result.intent.confidence * 100).toFixed(0)}%)`);
      return result;

    } catch (error) {
      // Properly type the error for OpenAI API errors
      const err = error as any;
      
      // Check if it's an OpenAI API error
      if (err.response?.data?.error) {
        const openAIError = err.response.data.error as OpenAIError;
        console.error('❌ OpenAI API error:', openAIError.message);
        
        if (openAIError.code === 'insufficient_quota') {
          console.log('⚠️  OpenAI quota exceeded. Add credits at: https://platform.openai.com/account/billing');
        }
      } 
      // Check if it's a network error
      else if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
        console.error('❌ Network error: Cannot connect to OpenAI API');
      }
      // Generic error
      else {
        console.error('❌ Unexpected error:', err.message || 'Unknown error');
      }
      
      return null;
    }
  }

  /**
   * Transform OpenAI entities to our format
   */
  private static transformEntities(entities: any): ExtractedEntities {
    const result: ExtractedEntities = {};
    
    Object.keys(entities).forEach(key => {
      if (Array.isArray(entities[key])) {
        result[key] = entities[key].map((e: any) => ({
          type: key as any,
          value: e.value,
          confidence: e.confidence || 0.9,
          normalized: e.normalized || e.value
        }));
      } else if (entities[key]) {
        result[key] = [{
          type: key as any,
          value: entities[key].value || entities[key],
          confidence: entities[key].confidence || 0.9,
          normalized: entities[key].normalized || entities[key].value || entities[key]
        }];
      }
    });
    
    return result;
  }

  /**
   * Simple test to verify API is working
   */
  static async testConnection(): Promise<boolean> {
    try {
      const result = await this.extract('Send 500 ETB to savings');
      return result !== null;
    } catch {
      return false;
    }
  }
}