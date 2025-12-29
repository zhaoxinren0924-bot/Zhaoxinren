
import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { PalBotState, Message, CatProfile, Landmark } from '../types';
import { getCatResponse, generateLocationScenery, getCurrentWeather, getCatSpeech } from '../services/geminiService';
import { decode, decodeAudioData } from '../services/audioUtils';
import AnimatedCat from './AnimatedCat';
import { CAT_COLORS, TRAVEL_SPEED_KMH, WORLD_LANDMARKS } from '../constants';

interface ChatInterfaceProps {
  profile: CatProfile;
  setProfile: (profile: CatProfile) => void;
  onGoToStore: () => void;
  externalMessages?: Message[];
  isVoiceActive?: boolean;
  voiceAction?: { action: string; targetX?: number } | null;
  isDarkMode?: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  profile, setProfile, onGoToStore, externalMessages = [], isVoiceActive = false, voiceAction = null, isDarkMode = true
}) => {
  const [localMessages, setLocalMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [sceneryUrl, setSceneryUrl] = useState<string | null>(null);
  const [currentLandmark, setCurrentLandmark] = useState<Landmark>(WORLD_LANDMARKS[0]);
  const [totalDistance, setTotalDistance] = useState(0);
  const [temperature, setTemperature] = useState<string>('--°C');
  const [isGlitching, setIsGlitching] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
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

  const playCatSpeech = async (text: string) => {
    if (!isAudioEnabled) return;
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') await audioContextRef.current.resume();
    const base64 = await getCatSpeech(text);
    if (base64) {
      const audioBuffer = await decodeAudioData(decode(base64), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContextRef.current.destination);
      source.start();
    }
  };

  const handleSendText = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputText.trim() || isTyping) return;
    
    const userMsg: Message = { role: 'user', text: inputText, timestamp: Date.now() };
    setLocalMessages(prev => [...prev, userMsg]);
    setInputText(''); 
    setIsTyping(true);

    try {
      const response = await getCatResponse(profile, allMessages, userMsg.text);
      const catMsg: Message = { role: 'cat', text: response, timestamp: Date.now() };
      setLocalMessages(prev => [...prev, catMsg]);
      
      // 动态觉醒琥珀眼：当提及相关关键词或交流超过 3 轮
      let newEyeState = profile.eyeState;
      const triggerWords = ['眼', '琥珀', '智慧', '光', '开悟', '真实'];
      const shouldAwaken = triggerWords.some(w => userMsg.text.includes(w)) || allMessages.length > 6;
      
      if (shouldAwaken && profile.eyeState !== 'amber') {
        newEyeState = 'amber';
      }

      const nextFold = Math.min(1.0, (profile.earFoldLevel || 0) + 0.03);
      setProfile({ ...profile, earFoldLevel: nextFold, eyeState: newEyeState });
      playCatSpeech(response);
    } finally { 
      setIsTyping(false); 
    }
  };

  const displayLandmarkName = currentLandmark.name.split(' (')[0];
  const displayCityCode = currentLandmark.city === 'Shaoguan' ? 'SHA' : currentLandmark.city.substring(0, 3).toUpperCase();

  const themeText = isDarkMode ? 'text-white' : 'text-gray-900';
  const themeSubtext = isDarkMode ? 'text-white/30' : 'text-gray-400';
  const themeBorder = isDarkMode ? 'border-white/10' : 'border-gray-900/10';

  return (
    <div className={`h-full w-full relative overflow-hidden flex flex-col transition-colors duration-[2000ms] ${isDarkMode ? 'bg-black text-white' : 'bg-[#FDFDF8] text-gray-900'}`} onMouseMove={e => setMousePos({ x: (e.clientX/window.innerWidth)*2-1, y: (e.clientY/window.innerHeight)*2-1 })}>
      
      {/* 背景层 */}
      <div className={`absolute inset-0 z-0 transition-all duration-[3000ms] ${isGlitching ? 'scale-110 opacity-30 blur-sm' : 'scale-105 opacity-60'}`} style={{ transform: `translate(${mousePos.x * -8}px, ${mousePos.y * -4}px)` }}>
        {sceneryUrl ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${sceneryUrl})` }} />
        ) : (
          <div className={`absolute inset-0 ${isDarkMode ? 'bg-gradient-to-b from-blue-950/20 to-black' : 'bg-gradient-to-b from-amber-50/40 to-[#FDFDF8]'}`} />
        )}
        <div className={`absolute inset-0 ${isDarkMode ? 'bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] opacity-80' : 'bg-[radial-gradient(circle_at_center,transparent_0%,#FDFDF8_100%)] opacity-50'}`} />
      </div>

      {/* 头部导航/状态栏 */}
      <header className="relative z-40 h-[15vh] px-16 flex items-center justify-between pointer-events-none">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-2">
            <div className={`h-px w-6 ${isDarkMode ? 'bg-white/30' : 'bg-gray-300'}`} />
            <span className={`text-[8px] font-bold uppercase tracking-[0.6em] ${themeSubtext}`}>Karma Origin / 缘起点</span>
          </div>
          <div className={`relative pl-4 border-l-[1px] ${themeBorder}`}>
            <h2 className={`text-2xl font-serif italic ${isDarkMode ? 'text-white/95' : 'text-gray-900'} leading-none`}>
              {displayLandmarkName} <span className={`text-base font-sans not-italic font-light opacity-30 ml-2 tracking-widest uppercase`}>{displayCityCode}</span>
            </h2>
          </div>
        </div>

        <div className="absolute left-1/2 -translate-x-1/2 top-10 flex flex-col items-center">
          <span className={`text-[8px] font-bold uppercase tracking-[0.4em] ${themeSubtext} mb-2`}>Alignment / 威仪贴合</span>
          <div className={`w-32 h-[1px] ${isDarkMode ? 'bg-white/5' : 'bg-gray-900/5'} relative`}>
            <div className={`absolute left-0 top-0 h-full ${isDarkMode ? 'bg-white/40 shadow-[0_0_8px_white]' : 'bg-gray-900/60'} transition-all duration-1000`} style={{ width: `${(profile.earFoldLevel || 0) * 100}%` }} />
          </div>
        </div>

        <div className="flex gap-12 items-start text-right">
          <div className="flex flex-col items-end">
            <span className={`text-[8px] font-bold uppercase tracking-[0.6em] ${themeSubtext} mb-2`}>Pilgrimage / 行脚里程</span>
            <div className="flex items-baseline gap-1">
              <span className={`text-3xl font-mono font-bold tracking-tighter ${isDarkMode ? 'text-white/80' : 'text-gray-900/80'}`}>
                {totalDistance.toFixed(1).padStart(7, '0')}
              </span>
              <span className={`text-[9px] font-mono opacity-20 font-bold uppercase`}>km</span>
            </div>
          </div>
          <div className="flex flex-col items-end min-w-[100px] pointer-events-auto">
             <button onClick={() => setIsAudioEnabled(!isAudioEnabled)} className={`text-[8px] font-bold uppercase tracking-[0.6em] ${themeSubtext} mb-2 hover:opacity-100 transition-opacity`}>
              {isAudioEnabled ? 'Voice ON / 法音流转' : 'Voice OFF / 默然修持'}
            </button>
            <span className={`text-3xl font-mono ${isDarkMode ? 'text-white/80' : 'text-gray-900/80'} animate-pulse-slow`}>
              {temperature}
            </span>
          </div>
        </div>
      </header>

      {/* 消息历史区域 */}
      <section className="relative z-20 h-[25vh] w-full flex flex-col justify-end px-16 pb-6">
        <div ref={scrollRef} className="max-h-full overflow-y-auto no-scrollbar space-y-8 mask-fade-top-bottom">
          {allMessages.slice(-2).map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-[1000ms]`}>
              <div className="flex items-center gap-3 mb-2 opacity-20">
                <span className={`text-[7px] uppercase tracking-[0.5em] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{msg.role === 'user' ? 'Heart Wave / 心念' : profile.name}</span>
              </div>
              <p className={`max-w-[50%] font-serif text-xl leading-relaxed tracking-wide ${msg.role === 'user' ? (isDarkMode ? 'text-white/20 italic text-right' : 'text-gray-400 italic text-right') : (isDarkMode ? 'text-white/95 drop-shadow-xl' : 'text-gray-800')}`}>
                {msg.text}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 猫咪展示区域 */}
      <section className="relative z-10 h-[45vh] w-full pointer-events-none flex items-center justify-center">
        <div className="relative -translate-y-24 flex flex-col items-center">
          <div className={`absolute bottom-10 left-1/2 -translate-x-1/2 w-[350px] h-[60px] ${isDarkMode ? 'bg-white/5' : 'bg-black/5'} blur-[60px] rounded-[100%] opacity-20`} />
          
          <div className="relative" style={{ width: '400px', height: '400px' }}>
            <AnimatedCat 
              color={activeColor.hex} 
              colorId={profile.color}
              state={isTyping ? PalBotState.INTERACTION : PalBotState.IDLE_SELF} 
              personality={profile.personality} 
              earFoldLevel={profile.earFoldLevel || 0}
              eyeState={profile.eyeState || 'default'}
              actionOverride={voiceAction?.action as any || (isTyping ? 'stand' : 'sit')}
              walkCycle={walkCycle}
              scale={1.35}
            />
          </div>
        </div>
      </section>

      {/* 底部输入区域 */}
      <footer className="relative z-30 h-[15vh] w-full flex items-center justify-center px-16">
        {!isVoiceActive && (
          <form onSubmit={handleSendText} className="w-full max-w-lg relative group -translate-y-8">
            <input 
              type="text" value={inputText} onChange={e => setInputText(e.target.value)}
              placeholder="Offer your thoughts / 呈送心念..."
              className={`w-full bg-transparent border-b ${isDarkMode ? 'border-white/5 focus:border-white/20 text-white/30' : 'border-gray-900/10 focus:border-gray-900/30 text-gray-900/40'} py-3 outline-none font-serif text-center text-lg tracking-[0.2em] placeholder:opacity-20 transition-all duration-1000`}
            />
          </form>
        )}
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .mask-fade-top-bottom { 
          mask-image: linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%); 
        }
        .animate-pulse-slow { animation: pulse 8s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
      `}} />
    </div>
  );
};

export default ChatInterface;
