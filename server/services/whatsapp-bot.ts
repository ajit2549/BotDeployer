import pkg from "whatsapp-web.js";
const { Client, LocalAuth } = pkg;
import qrcode from "qrcode";
import fetch from "node-fetch";
import Tesseract from "tesseract.js";
import { storage } from "../storage";

interface BotStatus {
  isRunning: boolean;
  isAuthenticated: boolean;
  qrCode: string | null;
  error: string | null;
}

export class WhatsAppBotService {
  private client: any = null;
  private status: BotStatus = {
    isRunning: false,
    isAuthenticated: false,
    qrCode: null,
    error: null,
  };
  private conversations: { [key: string]: { last: number; history: any[] } } = {};
  private readonly CONTEXT_WINDOW = 2 * 60 * 1000; // 2 minutes

  constructor() {
    this.setupClient();
  }

  private async setupClient() {
    try {
      this.client = new Client({
        authStrategy: new LocalAuth(),
        puppeteer: {
          headless: true,
          args: ["--no-sandbox", "--disable-setuid-sandbox"],
        },
      });

      this.client.on("qr", async (qr: string) => {
        try {
          const qrDataUrl = await qrcode.toDataURL(qr);
          this.status.qrCode = qrDataUrl;
          this.status.error = null;
          await storage.addBotLog({ level: "info", message: "QR Code generated. Ready for scanning." });
        } catch (err) {
          console.error("QR generation error:", err);
          await storage.addBotLog({ level: "error", message: "Failed to generate QR code" });
        }
      });

      this.client.on("ready", async () => {
        this.status.isAuthenticated = true;
        this.status.qrCode = null;
        this.status.error = null;
        await storage.addBotLog({ level: "success", message: "✅ Bot is ready!" });
        await storage.addBotLog({ level: "info", message: `🤖 Bot ID: ${this.client.info.wid._serialized}` });
      });

      this.client.on("auth_failure", async () => {
        this.status.error = "Authentication failed";
        await storage.addBotLog({ level: "error", message: "❌ Authentication failed" });
      });

      this.client.on("disconnected", async () => {
        this.status.isAuthenticated = false;
        this.status.isRunning = false;
        await storage.addBotLog({ level: "warn", message: "🔌 Bot disconnected" });
      });

      this.client.on("message", this.handleMessage.bind(this));

    } catch (error) {
      console.error("Bot setup error:", error);
      this.status.error = "Failed to setup bot";
      await storage.addBotLog({ level: "error", message: "Failed to setup WhatsApp client" });
    }
  }

  private async handleMessage(msg: any) {
    try {
      const config = await storage.getBotConfig();
      if (!config || !config.targetGroupId) return;

      if (msg.from !== config.targetGroupId) return;

      await storage.incrementStat('messagesProcessed');

      const chat = await msg.getChat();
      const botId = this.client.info.wid._serialized;
      const chatId = chat.id._serialized;
      const isTagged = msg.mentionedIds.includes(botId);

      if (isTagged) {
        if (!this.conversations[chatId] || Date.now() - this.conversations[chatId].last > this.CONTEXT_WINDOW) {
          this.conversations[chatId] = { last: Date.now(), history: [] };
        }
        this.conversations[chatId].last = Date.now();
        this.conversations[chatId].history.push({ role: "user", content: msg.body });

        const aiReply = await this.generateAIReply(msg.body, this.conversations[chatId].history, config.openrouterApiKey || undefined);
        this.conversations[chatId].history.push({ role: "assistant", content: aiReply });
        await msg.reply(aiReply);
        
        await storage.incrementStat('aiResponses');
        await storage.addBotLog({ level: "info", message: "🤖 AI response generated for user mention" });
        return;
      }

      const isPromo = this.isPromotionalText(msg.body) || (msg.hasMedia && await this.isPromotionalImage(msg));
      if (isPromo && config.forwardToGroupId) {
        const targetChat = await this.client.getChatById(config.forwardToGroupId);
        await msg.forward(targetChat.id._serialized);
        await msg.delete(true);
        
        await storage.incrementStat('promosDetected');
        await storage.addBotLog({ level: "warn", message: "🔍 Promotional message detected and forwarded" });
      }
    } catch (err) {
      console.error("Message handler error:", err);
      await storage.addBotLog({ level: "error", message: "❌ Error processing message" });
    }
  }

  private isPromotionalText(text: string): boolean {
    if (!text) return false;
    const PROMO_KEYWORDS = [
      "free offer","limited time","discount","deal","sale","offer","buy now",
      "special price","hurry up","clearance","lowest price","guarantee","best deal",
      "earn money","quick cash","loan","payday","0% interest","investment opportunity",
      "passive income","credit card","money back","referral bonus","invite & earn",
      "share and win","exclusive access","get started today","promo code","coupon",
      "voucher","join now","limited seats","act fast","don't miss out","only today",
      "expires soon","last chance","register now","limited stock","click here",
      "link in bio","whatsapp me","DM now","guaranteed results","no risk",
      "100% working","secret trick"
    ];
    return PROMO_KEYWORDS.some((kw) => text.toLowerCase().includes(kw));
  }

  private async isPromotionalImage(message: any): Promise<boolean> {
    try {
      const media = await message.downloadMedia();
      if (!media || !media.mimetype.startsWith("image/")) return false;
      const extractedText = await this.extractTextFromImage(media.data);
      return this.isPromotionalText(extractedText);
    } catch (err) {
      console.error("Image check error:", err);
      return false;
    }
  }

  private async extractTextFromImage(base64Image: string): Promise<string> {
    try {
      const buffer = Buffer.from(base64Image, "base64");
      const result = await Tesseract.recognize(buffer, "eng");
      return result.data.text.trim();
    } catch (err) {
      console.error("OCR error:", err);
      return "";
    }
  }

  private async generateAIReply(messageText: string, history: any[] = [], apiKey?: string): Promise<string> {
    try {
      if (!apiKey) {
        return "🤖 Sorry, OpenRouter API key not configured.";
      }

      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          max_tokens: 500,
          messages: [...history, { role: "user", content: messageText }],
        }),
      });

      const data = await response.json() as any;
      if (!response.ok) {
        console.error("OpenRouter API error:", data);
        return "🤖 Sorry, I couldn't process that right now.";
      }
      return data?.choices?.[0]?.message?.content?.trim() || "🤖 Sorry, I couldn't process that right now.";
    } catch (err) {
      console.error("AI reply error:", err);
      return "🤖 Sorry, I couldn't process that right now.";
    }
  }

  async start(): Promise<void> {
    try {
      if (!this.client) {
        await this.setupClient();
      }
      
      this.status.isRunning = true;
      this.status.error = null;
      
      await this.client.initialize();
      await storage.addBotLog({ level: "info", message: "🚀 Bot starting..." });
    } catch (error) {
      console.error("Bot start error:", error);
      this.status.error = "Failed to start bot";
      this.status.isRunning = false;
      await storage.addBotLog({ level: "error", message: "❌ Failed to start bot" });
      throw error;
    }
  }

  async stop(): Promise<void> {
    try {
      if (this.client) {
        await this.client.destroy();
      }
      this.status.isRunning = false;
      this.status.isAuthenticated = false;
      this.status.qrCode = null;
      await storage.addBotLog({ level: "info", message: "🛑 Bot stopped" });
    } catch (error) {
      console.error("Bot stop error:", error);
      await storage.addBotLog({ level: "error", message: "❌ Error stopping bot" });
    }
  }

  async restart(): Promise<void> {
    await this.stop();
    await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
    await this.start();
  }

  getStatus(): BotStatus {
    return { ...this.status };
  }

  getQRCode(): string | null {
    return this.status.qrCode;
  }
}

// Singleton instance
export const whatsappBot = new WhatsAppBotService();
