import express from "express";
import cors from "cors";
import webhookRoutes from "./routes/webhook.routes";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "whatsapp-fintech-automation",
    environment: process.env.NODE_ENV || "development",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api", webhookRoutes);

export default app;
