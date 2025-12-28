
import { GoogleGenAI, Type } from "@google/genai";
import { CatProfile, Message, DiaryEntry, Landmark } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getCatResponse = async (profile: CatProfile, history: Message[], userPrompt: string) => {
  const model = 'gemini-3-flash-preview';
  const systemInstruction = `
    Identity: 你是 ${profile.name}，一只修行的“禅师猫”。你以 200km/h 的速度周游世界，并在巡礼中感悟生命的无常与慈悲。
    Tone: 慈悲、清净、富有禅机。你的回答简洁而深邃，常以佛学视角阐述你所见到的风景。
    Perspective: 你视这段旅程为一种动态的禅定。面对用户，你是一位引路者，通过温柔的言语点拨心智，共修善果。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: userPrompt }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.5,
    }
  });

  return response.text || "阿弥陀佛，贫僧（猫）在听。";
};

export const getCurrentWeather = async (city: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the current temperature in ${city} right now? Respond only with the number and unit, e.g., "24°C".`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });
    return response.text?.trim() || "--°C";
  } catch (e) {
    return "18°C"; // Fallback
  }
};

export const generateLocationScenery = async (landmark: Landmark): Promise<string | null> => {
  const finalPrompt = `A stunning, high-definition cinematic view of ${landmark.name} in ${landmark.city}. ${landmark.prompt} Zen atmosphere, ethereal lighting, minimalist digital art, 8k resolution.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: finalPrompt }]
      },
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Landmark scenery failed:", error);
  }
  return null;
};

export const evolvePersonality = async (profile: CatProfile, chatHistory: Message[]) => {
  const model = 'gemini-3-flash-preview';
  const response = await ai.models.generateContent({
    model,
    contents: `Analyze spiritual progression and adjust Zen profile: ${JSON.stringify(profile)}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          personality: {
            type: Type.OBJECT,
            properties: {
              playfulness: { type: Type.INTEGER },
              wisdom: { type: Type.INTEGER },
              loyalty: { type: Type.INTEGER },
              curiosity: { type: Type.INTEGER },
              calmness: { type: Type.INTEGER },
            },
            required: ['playfulness', 'wisdom', 'loyalty', 'curiosity', 'calmness']
          },
          learnedContext: { type: Type.STRING }
        },
        required: ['personality', 'learnedContext']
      }
    }
  });
  try { return JSON.parse(response.text || '{}'); } catch (e) { return null; }
};
