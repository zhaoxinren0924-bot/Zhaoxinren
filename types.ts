
export enum PalBotState {
  IDLE_SELF = 'IDLE_SELF',
  SHARED_PRESENCE = 'SHARED_PRESENCE',
  INTERACTION = 'INTERACTION',
  RETURNING = 'RETURNING'
}

export interface PersonalityTraits {
  playfulness: number;
  wisdom: number;
  loyalty: number;
  curiosity: number;
  calmness: number;
}

export interface DiaryEntry {
  id: string;
  date: number;
  mood: 'Calm' | 'Joyful' | 'Melancholy' | 'Anxious' | 'Inspired';
  reflection: string;
  agentNote: string;
}

export interface CatProfile {
  id: string;
  name: string;
  color: string;
  archetype: string;
  personality: PersonalityTraits;
  learnedContext: string;
  adoptedAt: number;
  earFoldLevel: number; // 0.0 (Upright) to 1.0 (Fully Folded/Fitting)
  eyeState?: 'default' | 'amber'; // 琥珀眼觉醒状态
  diary?: DiaryEntry[];
}

export interface Landmark {
  name: string;
  city: string;
  distanceFromStart: number;
  prompt: string;
}

export interface VisitorCat extends CatProfile {
  distance: string;
  status: string;
}

export interface Message {
  role: 'user' | 'cat';
  text: string;
  timestamp: number;
  type?: 'text' | 'image' | 'analysis';
  imageData?: string;
}
