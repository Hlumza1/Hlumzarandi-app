
import { GoogleGenAI, Type } from "@google/genai";
import { MonthlyBias, Asset, Trade, BiasType, GroundingSource } from "../types";
import { ASSETS, INITIAL_BIASES } from "../constants";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined' || apiKey === 'null') {
    console.error("HLUMZARANDI: API_KEY is invalid or missing.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const intelligenceCache: Record<string, string> = {};

function extractJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch (e) {
    // Attempt to find any JSON structure if the model was conversational
    const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerE) {
        console.error("Failed to parse extracted JSON block", innerE);
      }
    }
    throw new Error("Invalid intelligence format received.");
  }
}

export const geminiService = {
  async explainBias(bias: MonthlyBias): Promise<string> {
    const cacheKey = `explain-${bias.id}`;
    if (intelligenceCache[cacheKey]) return intelligenceCache[cacheKey];

    const ai = getAI();
    if (!ai) return "Engine offline.";

    const prompt = `Explain the monthly macro bias for ${bias.asset} in 2 sentences. Bias is ${bias.bias}. Drivers: ${bias.drivers.map(d => d.title).join(', ')}.`;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      const result = response.text || "Analysis unavailable.";
      intelligenceCache[cacheKey] = result;
      return result;
    } catch (error) {
      return "Context synthesis error.";
    }
  },

  async getTradeFeedback(trade: Trade): Promise<string> {
    const ai = getAI();
    if (!ai) return "Audit module offline.";
    const prompt = `Analyze this ${trade.direction} trade on ${trade.asset}. Alignment: ${trade.alignment}. Result: ${trade.resultR}R. Give 2 expert bullets.`;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      return response.text || "Feedback currently unavailable.";
    } catch (error) {
      return "Audit error.";
    }
  },

  async fetchLatestMacroData(): Promise<MonthlyBias[]> {
    const ai = getAI();
    if (!ai) return INITIAL_BIASES;

    const today = new Date();
    // Use the user-asserted date for the prompt context
    const currentYear = today.getFullYear(); 
    const monthLabel = today.toLocaleString('default', { month: 'long', year: 'numeric' });
    const monthValue = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}`;
    const dateStr = today.toISOString().split('T')[0];

    const prompt = `
      CURRENT DATE: ${dateStr}.
      STRICT SOURCE REQUIREMENT: You MUST use Search Grounding to check forexfactory.com and the latest economic calendars.
      
      TASKS:
      1. Find the fundamental monthly bias for ${ASSETS.join(', ')} for the month of ${monthLabel}.
      2. Analyze the latest Central Bank decisions from late 2025 and Jan 2026.
      3. Do NOT provide data from Feb 2024 or previous years. 
      4. Specifically check Forex Factory's "Market Analysis" and "Economic Calendar" for high-impact news from the last 7 days.
      
      RESPONSE FORMAT: Return ONLY a JSON array of 4 objects (one for each asset).
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', 
        contents: prompt,
        config: {
          systemInstruction: `You are a Global Macro Strategist. Today is ${dateStr}. You are tasked with providing the MONTHLY FUNDAMENTAL BIAS for January 2026 based on live market data from Forex Factory and institutional reports. You MUST return valid JSON. If you find data for Feb 2024, REJECT IT as outdated and search again for 2026.`,
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

      const rawText = response.text || '';
      const parsedBiases = extractJson(rawText);
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundingSource[] = groundingChunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title || "Forex Factory Intelligence",
          uri: c.web.uri
        }));

      if (!Array.isArray(parsedBiases) || parsedBiases.length === 0) {
        throw new Error("Intelligence synthesis yielded no results.");
      }

      return parsedBiases.map((b: any) => ({
        ...b,
        id: `sync-${b.asset}-${monthValue}-${Date.now()}`,
        month: monthValue,
        validityPeriod: b.validityPeriod || `${monthLabel}`,
        sources: sources.length > 0 ? sources : undefined
      }));
    } catch (error) {
      console.error("Macro Sync Error:", error);
      // Ensure we don't return old Feb 2024 data if it fails
      return INITIAL_BIASES;
    }
  }
};
