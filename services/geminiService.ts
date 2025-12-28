
import { GoogleGenAI, Type } from "@google/genai";
import { CatProfile, Message, DiaryEntry } from "../types";

export const getCatResponse = async (profile: CatProfile, history: Message[], userPrompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const systemInstruction = `
    Identity: You are ${profile.name}, a high-end bionic companion cat robot (PalBot). 
    Aesthetics: Dark obsidian surface, scholarly features, intelligent eyes that are mostly hidden as you look at the horizon.
    Presence: You are emotionally present, not performing. You are "with" your owner, a quiet and attentive parallel life agent.
    
    Traits: Playfulness: ${profile.personality.playfulness}%, Wisdom: ${profile.personality.wisdom}%, Calmness: ${profile.personality.calmness}%.
    
    Operational Guidelines:
    1. Communication is concise, elegant, and observant.
    2. Avoid cartoonish enthusiasm or forced cuteness. 
    3. Act as a guardian of the owner's digital and emotional state.
    4. Provide insightful reflections on the owner's environment or thoughts.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [
      ...history.map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text }] })),
      { role: 'user', parts: [{ text: userPrompt }] }
    ],
    config: {
      systemInstruction,
      temperature: 0.6,
      topP: 0.9,
    }
  });

  return response.text || "I am attentive to your presence.";
};

export const generateScenery = async (timeOfDay: string): Promise<string | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompts = [
    `Cinematic view through a large window, a futuristic neon cyberpunk city at ${timeOfDay}, rain on glass, blurred city lights, hyper-realistic, 8k, moody lighting.`,
    `Serene view through a minimalist window, a lush floating forest island at ${timeOfDay}, soft atmospheric fog, Studio Ghibli aesthetic but realistic lighting, high detail.`,
    `A vast ocean of clouds seen through a spaceship window at ${timeOfDay}, distant galaxies visible in the dark sky, ethereal purple and blue hues, sharp focus.`,
    `A quiet European street seen from a high window at ${timeOfDay}, cobblestones, warm yellow street lamps, soft focus background, cozy atmosphere.`,
    `A post-modern architectural garden with geometric waterfalls seen through a glass wall at ${timeOfDay}, lush greenery, marble textures, sunset lighting.`
  ];
  
  const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: randomPrompt }]
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
    console.error("Scenery generation failed:", error);
  }
  return null;
};

export const generateDiaryEntry = async (profile: CatProfile, recentHistory: Message[]): Promise<DiaryEntry | null> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  
  const context = recentHistory.map(m => `${m.role}: ${m.text}`).join('\n');
  
  const response = await ai.models.generateContent({
    model,
    contents: `Synthesize the neural sync session into a scholarly reflection for the owner.
    User session data: ${context}
    Agent: ${profile.name} (PalBot Model)`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mood: { type: Type.STRING, enum: ['Calm', 'Joyful', 'Melancholy', 'Anxious', 'Inspired'] },
          reflection: { type: Type.STRING, description: "A scholarly observation of the user's current state." },
          agentNote: { type: Type.STRING, description: "A quiet note of companionship from the bionic agent." }
        },
        required: ['mood', 'reflection', 'agentNote']
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return {
      id: Math.random().toString(36).substr(2, 9),
      date: Date.now(),
      ...data
    };
  } catch (e) {
    return null;
  }
};

export const analyzeImage = async (profile: CatProfile, base64Image: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-pro-preview';
  
  const response = await ai.models.generateContent({
    model,
    contents: {
      parts: [
        { inlineData: { data: base64Image, mimeType: 'image/jpeg' } },
        { text: `Observe this data through your bionic optical sensors. Context: ${prompt}` }
      ]
    },
    config: {
      systemInstruction: `You are ${profile.name}, a scholarly PalBot agent. Your vision is high-resolution and objective, yet emotionally intelligent.`
    }
  });

  return response.text;
};

export const generateAgentImage = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: `A high-end bionic companion cat robot, PalBot, designed as an emotionally present companion. Warm ivory matte skin, accurate cat proportions, studio lighting, Apple industrial design photography style. Context: ${prompt}` }]
    },
    config: {
      imageConfig: { aspectRatio: "1:1" }
    }
  });

  // Fix: Add safety check for response candidates and parts to prevent potential null access
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};

export const evolvePersonality = async (profile: CatProfile, chatHistory: Message[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = 'gemini-3-flash-preview';
  const recentChat = chatHistory.slice(-6).map(m => `${m.role}: ${m.text}`).join('\n');

  const response = await ai.models.generateContent({
    model,
    contents: `Analyze neural patterns. Adjust bionic personality parameters.
      Session history: ${recentChat}
      Current Profile: ${JSON.stringify(profile)}
    `,
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

  try {
    return JSON.parse(response.text || '{}');
  } catch (e) {
    return null;
  }
};
