export interface Conversation {
  id: string;
  whatsapp_number: string;
  status: 'open' | 'closed' | 'pending';
  created_at: Date;
  updated_at: Date;
}

export interface CreateConversationDTO {
  whatsapp_number: string;
  status?: 'open' | 'closed' | 'pending';
}

export interface UpdateConversationDTO {
  status?: 'open' | 'closed' | 'pending';
}