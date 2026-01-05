
import { GoogleGenAI, Type } from "@google/genai";
import { MonthlyBias, Asset, Trade, BiasType, GroundingSource } from "../types";
import { ASSETS } from "../constants";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// In-memory cache for the current session to speed up repeat views
const intelligenceCache: Record<string, string> = {};

export const geminiService = {
  /**
   * Generates a plain-English explanation of why the bias is what it is.
   */
  async explainBias(bias: MonthlyBias): Promise<string> {
    const cacheKey = `explain-${bias.id}`;
    if (intelligenceCache[cacheKey]) return intelligenceCache[cacheKey];

    const prompt = `
      Act as a senior global macro strategist.
      Analyze the following monthly fundamental bias for ${bias.asset}:
      Bias: ${bias.bias} (${bias.confidence}% confidence)
      Drivers: ${bias.drivers.map(d => `${d.title}: ${d.description}`).join(', ')}
      Central Bank: ${bias.centralBankStance}
      Inflation: ${bias.inflationTrend}
      
      Provide a concise, professional summary explaining the directional context for a serious trader. 
      DO NOT predict price targets. DO NOT give entry/exit signals.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      const result = response.text || "Unable to generate macro context.";
      intelligenceCache[cacheKey] = result;
      return result;
    } catch (error) {
      console.error("AI Explain Error:", error);
      return "An error occurred while generating macro context.";
    }
  },

  /**
   * Provides educational feedback on a trade relative to macro bias.
   */
  async getTradeFeedback(trade: Trade): Promise<string> {
    const cacheKey = `feedback-${trade.id}`;
    if (intelligenceCache[cacheKey]) return intelligenceCache[cacheKey];

    const prompt = `
      Act as a professional macro trading coach.
      A trader took the following trade:
      Asset: ${trade.asset}
      Direction: ${trade.direction}
      Alignment with Monthly Bias: ${trade.alignment}
      Macro Bias at Time of Trade: ${trade.snapshotBias.bias}
      Result: ${trade.resultR}R
      
      Provide 3 brief educational bullets on why this trade was (or wasn't) fundamentally sound based on the bias.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      const result = response.text || "Feedback currently unavailable.";
      intelligenceCache[cacheKey] = result;
      return result;
    } catch (error) {
      console.error("AI Feedback Error:", error);
      return "An error occurred while generating trade feedback.";
    }
  },

  /**
   * Synthesizes the macro data specifically for the LAST MONTH plus absolute latest news.
   */
  async fetchLatestMacroData(): Promise<MonthlyBias[]> {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    const lastMonthName = d.toLocaleString('default', { month: 'long' });
    const lastYear = d.getFullYear();
    const lastMonthValue = `${lastYear}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
      Analyze global macroeconomic conditions as of ${today}.
      Focus on ${lastMonthName} ${lastYear} bias and latest news.
      Return JSON array for: ${ASSETS.join(', ')}.
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                asset: { type: Type.STRING },
                bias: { type: Type.STRING, enum: ['BULLISH', 'BEARISH', 'NEUTRAL'] },
                confidence: { type: Type.NUMBER },
                validityPeriod: { type: Type.STRING },
                drivers: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      title: { type: Type.STRING },
                      description: { type: Type.STRING }
                    },
                    required: ['title', 'description']
                  }
                },
                centralBankStance: { type: Type.STRING },
                inflationTrend: { type: Type.STRING },
                employmentTrend: { type: Type.STRING },
                growthOutlook: { type: Type.STRING },
                riskSentiment: { type: Type.STRING }
              },
              required: ['asset', 'bias', 'confidence', 'drivers', 'centralBankStance', 'inflationTrend', 'growthOutlook', 'riskSentiment']
            }
          }
        },
      });

      const parsedBiases = JSON.parse(response.text || '[]');
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundingSource[] = groundingChunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title || "Intelligence Source",
          uri: c.web.uri
        }));

      return parsedBiases.map((b: any) => ({
        ...b,
        id: `auto-${b.asset}-${lastMonthValue}-${new Date().getHours()}`,
        month: lastMonthValue,
        validityPeriod: b.validityPeriod || `${lastMonthName} ${lastYear}`,
        sources
      }));
    } catch (error) {
      console.error("AI Data Fetch Error:", error);
      throw error;
    }
  }
};
