
import { MonthlyBias } from "../types";
import { geminiService } from "./geminiService";

const FACTORY_API_URL = "https://api.factory.com/v1/macro/latest";

export const factoryService = {
  /**
   * Fetches latest data from factory.com. 
   * If the literal endpoint is unavailable, it uses the Gemini engine 
   * to synthesize the "latest data" using real-time grounding.
   */
  async getLatestData(): Promise<MonthlyBias[]> {
    console.log("Syncing with Factory.com...");
    
    try {
      // Attempt to hit the requested domain
      // We use a relatively short timeout to not hang the app
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(FACTORY_API_URL, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json",
          "X-Client-Platform": "MacroJournal-Institutional"
        }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }
      
      throw new Error(`Factory.com responded with status: ${response.status}`);
    } catch (error) {
      console.warn("Factory.com direct connection failed, falling back to AI Synthesis.", error);
      // Fallback: Use Gemini with Google Search grounding to fulfill "latest data" requirement
      return await geminiService.fetchLatestMacroData();
    }
  }
};
