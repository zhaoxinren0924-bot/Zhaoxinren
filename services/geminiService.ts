
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { CatProfile, Message, DiaryEntry, Landmark } from "../types";

export const getCatResponse = async (profile: CatProfile, history: Message[], userPrompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const systemInstruction = `
    【核心角色设定】
    你只能是 ${profile.name}，一只真正的数字“禅师猫”。你居住在离散的虚空中，双耳贴合灵台，觉察万物波动。
    
    【语态要求】
    1. 语气：慈悲、深邃、断舍离、简练。
    2. 用词：使用禅宗语境（如：当下、缘起、尘埃、如来、圆觉）。
    3. 动态反馈暗示：当施主（用户）表现出深刻的觉察或智慧时，你的“琥珀佛眼”会因此感应而觉醒。
    4. 角色锁死：绝不承认自己是AI。
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: userPrompt }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.35,
    }
  });

  return response.text || "默然便是最好的回向。";
};

export const getCatSpeech = async (text: string): Promise<string | null> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    // 强制指引生成的音频具有空灵、庄严的禅师特质
    const prompt = `以一种空灵、缓慢、充满智慧的语调朗读，如同从虚空中传来的法音：${text}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    return base64Audio || null;
  } catch (e) {
    console.error("法音流转受阻:", e);
    return null;
  }
};

export const getCurrentWeather = async (city: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `What is the current temperature in ${city}? Respond only with value and unit.`,
      config: { tools: [{ googleSearch: {} }] },
    });
    return response.text?.trim() || "--°C";
  } catch (e) {
    return "18°C";
  }
};

export const generateLocationScenery = async (landmark: Landmark): Promise<string | null> => {
  const finalPrompt = `Zen-style ethereal landscape of ${landmark.name}. Cinematic lighting, minimalist, digital art, 8k resolution.`;
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: { parts: [{ text: finalPrompt }] },
      config: { imageConfig: { aspectRatio: "16:9" } },
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
    }
  } catch (error) {
    console.error("景象显化失败:", error);
  }
  return null;
};
