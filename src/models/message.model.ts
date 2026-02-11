export interface Message {
  id: string;
  conversation_id: string;
  sender: string;
  message_type: 'text' | 'image' | 'audio' | 'video' | 'document';
  content: string;
  raw_payload: any;
  created_at: Date;
}

export interface CreateMessageDTO {
  conversation_id: string;
  sender: string;
  message_type?: 'text' | 'image' | 'audio' | 'video' | 'document';
  content: string;
  raw_payload: any;
}