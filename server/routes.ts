import type { Express } from "express";
import { createServer, type Server } from "http";
import * as fs from "fs";
import * as path from "path";
import { getCounterSuggestion, getCoachResponse, getMetaHeroes } from "./gemini";
import { counterRequestSchema, coachRequestSchema } from "@shared/schema";

let championsData: any = null;

function loadChampionsData() {
  if (championsData) return championsData;
  
  const dataPath = path.join(process.cwd(), "client", "public", "data", "champions.json");
  try {
    const data = fs.readFileSync(dataPath, "utf-8");
    championsData = JSON.parse(data);
    return championsData;
  } catch (error) {
    console.error("Error loading champions data:", error);
    return { heroes: [], lanes: [], roles: [] };
  }
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get("/api/heroes", (_req, res) => {
    const data = loadChampionsData();
    res.json(data);
  });

  // Cache for meta heroes (refresh every 24 hours)
  let metaHeroesCache: any = null;
  let metaHeroesCacheTime: number = 0;
  const META_CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  app.get("/api/meta-heroes", async (_req, res) => {
    try {
      const now = Date.now();
      if (metaHeroesCache && now - metaHeroesCacheTime < META_CACHE_DURATION) {
        return res.json(metaHeroesCache);
      }

      const data = loadChampionsData();
      const metaHeroes = await getMetaHeroes(data.heroes);
      
      metaHeroesCache = metaHeroes;
      metaHeroesCacheTime = now;
      
      res.json(metaHeroes);
    } catch (error) {
      console.error("Meta heroes error:", error);
      res.status(500).json({ error: "Failed to get meta heroes" });
    }
  });

  app.post("/api/counter", async (req, res) => {
    try {
      const parsed = counterRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }

      const { enemyHeroes, preferredLane } = parsed.data;
      const data = loadChampionsData();
      
      const suggestion = await getCounterSuggestion(enemyHeroes, preferredLane, data.heroes);
      res.json(suggestion);
    } catch (error) {
      console.error("Counter suggestion error:", error);
      res.status(500).json({ error: "Failed to get counter suggestion" });
    }
  });

  app.post("/api/coach", async (req, res) => {
    try {
      const parsed = coachRequestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(400).json({ error: "Invalid request", details: parsed.error.errors });
      }

      const { question, conversationHistory } = parsed.data;
      
      const response = await getCoachResponse(question, conversationHistory);
      res.json(response);
    } catch (error) {
      console.error("Coach response error:", error);
      res.status(500).json({ error: "Failed to get coach response" });
    }
  });

  return httpServer;
}
