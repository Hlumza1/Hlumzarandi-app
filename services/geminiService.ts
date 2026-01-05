
import { GoogleGenAI, Type } from "@google/genai";
import { MonthlyBias, Asset, Trade, BiasType, GroundingSource } from "../types";
import { ASSETS, INITIAL_BIASES } from "../constants";

const getAI = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey || apiKey === 'undefined') {
    console.error("HLUMZARANDI: API_KEY is missing. App will default to static data.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const intelligenceCache: Record<string, string> = {};

/**
 * Helper to extract JSON from text that might contain markdown or conversational filler.
 * Especially useful when using Grounding tools which tend to be conversational.
 */
function extractJson(text: string): any {
  try {
    // Try direct parse first
    return JSON.parse(text);
  } catch (e) {
    // Try to find a JSON array or object structure using regex
    const jsonMatch = text.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerE) {
        console.error("Failed to parse extracted JSON block", innerE);
      }
    }
    throw new Error("Could not find valid JSON in AI response");
  }
}

export const geminiService = {
  async explainBias(bias: MonthlyBias): Promise<string> {
    const cacheKey = `explain-${bias.id}`;
    if (intelligenceCache[cacheKey]) return intelligenceCache[cacheKey];

    const ai = getAI();
    if (!ai) return "Intelligence engine offline (Check API Key).";

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
    if (!ai) return "Audit module offline.";

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
    if (!ai) return INITIAL_BIASES;

    const d = new Date();
    const monthName = d.toLocaleString('default', { month: 'long' });
    const year = d.getFullYear();
    const monthValue = `${year}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const prompt = `
      Perform a deep-dive search on current global macroeconomic conditions as of ${today}.
      Specifically determine the monthly fundamental bias (BULLISH, BEARISH, or NEUTRAL) for: ${ASSETS.join(', ')}.
      
      Requirements:
      1. Check Latest Central Bank meetings (Fed, ECB, BoJ, BoE).
      2. Check Recent Inflation data (CPI/PCE) and Employment reports.
      3. Return ONLY a valid JSON array of objects. No other text.
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

      const rawText = response.text || '';
      const parsedBiases = extractJson(rawText);
      
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: GroundingSource[] = groundingChunks
        .filter((c: any) => c.web)
        .map((c: any) => ({
          title: c.web.title || "Institutional Intelligence",
          uri: c.web.uri
        }));

      if (!Array.isArray(parsedBiases) || parsedBiases.length === 0) {
        throw new Error("No bias data found in intelligence synthesis.");
      }

      return parsedBiases.map((b: any) => ({
        ...b,
        id: `auto-${b.asset}-${monthValue}-${Date.now()}`,
        month: monthValue,
        validityPeriod: b.validityPeriod || `${monthName} ${year}`,
        sources: sources.length > 0 ? sources : undefined
      }));
    } catch (error) {
      console.error("AI Data Fetch Error:", error);
      // Fail gracefully to initial constants so the UI doesn't break
      return INITIAL_BIASES;
    }
  }
};
