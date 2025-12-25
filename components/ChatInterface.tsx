
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PalBotState, Message, CatProfile } from '../types';
import { CAT_COLORS } from '../constants';
import { getCatResponse } from '../services/geminiService';
import AnimatedCat from './AnimatedCat';

const INTERACTION_TIMEOUT = 15000;
const PRESENCE_IDLE_TIME = 3000;

interface ChatInterfaceProps {
  profile: CatProfile;
  setProfile: (profile: CatProfile) => void;
  onGoToStore: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ profile, setProfile }) => {
  const [fsmState, setFsmState] = useState<PalBotState>(PalBotState.IDLE_SELF);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const stateTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idlePresenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const transitionTo = useCallback((nextState: PalBotState) => {
    setFsmState(nextState);
    
    // Clear existing timers
    if (stateTimerRef.current) clearTimeout(stateTimerRef.current);
    
    // Auto-return logic for non-idle states
    if (nextState !== PalBotState.IDLE_SELF) {
      stateTimerRef.current = setTimeout(() => {
        setFsmState(PalBotState.RETURNING);
        setTimeout(() => setFsmState(PalBotState.IDLE_SELF), 2000);
      }, INTERACTION_TIMEOUT);
    }
  }, []);

  const handleGlobalTouch = () => {
    if (fsmState === PalBotState.IDLE_SELF) {
      transitionTo(PalBotState.SHARED_PRESENCE);
    }
  };

  const startInteraction = (e: React.MouseEvent | React.FocusEvent) => {
    e.stopPropagation();
    transitionTo(PalBotState.INTERACTION);
  };

  const handleSendText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;
    
    const userMsg: Message = { role: 'user', text: inputText, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);
    
    try {
      const response = await getCatResponse(profile, messages, userMsg.text);
      setMessages(prev => [...prev, { role: 'cat', text: response, timestamp: Date.now() }]);
      transitionTo(PalBotState.INTERACTION); // Extend interaction on success
    } finally { 
      setIsTyping(false); 
    }
  };

  // Layer 0 & 1: Environment and Entity (Fixed Composition)
  return (
    <div className="h-full w-full relative bg-[#1a1a1c] overflow-hidden cursor-default" onClick={handleGlobalTouch}>
      
      {/* Layer 0: Environment (Windowsill Cinematic) */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1e2a38] via-[#332e2a] to-[#121214]"></div>
        
        {/* City & Sky */}
        <div className="absolute bottom-1/3 inset-x-0 h-40 opacity-20">
           <svg className="w-full h-full" viewBox="0 0 800 200" preserveAspectRatio="none">
             <path d="M0 200 L0 160 L50 145 L80 165 L120 135 L160 160 L200 125 L300 140 L400 165 L500 130 L600 160 L700 140 L800 160 L800 200 Z" fill="#050505" />
           </svg>
        </div>

        {/* The Moon */}
        <div className="absolute top-12 right-12 opacity-30">
           <svg width="24" height="24" viewBox="0 0 40 40">
             <path d="M20 5 A15 15 0 1 0 35 20 A12 12 0 1 1 20 5" fill="#fdfcf0" />
           </svg>
        </div>

        {/* The Structure */}
        <div className="absolute bottom-0 inset-x-0 h-[40%] bg-[#1e1e20] shadow-[0_-10px_40px_rgba(0,0,0,0.6)]">
           <div className="absolute top-0 inset-x-0 h-4 bg-gradient-to-b from-white/5 to-transparent"></div>
           
           {/* Prop: Steaming Tea */}
           <div className="absolute top-[-30px] right-[28%] w-8 h-10 opacity-60">
              <div className="w-full h-full bg-[#2a2a2c] rounded-b-lg relative">
                <div className="absolute -right-2 top-1.5 w-3 h-4 border border-[#2a2a2c] rounded-full"></div>
              </div>
           </div>
        </div>
      </div>

      {/* Layer 1: Entity (De-protagonized Cat) */}
      <div className="flex-1 relative flex flex-col items-center justify-center z-10 pointer-events-none">
        <div 
          className="w-full max-w-[420px] aspect-square relative flex items-center justify-center transition-all duration-[6000ms] ease-in-out"
          style={{ 
            // Off-center shift as per Redline 3
            transform: fsmState === PalBotState.INTERACTION 
              ? 'translate(0, 15%) scale(0.98)' 
              : 'translate(10%, 18%) scale(1)', 
          }}
        >
          <AnimatedCat color="#080808" state={fsmState} scale={1} personality={profile.personality} />
        </div>
      </div>

      {/* Layer 2: Interaction Surface (Semi-implicit) */}
      <div 
        className={`absolute inset-x-8 bottom-32 z-40 transition-all duration-[2000ms] transform ${
          fsmState === PalBotState.INTERACTION ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
        }`}
      >
        <div className="max-w-md mx-auto">
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full px-8 py-5 flex items-center gap-4 shadow-2xl">
            <form onSubmit={handleSendText} className="flex-1">
              <input 
                type="text"
                value={inputText}
                onFocus={startInteraction}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="留下此刻...."
                className="w-full bg-transparent border-none outline-none font-serif text-lg tracking-[0.2em] text-white/80 placeholder:text-white/10"
              />
            </form>
            <div className="text-white/10 hover:text-white/40 transition-colors p-1">
               <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
               </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Shared Presence Trigger: Hidden Overlay */}
      {fsmState === PalBotState.SHARED_PRESENCE && (
        <div 
          className="absolute inset-0 z-20 flex items-center justify-center animate-in fade-in duration-1000"
          onClick={startInteraction}
        >
          <div className="bg-white/5 px-6 py-2 rounded-full border border-white/5 backdrop-blur-sm">
             <span className="text-[10px] text-white/30 tracking-[0.5em] uppercase font-bold">Synchronize neural link</span>
          </div>
        </div>
      )}

      {/* Engineering Redline: Removed page dots. Minimal presence markers only. */}
      <div className="absolute bottom-16 inset-x-0 flex justify-center opacity-5 pointer-events-none">
        <div className="w-1 h-1 rounded-full bg-white mx-1"></div>
      </div>
      
    </div>
  );
};

export default ChatInterface;
