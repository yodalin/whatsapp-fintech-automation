import { Request, Response } from "express";

export const verifyWebhook = (req: Request, res: Response) => {
  const mode = req.query["hub.mode"];
  const token = req.query["hub.verify_token"];
  const challenge = req.query["hub.challenge"];

  if (
    mode === "subscribe" &&
    token === process.env.WHATSAPP_VERIFY_TOKEN
  ) {
    console.log("✅ Webhook verified");
    return res.status(200).send(challenge);
  }

  return res.sendStatus(403);
};

export const receiveMessage = (req: Request, res: Response) => {
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const value = change?.value;

  const message = value?.messages?.[0];

  if (message) {
    const from = message.from;
    const text = message.text?.body;

    console.log("📩 New WhatsApp message");
    console.log("From:", from);
    console.log("Text:", text);
  }

  res.sendStatus(200);
};
