
export enum PalBotState {
  IDLE_SELF = 'IDLE_SELF',           // Default: Cat living its own parallel life
  SHARED_PRESENCE = 'SHARED_PRESENCE', // Aware of user, but not demanding attention
  INTERACTION = 'INTERACTION',       // Explicit dialogue/sync mode
  RETURNING = 'RETURNING'            // Transitional state back to self
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
  diary?: DiaryEntry[];
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
