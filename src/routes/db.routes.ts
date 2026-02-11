import { Router } from 'express';
import { getConversations, getMessages } from '../controllers/db.controller';

const router = Router();

router.get('/conversations', getConversations);
router.get('/messages/:conversationId', getMessages);

export default router;