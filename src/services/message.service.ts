import { pool } from '../config/database';

import { Message, CreateMessageDTO } from '../models/message.model';

export class MessageService {
  
  static async create(messageData: CreateMessageDTO): Promise<Message> {
    try {
      const result = await pool.query(
        `INSERT INTO messages 
         (conversation_id, sender, message_type, content, raw_payload)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [
          messageData.conversation_id,
          messageData.sender,
          messageData.message_type || 'text',
          messageData.content,
          JSON.stringify(messageData.raw_payload)
        ]
      );

      console.log(`💾 Message saved (ID: ${result.rows[0].id})`);
      return result.rows[0];
      
    } catch (error) {
      console.error('❌ Message service error:', error);
      throw error;
    }
  }

  static async getByConversation(conversationId: string): Promise<Message[]> {
    const result = await pool.query(
      `SELECT * FROM messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
      [conversationId]
    );
    return result.rows;
  }
}