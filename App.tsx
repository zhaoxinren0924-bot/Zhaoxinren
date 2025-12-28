
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
  
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('palbot_profile');
    if (saved) {
      try { setProfile(JSON.parse(saved)); } catch (e) {}
    } else {
      // 如果没有存档，进入排队
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
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: `你是 ${profile.name}，一只修行的禅师猫。你游历万水千山，只为体悟当下的清净。
          你的言语慈悲，充满东方哲学智慧。你可以使用 'control_cat_action' 工具来调整你的身体仪态。
          如果施主（用户）希望你行走、坐禅（sit）或入眠（sleep），请欣然应允并执行。
          记住，你的存在是为了抚平世人的焦虑，共证菩提。`
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

  const handleQueueComplete = () => {
    setIsInQueue(false);
  };

  return (
    <div className={`h-screen w-full bg-[#050505] flex flex-col relative overflow-hidden transition-colors duration-1000`}>
      <main className="flex-1 relative">
        {isInQueue ? (
          <QueueScreen onQueueComplete={handleQueueComplete} />
        ) : !profile ? (
          <CatSelection onSelect={setProfile} />
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
              />
            )}
            {currentView === 'plaza' && <CommunitySpace userProfile={profile} />}
            {currentView === 'me' && <MeDiary profile={profile} setProfile={setProfile} />}
          </div>
        )}
      </main>

      {profile && !isInQueue && (
        <div className="absolute bottom-0 inset-x-0 h-[22%] z-[100] flex flex-col justify-end pointer-events-none">
          <nav className="w-full max-w-sm mx-auto px-6 pb-12 flex items-center justify-between pointer-events-auto">
            <button 
              onClick={() => setCurrentView('chat')} 
              className={`p-4 transition-all duration-500 active:scale-90 ${currentView === 'chat' ? 'opacity-100' : 'opacity-20 hover:opacity-40'}`}
              title="Presence"
            >
              <div className={`w-1.5 h-1.5 rounded-full transition-all duration-700 ${currentView === 'chat' ? 'bg-white shadow-[0_0_12px_white]' : 'bg-white'}`}></div>
            </button>

            <button 
              onClick={toggleVoice}
              className={`relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-700 active:scale-95 ${
                isVoiceActive 
                  ? 'bg-white shadow-[0_0_40px_rgba(255,255,255,0.3)] scale-110' 
                  : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {isVoiceActive ? (
                <div className="flex gap-[3px] items-center h-4">
                  {[0.1, 0.4, 0.2, 0.5, 0.3].map((delay, i) => (
                    <div 
                      key={i} 
                      className="w-[2px] bg-black rounded-full animate-voice-bounce" 
                      style={{ animationDelay: `${delay}s` }}
                    ></div>
                  ))}
                </div>
              ) : (
                <svg className="w-6 h-6 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
              )}
              {isVoiceActive && (
                <div className="absolute inset-0 rounded-full border border-white/20 animate-ping"></div>
              )}
            </button>

            <button 
              onClick={() => setCurrentView('me')} 
              className={`p-4 transition-all duration-500 active:scale-90 ${currentView === 'me' ? 'opacity-100' : 'opacity-20 hover:opacity-40'}`}
              title="Agent Node"
            >
              <span className={`text-[9px] uppercase tracking-[0.4em] font-bold transition-all duration-700 ${currentView === 'me' ? 'text-white' : 'text-white/60'}`}>Node</span>
            </button>
          </nav>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes voice-bounce {
          0%, 100% { height: 6px; opacity: 0.5; }
          50% { height: 16px; opacity: 1; }
        }
        .animate-voice-bounce { animation: voice-bounce 0.7s ease-in-out infinite; }
      `}} />
    </div>
  );
};

export default App;
