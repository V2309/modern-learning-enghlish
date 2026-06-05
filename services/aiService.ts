import { GoogleGenAI, Type } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = new GoogleGenAI({ apiKey });

export async function generateWordFamilies(word: string) {
  if (!apiKey) return [];
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a list of word families for the word: "${word}". Include the word, its part of speech, and a short definition in Vietnamese.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: { type: Type.STRING },
              partOfSpeech: { type: Type.STRING },
              meaning: { type: Type.STRING }
            },
            required: ["word", "partOfSpeech", "meaning"]
          }
        }
      }
    });

    const text = response.text || "[]";
    return JSON.parse(text);
  } catch (error) {
    console.error("AI Generation Error:", error);
    return [];
  }
}

export async function getPronunciationIPA(word: string) {
  if (!apiKey) return "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the IPA pronunciation of the English word: "${word}"? Return ONLY the IPA notation between forward slashes (e.g., /həˈloʊ/).`,
    });

    return response.text?.trim() || "";
  } catch (error) {
    console.error("IPA Generation Error:", error);
    return "";
  }
}

export async function getEnrichedWordDetail(word: string) {
  if (!apiKey) return null;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `For the English word "${word}", provide:
      1. Accurate IPA pronunciation (e.g., /əˈkaʊntənt/)
      2. Clear Vietnamese meaning/definition
      3. Simple English definition (e.g. "a person responsible for analyzing financial records")
      4. A practical example sentence using that word, along with its Vietnamese translation.
      Return this as a JSON object matching this structure:
      {
        "ipa": "string",
        "vietnameseDefinition": "string",
        "englishDefinition": "string",
        "exampleEn": "string",
        "exampleVi": "string"
      }`,
      config: {
        responseMimeType: "application/json"
      }
    });
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Enrichment Error:", e);
    return null;
  }
}
