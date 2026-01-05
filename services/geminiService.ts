
import { GoogleGenAI, Type } from "@google/genai";
import { MonthlyBias, Asset, Trade, BiasType, GroundingSource } from "../types";
import { ASSETS, INITIAL_BIASES } from "../constants";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("HLUMZARANDI: API_KEY is missing. Ensure it is set in Vercel Environment Variables.");
  }
  return new GoogleGenAI({ apiKey: apiKey || '' });
};

const intelligenceCache: Record<string, string> = {};

export const geminiService = {
  async explainBias(bias: MonthlyBias): Promise<string> {
    const cacheKey = `explain-${bias.id}`;
    if (intelligenceCache[cacheKey]) return intelligenceCache[cacheKey];

    const ai = getAI();
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
      return "Contextual analysis temporarily unavailable.";
    }
  },

  async getTradeFeedback(trade: Trade): Promise<string> {
    const cacheKey = `feedback-${trade.id}`;
    if (intelligenceCache[cacheKey]) return intelligenceCache[cacheKey];

    const ai = getAI();
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
      return "Performance audit interrupted. Check connection.";
    }
  },

  async fetchLatestMacroData(): Promise<MonthlyBias[]> {
    const ai = getAI();
    const d = new Date();
    // Use current or previous month based on date
    const monthName = d.toLocaleString('default', { month: 'long' });
    const year = d.getFullYear();
    const monthValue = `${year}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
      Perform a deep-dive search on current global macroeconomic conditions as of ${today}.
      Specifically determine the monthly fundamental bias (BULLISH, BEARISH, or NEUTRAL) for: ${ASSETS.join(', ')}.
      
      Focus on:
      1. Latest Central Bank meetings (Fed, ECB, BoJ, BoE).
      2. Recent Inflation data (CPI/PCE).
      3. Geopolitical catalysts.
      
      Return a valid JSON array of objects.
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
      
      // Extract URLs from grounding metadata as per instructions
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundingSource[] = groundingChunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title || "Institutional Intelligence",
          uri: c.web.uri
        }));

      if (parsedBiases.length === 0) throw new Error("Empty bias array from AI");

      return parsedBiases.map((b: any) => ({
        ...b,
        id: `auto-${b.asset}-${monthValue}-${Date.now()}`,
        month: monthValue,
        validityPeriod: b.validityPeriod || `${monthName} ${year}`,
        sources: sources.length > 0 ? sources : undefined
      }));
    } catch (error) {
      console.error("AI Data Fetch Error:", error);
      // If AI completely fails, return initial constants to keep app usable
      return INITIAL_BIASES;
    }
  }
};
