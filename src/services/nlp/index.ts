import { OpenAIService } from './providers/openai.service';
import { RegexService } from './providers/regex.service';
import { NLPResult } from './models/entity.types';

export class NLPService {
  // TEMPORARY FIX: Set to false until OpenAI key is fixed
  private static useOpenAI = false;  // ← Changed from true to false

  static initialize() {
    // Don't initialize OpenAI for now
    // OpenAIService.initialize();
    console.log('🔧 Using Regex-only mode (OpenAI disabled)');
  }

  static async extract(message: string): Promise<NLPResult> {
    const startTime = Date.now();

    // Skip OpenAI, use regex directly
    const regexResult = RegexService.extract(message);
    console.log(`🔧 Regex: ${regexResult.intent.intent} (${(regexResult.confidence * 100).toFixed(0)}%)`);
    
    return regexResult;
  }

  static explain(result: NLPResult): string {
    const lines = [
      `📊 NLP Analysis:`,
      `  Intent: ${result.intent.intent} (${(result.intent.confidence * 100).toFixed(1)}%)`,
      `  Source: ${result.intent.source}`,
      `  Language: ${result.language}`,
      `  Time: ${result.processing_time_ms}ms`,
      `  Entities:`
    ];

    Object.entries(result.entities).forEach(([type, entities]) => {
      entities.forEach(e => {
        lines.push(`    • ${type}: ${e.value} (${(e.confidence * 100).toFixed(0)}%)`);
      });
    });

    return lines.join('\n');
  }
}

// Initialize
NLPService.initialize();