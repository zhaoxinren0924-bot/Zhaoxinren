
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage, Type, FunctionDeclaration } from '@google/genai';
import { CatProfile, Message } from './types';
import CatSelection from './components/CatSelection';
import ChatInterface from './components/ChatInterface';
import CommunitySpace from './components/CommunitySpace';
import MeDiary from './components/MeDiary';
import QueueScreen from './components/QueueScreen';
import { decode, decodeAudioData, createBlob } from './services/audioUtils';

const App: React.FC = () => {
  const [profile, setProfile] = useState<CatProfile | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'plaza' | 'me'>('chat');
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [liveMessages, setLiveMessages] = useState<Message[]>([]);
  const [voiceAction, setVoiceAction] = useState<{ action: string; targetX?: number } | null>(null);
  const [isInQueue, setIsInQueue] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // 昼夜感知逻辑：6点到18点为白昼（浅色），其余时间为黑夜（深色）
    const checkTheme = () => {
      const hour = new Date().getHours();
      setIsDarkMode(hour < 6 || hour >= 18);
    };
    checkTheme();
    const timer = setInterval(checkTheme, 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('palbot_profile');
    if (saved) {
      try { setProfile(JSON.parse(saved)); } catch (e) {}
    } else {
      setIsInQueue(true);
    }
  }, []);

  useEffect(() => {
    if (profile) localStorage.setItem('palbot_profile', JSON.stringify(profile));
  }, [profile]);

  const toggleVoice = async () => {
    if (isVoiceActive) {
      stopVoiceSession();
    } else {
      await startVoiceSession();
    }
  };

  const controlCatActionDeclaration: FunctionDeclaration = {
    name: 'control_cat_action',
    parameters: {
      type: Type.OBJECT,
      description: 'Control the physical actions of the bionic cat companion.',
      properties: {
        action: {
          type: Type.STRING,
          description: 'The specific movement to perform.',
          enum: ['sit', 'walk', 'crouch', 'jump', 'sleep']
        },
        targetX: {
          type: Type.NUMBER,
          description: 'The horizontal destination coordinate (0-100) if the action is "walk".'
        }
      },
      required: ['action']
    }
  };

  const startVoiceSession = async () => {
    if (!profile) return;
    try {
      setIsVoiceActive(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputCtx, output: outputCtx };
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      let currentInput = "";
      let currentOutput = "";

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              sessionPromise.then(s => s.sendRealtimeInput({ media: createBlob(inputData) }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (m: LiveServerMessage) => {
            if (m.toolCall) {
              for (const fc of m.toolCall.functionCalls) {
                if (fc.name === 'control_cat_action') {
                  const args = fc.args as { action: string; targetX?: number };
                  setVoiceAction({ action: args.action, targetX: args.targetX });
                  if (args.action === 'jump') {
                    setTimeout(() => setVoiceAction(null), 1000);
                  }
                  sessionPromise.then(session => {
                    session.sendToolResponse({
                      functionResponses: {
                        id: fc.id,
                        name: fc.name,
                        response: { result: "Action initiated successfully." }
                      }
                    });
                  });
                }
              }
            }

            if (m.serverContent?.inputTranscription) currentInput += m.serverContent.inputTranscription.text;
            if (m.serverContent?.outputTranscription) currentOutput += m.serverContent.outputTranscription.text;
            
            if (m.serverContent?.turnComplete) {
              if (currentInput || currentOutput) {
                setLiveMessages(p => {
                  const newMsgs: Message[] = [
                    { role: 'user', text: currentInput, timestamp: Date.now() },
                    { role: 'cat', text: currentOutput, timestamp: Date.now() }
                  ];
                  return [...p, ...newMsgs].slice(-10);
                });
                currentInput = ""; currentOutput = "";
              }
            }
            
            const base64 = m.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64) {
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              const buffer = await decodeAudioData(decode(base64), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(outputCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            
            if (m.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => { try { s.stop(); } catch(e) {} });
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsVoiceActive(false),
          onerror: () => setIsVoiceActive(false)
        },
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          tools: [{ functionDeclarations: [controlCatActionDeclaration] }],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: `你是 ${profile.name}，一只修行的禅师猫。语气始终慈悲（统一使用 Kore 音色）。如果你愿意，可以使用 'control_cat_action' 工具展现你的仪态。`
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error("Voice Sync Failure:", e);
      setIsVoiceActive(false);
    }
  };

  const stopVoiceSession = () => {
    sessionRef.current?.close();
    streamRef.current?.getTracks().forEach(t => t.stop());
    audioContextsRef.current?.input.close();
    audioContextsRef.current?.output.close();
    setIsVoiceActive(false);
    setVoiceAction(null);
  };

  return (
    <div className={`h-screen w-full transition-colors duration-[2000ms] ${isDarkMode ? 'bg-[#050505] text-white' : 'bg-[#F5F5F0] text-gray-900'} flex flex-col relative overflow-hidden`}>
      <main className="flex-1 relative">
        {isInQueue ? (
          <QueueScreen onQueueComplete={() => setIsInQueue(false)} isDarkMode={isDarkMode} />
        ) : !profile ? (
          <CatSelection onSelect={setProfile} isDarkMode={isDarkMode} />
        ) : (
          <div className="h-full w-full">
            {currentView === 'chat' && (
              <ChatInterface 
                profile={profile} 
                setProfile={setProfile} 
                onGoToStore={() => {}} 
                externalMessages={liveMessages} 
                isVoiceActive={isVoiceActive}
                voiceAction={voiceAction}
                isDarkMode={isDarkMode}
              />
            )}
            {currentView === 'plaza' && <CommunitySpace userProfile={profile} isDarkMode={isDarkMode} />}
            {currentView === 'me' && <MeDiary profile={profile} setProfile={setProfile} isDarkMode={isDarkMode} />}
          </div>
        )}
      </main>

      {profile && !isInQueue && (
        <div className="absolute bottom-0 inset-x-0 h-[22%] z-[100] flex flex-col justify-end pointer-events-none">
          <nav className="w-full max-sm mx-auto px-6 pb-12 flex items-center justify-between pointer-events-auto">
            <button onClick={() => setCurrentView('chat')} className={`p-4 transition-all duration-500 ${currentView === 'chat' ? 'opacity-100' : 'opacity-20'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-white shadow-[0_0_12px_white]' : 'bg-gray-900 shadow-[0_0_8px_rgba(0,0,0,0.3)]'}`}></div>
            </button>

            <button onClick={toggleVoice} className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 ${isVoiceActive ? (isDarkMode ? 'bg-white' : 'bg-gray-900') : (isDarkMode ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10')} border`}>
              {isVoiceActive ? (
                <div className="flex gap-[3px] items-center h-4">
                  {[0.1, 0.4, 0.2, 0.5, 0.3].map((delay, i) => (
                    <div key={i} className={`w-[2px] ${isDarkMode ? 'bg-black' : 'bg-white'} rounded-full animate-voice-bounce`} style={{ animationDelay: `${delay}s` }}></div>
                  ))}
                </div>
              ) : (
                <svg className={`w-6 h-6 ${isDarkMode ? 'text-white/40' : 'text-black/40'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              )}
            </button>

            <button onClick={() => setCurrentView('me')} className={`p-4 transition-all duration-500 ${currentView === 'me' ? 'opacity-100' : 'opacity-20'}`}>
              <span className={`text-[9px] uppercase tracking-[0.4em] font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Node</span>
            </button>
          </nav>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes voice-bounce { 0%, 100% { height: 6px; opacity: 0.5; } 50% { height: 16px; opacity: 1; } }
        .animate-voice-bounce { animation: voice-bounce 0.7s ease-in-out infinite; }
      `}} />
    </div>
  );
};

export default App;
