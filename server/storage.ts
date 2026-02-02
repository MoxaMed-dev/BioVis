import { type Analysis, type InsertAnalysis } from "../shared/schema.ts";
import { v4 as uuidv4 } from "uuid";

export interface IStorage {
  saveAnalysis(analysis: InsertAnalysis): Promise<Analysis>;
  getHistory(): Promise<Analysis[]>;
}

export class MemStorage implements IStorage {
  private analyses: Analysis[] = [];

  async saveAnalysis(analysis: InsertAnalysis): Promise<Analysis> {
    const saved: Analysis = {
      ...analysis,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    this.analyses.unshift(saved);
    return saved;
  }

  async getHistory(): Promise<Analysis[]> {
    return this.analyses;
  }
}

export const storage = new MemStorage();
