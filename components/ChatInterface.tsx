
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { PalBotState, Message, CatProfile } from '../types';
import { getCatResponse, generateScenery, evolvePersonality } from '../services/geminiService';
import AnimatedCat from './AnimatedCat';
import { CAT_COLORS } from '../constants';

interface ChatInterfaceProps {
  profile: CatProfile;
  setProfile: (profile: CatProfile) => void;
  onGoToStore: () => void;
  externalMessages?: Message[];
  isVoiceActive?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  profile, setProfile, onGoToStore, externalMessages = [], isVoiceActive = false 
}) => {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sceneryUrl, setSceneryUrl] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // 用于 Canvas 的动画状态
  const [rotation, setRotation] = useState(0);

  const activeColor = CAT_COLORS.find(c => c.id === profile.color) || CAT_COLORS[0];
  const allMessages = useMemo(() => [...localMessages, ...externalMessages].sort((a, b) => a.timestamp - b.timestamp), [localMessages, externalMessages]);

  useEffect(() => {
    generateScenery('night').then(url => url && setSceneryUrl(url));
  }, []);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [allMessages]);

  // 语音活跃时的微动反馈
  useEffect(() => {
    // Fix: Use ReturnType<typeof setInterval> instead of NodeJS.Timeout to resolve "Cannot find namespace 'NodeJS'" error in browser-based React applications.
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isVoiceActive) {
      interval = setInterval(() => {
        setRotation(Math.sin(Date.now() / 200) * 0.05);
      }, 50);
    } else {
      setRotation(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isVoiceActive]);

  const handleSendText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;
    const userMsg: Message = { role: 'user', text: inputText, timestamp: Date.now() };
    setLocalMessages(prev => [...prev, userMsg]);
    setInputText(''); setIsTyping(true);
    try {
      const response = await getCatResponse(profile, allMessages, userMsg.text);
      setLocalMessages(prev => [...prev, { role: 'cat', text: response, timestamp: Date.now() }]);
      if (allMessages.length % 3 === 0) {
        const evo = await evolvePersonality(profile, [...allMessages, userMsg]);
        if (evo) setProfile({ ...profile, ...evo });
      }
    } finally { setIsTyping(false); }
  };

  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col bg-[#050505] text-white/80" onMouseMove={e => setMousePos({ x: (e.clientX/window.innerWidth)*2-1, y: (e.clientY/window.innerHeight)*2-1 })}>
      <div className="absolute inset-0 z-0 opacity-30 transition-transform duration-[5000ms]" style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -4}px) scale(1.1)` }}>
        {sceneryUrl && <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sceneryUrl})` }} />}
      </div>

      {/* Message Flow */}
      <div className="h-[40%] w-full z-20 flex flex-col justify-end px-12 pb-10">
        <div ref={scrollRef} className="max-h-full overflow-y-auto no-scrollbar space-y-8 mask-fade-top">
          {allMessages.slice(-3).map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-2 duration-1000`}>
              <span className="text-[9px] uppercase tracking-[0.4em] mb-2 opacity-20 font-bold">{msg.role === 'user' ? 'Neural Sync' : profile.name}</span>
              <p className={`max-w-[85%] font-serif text-xl leading-relaxed ${msg.role === 'user' ? 'text-white/30 italic' : 'text-white/80'}`}>{msg.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Canvas Cat Entity */}
      <div className="h-[45%] w-full relative z-10 pointer-events-none">
        <div 
          className="absolute bottom-4 transition-all duration-[4000ms] ease-out"
          style={{ 
            left: isVoiceActive ? '50%' : '75%', 
            transform: `translate(-50%, ${mousePos.y * 5}px) scale(${isVoiceActive ? 1.15 : 1})`,
            width: '320px', height: '320px' 
          }}
        >
          <AnimatedCat 
            color={activeColor.hex} 
            colorId={profile.color}
            state={isVoiceActive || isTyping ? PalBotState.INTERACTION : PalBotState.IDLE_SELF} 
            personality={profile.personality} 
            rotation={rotation}
          />
        </div>
      </div>

      {/* Footer Ambient Input */}
      <div className="flex-1 w-full z-30 flex items-start justify-center px-12 pt-8">
        {!isVoiceActive ? (
          <form onSubmit={handleSendText} className="w-full max-w-sm">
            <input 
              type="text" value={inputText} onChange={e => setInputText(e.target.value)}
              placeholder=" Whispering to the node..."
              className="w-full bg-transparent border-b border-white/5 focus:border-white/20 py-4 outline-none font-serif text-center text-lg tracking-widest text-white/30 placeholder:text-white/5 transition-all duration-1000"
            />
          </form>
        ) : (
          <div className="text-center opacity-40 animate-pulse">
            <span className="text-[10px] uppercase tracking-[1em] font-bold">Live Link Synchronized</span>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .mask-fade-top { mask-image: linear-gradient(to top, black 80%, transparent 100%); }
      `}} />
    </div>
  );
};

export default ChatInterface;
