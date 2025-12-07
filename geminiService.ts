import { GoogleGenAI, Type } from "@google/genai";
import { Quote } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSimilarQuotes = async (existingQuotes: Quote[]): Promise<Quote[]> => {
  try {
    const sampleTexts = existingQuotes.slice(0, 5).map(q => q.text).join(" | ");
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate 5 mindfulness and present-moment awareness quotes similar in style and tone to these: "${sampleTexts}". Return them as a list of objects with 'text' and 'author' fields. Keep them concise and profound.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              text: { type: Type.STRING },
              author: { type: Type.STRING },
            },
            required: ["text", "author"],
          },
        },
      },
    });

    const rawData = response.text;
    if (!rawData) return [];

    const parsedData = JSON.parse(rawData);
    
    // Map to our internal Quote structure with IDs
    return parsedData.map((item: any) => ({
      id: crypto.randomUUID(),
      text: item.text,
      author: item.author || "Unknown"
    }));

  } catch (error) {
    console.error("Failed to generate quotes:", error);
    return [];
  }
};