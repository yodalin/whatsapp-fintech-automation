import { pool } from '../config/database';
import { Conversation, CreateConversationDTO } from '../models/conversation.model';

export class ConversationService {
  
  static async findOrCreate(whatsappNumber: string): Promise<Conversation> {
    try {
      // Find existing open conversation
      const existing = await pool.query(
        `SELECT * FROM conversations 
         WHERE whatsapp_number = $1 AND status = 'open' 
         ORDER BY created_at DESC LIMIT 1`,
        [whatsappNumber]
      );

      if (existing.rows.length > 0) {
        console.log(`📞 Found conversation: ${existing.rows[0].id}`);
        return existing.rows[0];
      }

      // Create new conversation
      const newConversation: CreateConversationDTO = {
        whatsapp_number: whatsappNumber,
        status: 'open'
      };

      const created = await pool.query(
        `INSERT INTO conversations (whatsapp_number, status)
         VALUES ($1, $2)
         RETURNING *`,
        [newConversation.whatsapp_number, newConversation.status]
      );

      console.log(`🆕 Created conversation: ${created.rows[0].id}`);
      return created.rows[0];
      
    } catch (error) {
      console.error('❌ Conversation service error:', error);
      throw error;
    }
  }

  static async close(conversationId: string): Promise<void> {
    await pool.query(
      `UPDATE conversations 
       SET status = 'closed', updated_at = NOW() 
       WHERE id = $1`,
      [conversationId]
    );
    console.log(`🔒 Closed conversation: ${conversationId}`);
  }
}