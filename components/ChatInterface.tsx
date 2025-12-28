
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { PalBotState, Message, CatProfile, Landmark } from '../types';
import { getCatResponse, generateLocationScenery, getCurrentWeather } from '../services/geminiService';
import AnimatedCat from './AnimatedCat';
import { CAT_COLORS, TRAVEL_SPEED_KMH, WORLD_LANDMARKS } from '../constants';

interface ChatInterfaceProps {
  profile: CatProfile;
  setProfile: (profile: CatProfile) => void;
  onGoToStore: () => void;
  externalMessages?: Message[];
  isVoiceActive?: boolean;
  voiceAction?: { action: string; targetX?: number } | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  profile, setProfile, onGoToStore, externalMessages = [], isVoiceActive = false, voiceAction = null
}) => {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sceneryUrl, setSceneryUrl] = useState<string | null>(null);
  const [currentLandmark, setCurrentLandmark] = useState<Landmark>(WORLD_LANDMARKS[0]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [temperature, setTemperature] = useState<string>('--°C');
  const [isGlitching, setIsGlitching] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [walkCycle, setWalkCycle] = useState(0);

  const activeColor = CAT_COLORS.find(c => c.id === profile.color) || CAT_COLORS[0];
  const allMessages = useMemo(() => [...localMessages, ...externalMessages].sort((a, b) => a.timestamp - b.timestamp), [localMessages, externalMessages]);

  useEffect(() => {
    const updateExpedition = () => {
      const elapsedMs = Date.now() - profile.adoptedAt;
      const elapsedHours = elapsedMs / (1000 * 60 * 60);
      const distance = elapsedHours * TRAVEL_SPEED_KMH;
      const cycledDistance = distance % WORLD_LANDMARKS[WORLD_LANDMARKS.length - 1].distanceFromStart;
      setTotalDistance(distance);

      let foundIndex = 0;
      for (let i = WORLD_LANDMARKS.length - 1; i >= 0; i--) {
        if (cycledDistance >= WORLD_LANDMARKS[i].distanceFromStart) {
          foundIndex = i;
          break;
        }
      }

      const foundLandmark = WORLD_LANDMARKS[foundIndex];

      if (foundLandmark.name !== currentLandmark.name) {
        setIsGlitching(true);
        setCurrentLandmark(foundLandmark);
        
        generateLocationScenery(foundLandmark).then(url => {
          if (url) setSceneryUrl(url);
          setTimeout(() => setIsGlitching(false), 800);
        });
        
        getCurrentWeather(foundLandmark.city).then(temp => setTemperature(temp));
      }
    };

    updateExpedition();
    const timer = setInterval(updateExpedition, 10000);
    return () => clearInterval(timer);
  }, [profile.adoptedAt, currentLandmark]);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [allMessages]);

  useEffect(() => {
    let animationFrame: number;
    const update = () => {
      setWalkCycle(prev => (prev + 0.015) % 1);
      animationFrame = requestAnimationFrame(update);
    };
    animationFrame = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  const handleSendText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;
    const userMsg: Message = { role: 'user', text: inputText, timestamp: Date.now() };
    setLocalMessages(prev => [...prev, userMsg]);
    setInputText(''); setIsTyping(true);
    try {
      const response = await getCatResponse(profile, allMessages, userMsg.text);
      setLocalMessages(prev => [...prev, { role: 'cat', text: response, timestamp: Date.now() }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="h-full w-full relative overflow-hidden flex flex-col bg-black text-white font-sans" onMouseMove={e => setMousePos({ x: (e.clientX/window.innerWidth)*2-1, y: (e.clientY/window.innerHeight)*2-1 })}>
      
      {/* 动态背景 */}
      <div className={`absolute inset-0 z-0 transition-all duration-[3000ms] ${isGlitching ? 'scale-110 opacity-40 blur-sm' : 'scale-105 opacity-60'}`} style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -4}px)` }}>
        {sceneryUrl ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sceneryUrl})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 to-black" />
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80" />
        <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10 shadow-[0_0_20px_white] animate-scanning opacity-20" />
      </div>

      {/* 1. 顶部 HUD (15%) */}
      <header className="relative z-40 h-[15vh] px-16 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-px w-6 bg-white/30" />
            <span className="text-[8px] font-bold uppercase tracking-[0.6em] text-white/30">Karma Origin / 缘起点</span>
          </div>
          <div className="relative pl-4 border-l-[1px] border-white/10">
            <h2 className="text-2xl font-serif italic text-white/95 leading-none">
              广州 <span className="text-base font-sans not-italic font-light opacity-30 ml-2 tracking-widest uppercase">CAN</span>
            </h2>
          </div>
        </div>

        <div className="flex gap-12 items-start text-right">
          <div className="flex flex-col items-end">
            <span className="text-[8px] font-bold uppercase tracking-[0.6em] text-white/20 mb-2">Pilgrimage / 行脚里程</span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-mono font-bold tracking-tighter text-white/80">
                {totalDistance.toFixed(1).padStart(7, '0')}
              </span>
              <span className="text-[9px] font-mono opacity-20 font-bold uppercase">km</span>
            </div>
          </div>
          <div className="flex flex-col items-end min-w-[100px]">
            <span className="text-[8px] font-bold uppercase tracking-[0.6em] text-white/20 mb-2">Atmosphere / 气象</span>
            <span className="text-3xl font-mono text-white/80 animate-pulse-slow">
              {temperature}
            </span>
          </div>
        </div>
      </header>

      {/* 2. 中部消息区域 (30%) */}
      <section className="relative z-20 h-[30vh] w-full flex flex-col justify-end px-16 pb-12">
        <div ref={scrollRef} className="max-h-full overflow-y-auto no-scrollbar space-y-8 mask-fade-top-bottom">
          {allMessages.slice(-2).map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-[1000ms]`}>
              <div className="flex items-center gap-3 mb-2 opacity-20">
                <span className="text-[7px] uppercase tracking-[0.5em] font-bold">{msg.role === 'user' ? 'Heart Wave / 心念' : profile.name}</span>
              </div>
              <p className={`max-w-[50%] font-serif text-xl leading-relaxed tracking-wide ${msg.role === 'user' ? 'text-white/20 italic text-right' : 'text-white/95 drop-shadow-xl'}`}>
                {msg.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. 底部巡游猫咪主体 (40%) */}
      <section className="relative z-10 h-[40vh] w-full pointer-events-none flex items-center justify-center">
        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 w-[350px] h-[60px] bg-white/5 blur-[60px] rounded-[100%] opacity-20" />
        <div className="relative" style={{ width: '400px', height: '400px' }}>
          <AnimatedCat 
            color={activeColor.hex} 
            colorId={profile.color}
            state={PalBotState.IDLE_SELF} 
            personality={profile.personality} 
            actionOverride="walk"
            walkCycle={walkCycle}
            scale={1.25}
          />
        </div>
      </section>

      {/* 4. 输入控制台 (15%) */}
      <footer className="relative z-30 h-[15vh] w-full flex items-center justify-center px-16">
        {!isVoiceActive && (
          <form onSubmit={handleSendText} className="w-full max-w-lg relative group">
            <input 
              type="text" value={inputText} onChange={e => setInputText(e.target.value)}
              placeholder="Offer your thoughts / 呈送心念..."
              className="w-full bg-transparent border-b border-white/5 focus:border-white/20 py-3 outline-none font-serif text-center text-lg tracking-[0.2em] text-white/30 placeholder:text-white/5 transition-all duration-1000"
            />
          </form>
        )}
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .mask-fade-top-bottom { 
          mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%); 
        }
        @keyframes scanning {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 0.1; }
          90% { opacity: 0.1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scanning { animation: scanning 15s linear infinite; }
        .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}} />
    </div>
  );
};

export default ChatInterface;
