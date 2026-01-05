
import { MonthlyBias } from "../types";
import { geminiService } from "./geminiService";

export const factoryService = {
  /**
   * Fetches latest macro data. 
   * In this application, we prioritize the Gemini Intelligence Engine with 
   * Search Grounding as it provides real-time institutional context.
   */
  async getLatestData(): Promise<MonthlyBias[]> {
    try {
      // Prioritize the engine synthesis for live info
      const latest = await geminiService.fetchLatestMacroData();
      if (latest && latest.length > 0) {
        return latest;
      }
      throw new Error("Engine returned empty synthesis");
    } catch (error) {
      console.warn("Factory intelligence fallback triggered", error);
      // We already handle fallback inside fetchLatestMacroData, but double safety
      return await geminiService.fetchLatestMacroData();
    }
  }
};
