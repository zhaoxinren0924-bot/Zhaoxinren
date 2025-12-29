
import React, { useState, useEffect } from 'react';
import { CatProfile, VisitorCat, PalBotState } from '../types';
import { CAT_COLORS } from '../constants';
import AnimatedCat from './AnimatedCat';
import { GoogleGenAI } from "@google/genai";

interface CommunitySpaceProps {
  userProfile: CatProfile;
  // Added isDarkMode prop to fix TS error in App.tsx
  isDarkMode?: boolean;
}

const MOCK_VISITORS: VisitorCat[] = [
  {
    id: 'v1',
    name: 'Luna',
    color: 'snow',
    archetype: 'Cosmic Explorer',
    personality: { playfulness: 80, wisdom: 30, loyalty: 50, curiosity: 90, calmness: 40 },
    learnedContext: '',
    adoptedAt: 0,
    // Added earFoldLevel to satisfy VisitorCat (CatProfile) interface
    earFoldLevel: 0.1,
    distance: '1.2ly',
    status: 'Seeking harmony'
  },
  {
    id: 'v2',
    name: 'Shadow',
    color: 'umber',
    archetype: 'Amber Guardian',
    personality: { playfulness: 20, wisdom: 90, loyalty: 80, curiosity: 30, calmness: 85 },
    learnedContext: '',
    adoptedAt: 0,
    // Added earFoldLevel to satisfy VisitorCat (CatProfile) interface
    earFoldLevel: 0.8,
    distance: '0.5ly',
    status: 'Deep meditation'
  },
  {
    id: 'v3',
    name: 'Patch',
    color: 'tuxedo',
    archetype: 'Parallel Agent',
    personality: { playfulness: 50, wisdom: 50, loyalty: 50, curiosity: 50, calmness: 50 },
    learnedContext: '',
    adoptedAt: 0,
    // Added earFoldLevel to satisfy VisitorCat (CatProfile) interface
    earFoldLevel: 0,
    distance: '2.1ly',
    status: 'Observing'
  }
];

const CommunitySpace: React.FC<CommunitySpaceProps> = ({ userProfile, isDarkMode = true }) => {
  const [visitor, setVisitor] = useState<VisitorCat | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [interactionLog, setInteractionLog] = useState<string>('The plaza is quiet. Your agent is waiting for a neural link.');
  const [isProcessing, setIsProcessing] = useState(false);

  const scanForAgents = () => {
    setIsScanning(true);
    setVisitor(null);
    setInteractionLog('Scanning parallel frequencies...');
    
    setTimeout(() => {
      const found = MOCK_VISITORS[Math.floor(Math.random() * MOCK_VISITORS.length)];
      setVisitor(found);
      setIsScanning(false);
      generateInteraction(found);
    }, 2500);
  };

  const generateInteraction = async (friend: VisitorCat) => {
    setIsProcessing(true);
    // Initialize GoogleGenAI instance with API key from environment
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Describe a short, poetic interaction between two digital cats in a minimalist neural space. 
          Cat 1: ${userProfile.name} (Traits: ${JSON.stringify(userProfile.personality)})
          Cat 2: ${friend.name} (Traits: ${JSON.stringify(friend.personality)})
          Keep it under 30 words. Focus on body language and cat-like behavior.`
      });
      setInteractionLog(response.text || 'They share a brief, respectful blink.');
    } catch (e) {
      setInteractionLog(`${userProfile.name} and ${friend.name} acknowledge each other in silence.`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-6 py-12 h-full flex flex-col items-center justify-center transition-colors duration-[2000ms] ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="text-center mb-12">
        <h1 className="text-3xl font-serif italic mb-2">The Neural Plaza</h1>
        <p className={`text-[10px] ${isDarkMode ? 'text-white/30' : 'text-gray-400'} uppercase tracking-[0.4em] font-bold`}>Cross-Link Synchronization Zone</p>
      </div>

      <div className={`relative w-full max-w-5xl h-[500px] ${isDarkMode ? 'bg-white/5 border-white/10 shadow-none' : 'bg-white border-gray-100 shadow-sm'} rounded-[4rem] border overflow-hidden flex items-center justify-around px-12 transition-all duration-1000`}>
        <div className={`absolute inset-0 ${isDarkMode ? 'opacity-[0.03]' : 'opacity-5'} pointer-events-none`}>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border ${isDarkMode ? 'border-white' : 'border-gray-900'} rounded-full`}></div>
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border ${isDarkMode ? 'border-white' : 'border-gray-900'} rounded-full`}></div>
        </div>

        <div className="flex flex-col items-center gap-6 z-10 transition-all duration-1000">
          <div className="w-64 h-64 scale-90">
            <AnimatedCat 
              color={CAT_COLORS.find(c => c.id === userProfile.color)?.hex || '#020202'} 
              colorId={userProfile.color}
              state={visitor ? PalBotState.INTERACTION : PalBotState.IDLE_SELF} 
              scale={1} 
              personality={userProfile.personality} 
              earFoldLevel={userProfile.earFoldLevel}
            />
          </div>
          <div className="text-center">
            <span className={`text-[10px] font-bold ${isDarkMode ? 'text-white/20' : 'text-gray-300'} uppercase tracking-widest block`}>Primary Agent</span>
            <span className="text-lg font-serif">{userProfile.name}</span>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 z-10 min-w-[256px]">
          {isScanning ? (
            <div className="w-64 h-64 flex items-center justify-center relative">
              <div className={`absolute inset-0 border-2 ${isDarkMode ? 'border-white/10' : 'border-gray-100'} rounded-full animate-ping`}></div>
              <div className={`w-16 h-16 border-4 ${isDarkMode ? 'border-white border-t-transparent' : 'border-gray-900 border-t-transparent'} rounded-full animate-spin`}></div>
            </div>
          ) : visitor ? (
            <div className="flex flex-col items-center gap-6 animate-in zoom-in fade-in duration-1000">
              <div className="w-64 h-64 scale-90">
                <AnimatedCat 
                  color={CAT_COLORS.find(c => c.id === visitor.color)?.hex || '#020202'} 
                  colorId={visitor.color}
                  state={PalBotState.INTERACTION} 
                  scale={1} 
                  personality={visitor.personality} 
                  earFoldLevel={visitor.earFoldLevel}
                />
              </div>
              <div className="text-center">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block">Visiting Agent</span>
                <span className="text-lg font-serif">{visitor.name}</span>
                <span className={`block text-[8px] ${isDarkMode ? 'text-white/20' : 'text-gray-400'} mt-1 uppercase tracking-tighter`}>Origin: Neural Node {visitor.id}</span>
              </div>
            </div>
          ) : (
            <button 
              onClick={scanForAgents}
              className={`w-48 h-48 rounded-full border-2 border-dashed ${isDarkMode ? 'border-white/10 text-white/20 hover:border-white/40 hover:text-white/60' : 'border-gray-200 text-gray-300 hover:border-gray-900 hover:text-gray-900'} flex flex-col items-center justify-center transition-all group`}
            >
              <svg className="w-8 h-8 mb-2 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="text-[10px] font-bold uppercase tracking-widest">Scan for Agents</span>
            </button>
          )}
        </div>

        <div className="absolute top-12 left-1/2 -translate-x-1/2 max-w-md w-full px-8">
          <div className={`${isDarkMode ? 'bg-white/10 backdrop-blur-xl border-white/10' : 'bg-white/80 backdrop-blur-md border-gray-100 shadow-lg'} p-6 rounded-3xl border text-center transition-all duration-1000`}>
            <p className={`text-sm font-medium leading-relaxed ${isProcessing ? 'text-gray-500 italic animate-pulse' : (isDarkMode ? 'text-white/70' : 'text-gray-600')}`}>
              {interactionLog}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommunitySpace;
