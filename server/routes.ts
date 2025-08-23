import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import { storage } from "./storage";
import { whatsappBot } from "./services/whatsapp-bot";
import { insertBotConfigSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Setup WebSocket for real-time updates on a different path to avoid Vite conflicts
  const wss = new WebSocketServer({ 
    server: httpServer,
    path: '/api/ws'
  });
  
  wss.on('connection', (ws) => {
    console.log('Client connected for real-time updates');
    
    ws.on('close', () => {
      console.log('Client disconnected');
    });
  });

  // Broadcast logs to all connected clients
  const broadcastLog = (log: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) { // WebSocket.OPEN
        client.send(JSON.stringify({ type: 'log', data: log }));
      }
    });
  };

  // Broadcast status updates
  const broadcastStatus = (status: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify({ type: 'status', data: status }));
      }
    });
  };

  // Bot configuration endpoints
  app.get("/api/bot/config", async (req, res) => {
    try {
      const config = await storage.getBotConfig();
      res.json(config || {});
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot configuration" });
    }
  });

  app.post("/api/bot/config", async (req, res) => {
    try {
      const validatedConfig = insertBotConfigSchema.parse(req.body);
      const config = await storage.updateBotConfig(validatedConfig);
      res.json(config);
    } catch (error) {
      res.status(400).json({ error: "Invalid configuration data" });
    }
  });

  // Bot control endpoints
  app.post("/api/bot/start", async (req, res) => {
    try {
      await whatsappBot.start();
      const status = whatsappBot.getStatus();
      broadcastStatus(status);
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ error: "Failed to start bot" });
    }
  });

  app.post("/api/bot/stop", async (req, res) => {
    try {
      await whatsappBot.stop();
      const status = whatsappBot.getStatus();
      broadcastStatus(status);
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ error: "Failed to stop bot" });
    }
  });

  app.post("/api/bot/restart", async (req, res) => {
    try {
      await whatsappBot.restart();
      const status = whatsappBot.getStatus();
      broadcastStatus(status);
      res.json({ success: true, status });
    } catch (error) {
      res.status(500).json({ error: "Failed to restart bot" });
    }
  });

  // Bot status endpoint
  app.get("/api/bot/status", async (req, res) => {
    try {
      const status = whatsappBot.getStatus();
      res.json(status);
    } catch (error) {
      res.status(500).json({ error: "Failed to get bot status" });
    }
  });

  // QR Code endpoint
  app.get("/api/bot/qr", async (req, res) => {
    try {
      const qrCode = whatsappBot.getQRCode();
      if (qrCode) {
        res.json({ qrCode });
      } else {
        res.json({ qrCode: null, message: "QR code not available" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to get QR code" });
    }
  });

  // Logs endpoints
  app.get("/api/bot/logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;
      const logs = await storage.getBotLogs(limit);
      res.json(logs);
    } catch (error) {
      res.status(500).json({ error: "Failed to get logs" });
    }
  });

  app.delete("/api/bot/logs", async (req, res) => {
    try {
      await storage.clearBotLogs();
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to clear logs" });
    }
  });

  // Statistics endpoint
  app.get("/api/bot/stats", async (req, res) => {
    try {
      const stats = await storage.getBotStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to get statistics" });
    }
  });

  return httpServer;
}
