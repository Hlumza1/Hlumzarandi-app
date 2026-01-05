
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
    try {
      // In a real vercel deployment, factory.com might be a placeholder
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(FACTORY_API_URL, {
        signal: controller.signal,
        headers: {
          "Accept": "application/json"
        }
      });
      
      clearTimeout(timeoutId);

      if (response.ok) {
        return await response.json();
      }
      throw new Error(`Factory service unreachable (${response.status})`);
    } catch (error) {
      // Fallback to Gemini synthesis which uses Google Search grounding
      return await geminiService.fetchLatestMacroData();
    }
  }
};
