import { type User, type InsertUser, type BotConfig, type InsertBotConfig, type BotLog, type InsertBotLog, type BotStats } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getBotConfig(): Promise<BotConfig | undefined>;
  updateBotConfig(config: InsertBotConfig): Promise<BotConfig>;
  
  addBotLog(log: InsertBotLog): Promise<BotLog>;
  getBotLogs(limit?: number): Promise<BotLog[]>;
  clearBotLogs(): Promise<void>;
  
  getBotStats(): Promise<BotStats | undefined>;
  updateBotStats(stats: Partial<BotStats>): Promise<BotStats>;
  incrementStat(field: 'messagesProcessed' | 'promosDetected' | 'aiResponses'): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private botConfig: BotConfig | undefined;
  private botLogs: BotLog[];
  private botStats: BotStats | undefined;

  constructor() {
    this.users = new Map();
    this.botLogs = [];
    
    // Initialize default bot stats
    this.botStats = {
      id: randomUUID(),
      messagesProcessed: 0,
      promosDetected: 0,
      aiResponses: 0,
      startTime: new Date(),
      lastActivity: new Date(),
    };
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getBotConfig(): Promise<BotConfig | undefined> {
    return this.botConfig;
  }

  async updateBotConfig(config: InsertBotConfig): Promise<BotConfig> {
    const id = this.botConfig?.id || randomUUID();
    this.botConfig = {
      ...config,
      id,
      isActive: false,
      createdAt: this.botConfig?.createdAt || new Date(),
      openrouterApiKey: config.openrouterApiKey || null,
      targetGroupId: config.targetGroupId || null,
      forwardToGroupId: config.forwardToGroupId || null,
    };
    return this.botConfig;
  }

  async addBotLog(log: InsertBotLog): Promise<BotLog> {
    const newLog: BotLog = {
      ...log,
      id: randomUUID(),
      timestamp: new Date(),
    };
    this.botLogs.unshift(newLog); // Add to beginning for latest first
    
    // Keep only last 100 logs
    if (this.botLogs.length > 100) {
      this.botLogs = this.botLogs.slice(0, 100);
    }
    
    return newLog;
  }

  async getBotLogs(limit = 50): Promise<BotLog[]> {
    return this.botLogs.slice(0, limit);
  }

  async clearBotLogs(): Promise<void> {
    this.botLogs = [];
  }

  async getBotStats(): Promise<BotStats | undefined> {
    return this.botStats;
  }

  async updateBotStats(stats: Partial<BotStats>): Promise<BotStats> {
    if (this.botStats) {
      this.botStats = { ...this.botStats, ...stats, lastActivity: new Date() };
    }
    return this.botStats!;
  }

  async incrementStat(field: 'messagesProcessed' | 'promosDetected' | 'aiResponses'): Promise<void> {
    if (this.botStats) {
      this.botStats[field] = (this.botStats[field] || 0) + 1;
      this.botStats.lastActivity = new Date();
    }
  }
}

export const storage = new MemStorage();
