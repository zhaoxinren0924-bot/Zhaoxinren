
import { Landmark } from './types';

export const CAT_COLORS = [
  { id: 'obsidian', hex: '#020202', name: '玄曜 (Pure Black)', filter: 'none' },
  { id: 'snow', hex: '#F8F8F8', name: '素雪 (Pure White)', filter: 'none' },
  { id: 'umber', hex: '#5D4037', name: '琥珀 (Deep Brown)', filter: 'none' },
  { id: 'tuxedo', hex: '#020202', name: '云斑 (Black & White)', filter: 'none' }
];

export const INITIAL_PERSONALITY = {
  playfulness: 30,
  wisdom: 70,
  loyalty: 40,
  curiosity: 50,
  calmness: 80
};

export const TRAVEL_SPEED_KMH = 200;

export const WORLD_LANDMARKS: Landmark[] = [
  { name: "广州塔 (Canton Tower)", city: "Guangzhou", distanceFromStart: 0, prompt: "The Canton Tower at night with purple and blue LED lights reflecting off the Pearl River." },
  { name: "故宫 (Forbidden City)", city: "Beijing", distanceFromStart: 1900, prompt: "The majestic red walls and golden roofs of the Forbidden City under a light snowfall." },
  { name: "富士山 (Mount Fuji)", city: "Tokyo", distanceFromStart: 4500, prompt: "Mount Fuji with a snow-capped peak and cherry blossoms in the foreground at sunrise." },
  { name: "红场 (Red Square)", city: "Moscow", distanceFromStart: 11500, prompt: "Saint Basil's Cathedral in Red Square with its colorful onion domes under a twilight sky." },
  { name: "埃菲尔铁塔 (Eiffel Tower)", city: "Paris", distanceFromStart: 14500, prompt: "The Eiffel Tower seen from a Parisian street at golden hour with cafe chairs in soft focus." },
  { name: "大本钟 (Big Ben)", city: "London", distanceFromStart: 15000, prompt: "Big Ben and the Palace of Westminster reflected in the Thames river during a misty evening." },
  { name: "自由女神像 (Statue of Liberty)", city: "New York", distanceFromStart: 21000, prompt: "The Statue of Liberty in New York harbor with the Manhattan skyline in the distant haze." },
  { name: "金门大桥 (Golden Gate Bridge)", city: "San Francisco", distanceFromStart: 25000, prompt: "The Golden Gate Bridge peeking through rolling white fog in the early morning." },
  { name: "歌剧院 (Opera House)", city: "Sydney", distanceFromStart: 38000, prompt: "The Sydney Opera House with its white sails glowing against the deep blue harbor water." },
  { name: "起点 (回到了家)", city: "Guangzhou", distanceFromStart: 50000, prompt: "Back to the lush green hills of Baiyun Mountain in Guangzhou with the city skyline far away." }
];
