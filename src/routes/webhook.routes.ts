import { Router } from "express";
import {
  verifyWebhook,
  receiveMessage
} from "../controllers/webhook.controller";

const router = Router();

// Meta verification
router.get("/webhook", verifyWebhook);

// Incoming messages
router.post("/webhook", receiveMessage);

export default router;
