import { Request, Response } from 'express';
import { ConversationService } from '../services/conversation.service';
import { MessageService } from '../services/message.service';
import { WhatsAppService } from '../services/whatsapp.service';
import { NLPService } from '../services/nlp';
import { config } from '../config/environment';

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
};

export const receiveMessage = async (req: Request, res: Response) => {
  const startTime = Date.now();
  
  try {
    const message = req.body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
    if (!message) return res.sendStatus(200);

    const from = message.from;
    const text = message.text?.body || '';

    console.log('\n' + '='.repeat(60));
    console.log(`📨 INCOMING [${new Date().toISOString()}]`);
    console.log(`From: ${from}`);
    console.log(`Message: "${text}"`);
    console.log('-'.repeat(60));

    // Database persistence
    const conversation = await ConversationService.findOrCreate(from);
    await MessageService.create({
      conversation_id: conversation.id,
      sender: from,
      content: text,
      raw_payload: message
    });

    // NLP Extraction
    const nlpResult = await NLPService.extract(text);
    console.log(NLPService.explain(nlpResult));

    // Generate response based on intent
    const responseText = WhatsAppService.formatFintechResponse(
      nlpResult.intent.intent,
      {
        amount: nlpResult.entities.amount?.[0]?.normalized,
        currency: nlpResult.entities.currency?.[0]?.value || 'ETB',
        account: nlpResult.entities.account_type?.[0]?.value,
        confidence: nlpResult.confidence
      }
    );

    // Send reply
    await WhatsAppService.sendTypingIndicator(from);
    await WhatsAppService.sendMessage(from, responseText);

    // Save bot response
    await MessageService.create({
      conversation_id: conversation.id,
      sender: 'bot',
      content: responseText,
      raw_payload: { 
        intent: nlpResult.intent,
        processing_time: Date.now() - startTime 
      }
    });

    console.log('-'.repeat(60));
    console.log(`✅ COMPLETE | Time: ${Date.now() - startTime}ms`);
    console.log('='.repeat(60) + '\n');

    res.sendStatus(200);
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.sendStatus(500);
  }
};