import { Request, Response } from 'express';
import { ConversationService } from '../services/conversation.service';
import { MessageService } from '../services/message.service';
import { config } from '../config/environment';

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === config.whatsapp.verifyToken) {
    console.log('✅ Webhook verified');
    res.status(200).send(challenge);
  } else {
    console.log('❌ Webhook verification failed');
    res.sendStatus(403);
  }
};

export const receiveMessage = async (req: Request, res: Response) => {
  try {
    const entry = req.body.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const message = value?.messages?.[0];

    if (!message) {
      console.log('📭 No message in webhook payload');
      return res.sendStatus(200);
    }

    const from = message.from;
    const text = message.text?.body || '';
    const messageType = message.type || 'text';

    console.log('📨 Incoming WhatsApp message:', {
      from,
      type: messageType,
      content: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
      timestamp: new Date().toISOString()
    });

    // ==== DATABASE PERSISTENCE ====
    // 1. Find or create conversation
    const conversation = await ConversationService.findOrCreate(from);
    
    // 2. Save the message
    await MessageService.create({
      conversation_id: conversation.id,
      sender: from,
      message_type: messageType,
      content: text,
      raw_payload: message
    });
    // ==== END DATABASE PERSISTENCE ====

    // TODO: NLP processing will go here
    // TODO: Automation rules will go here
    // TODO: Fintech actions will go here

    res.sendStatus(200);
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.sendStatus(500);
  }
};