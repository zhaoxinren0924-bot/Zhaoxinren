
import React, { useState, useEffect } from 'react';
import { CatProfile } from './types';
import CatSelection from './components/CatSelection';
import ChatInterface from './components/ChatInterface';
import EmbodiedStore from './components/EmbodiedStore';
import CommunitySpace from './components/CommunitySpace';
import MeDiary from './components/MeDiary';

const App: React.FC = () => {
  const [profile, setProfile] = useState<CatProfile | null>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'store' | 'plaza' | 'me'>('chat');
  const [headerVisible, setHeaderVisible] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('palbot_profile');
    if (saved) {
      try {
        setProfile(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load saved profile");
      }
    }
  }, []);

  useEffect(() => {
    if (profile) {
      localStorage.setItem('palbot_profile', JSON.stringify(profile));
    }
  }, [profile]);

  // Downweighting: Fades header into background noise after 5s
  useEffect(() => {
    if (currentView === 'chat') {
      const timer = setTimeout(() => setHeaderVisible(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setHeaderVisible(true);
    }
  }, [currentView]);

  const handleUpdateProfile = (newProfile: CatProfile) => {
    setProfile(newProfile);
  };

  return (
    <div 
      className={`h-screen w-full ${currentView === 'chat' ? 'bg-[#1a1a1c]' : 'bg-[#fcfcfc]'} text-gray-900 flex flex-col relative overflow-hidden select-none transition-colors duration-[2000ms]`}
      onClick={() => setHeaderVisible(true)}
    >
      {/* Downweighted Header: Environment Nameplate (Redline 1) */}
      <header 
        className={`flex-none h-12 flex items-center justify-between px-8 z-[100] transition-all duration-[2500ms] ease-in-out ${
          currentView === 'chat' 
            ? `bg-transparent ${headerVisible ? 'opacity-20' : 'opacity-[0.05]'}` 
            : 'bg-white opacity-100'
        }`}
      >
        <div className="flex gap-1 items-end scale-[0.6]">
           <div className="w-1 h-2 bg-current opacity-30"></div>
           <div className="w-1 h-3.5 bg-current opacity-60"></div>
           <div className="w-1 h-4 bg-current"></div>
        </div>
        <h1 className="font-serif text-[8px] tracking-[1em] uppercase font-bold text-center">PalBot Digital</h1>
        <div className="w-5 h-5 flex items-center justify-center opacity-30 scale-75">
           <div className="w-4 h-2 border border-current rounded-sm"></div>
        </div>
      </header>

      {/* Layer 0-2 Viewport */}
      <main className="flex-1 relative overflow-hidden">
        {!profile ? (
          <CatSelection onSelect={setProfile} />
        ) : (
          <div className="h-full w-full relative">
            {currentView === 'chat' && (
              <ChatInterface profile={profile} setProfile={handleUpdateProfile} onGoToStore={() => setCurrentView('store')} />
            )}
            {currentView === 'plaza' && <CommunitySpace userProfile={profile} />}
            {currentView === 'store' && <EmbodiedStore profile={profile} onBack={() => setCurrentView('chat')} />}
            {currentView === 'me' && <MeDiary profile={profile} setProfile={handleUpdateProfile} />}
          </div>
        )}
      </main>

      {/* Layer 3: Meta Navigation (Contextual) */}
      {profile && (
        <nav 
          className={`flex-none h-16 flex items-center justify-around z-[100] px-10 pb-4 transition-all duration-[2000ms] ${
            currentView === 'chat' 
              ? 'bg-transparent text-white/5 hover:text-white/20' 
              : 'bg-white border-t border-gray-50 text-gray-300'
          }`}
        >
          <button onClick={() => setCurrentView('chat')} className={`transition-all ${currentView === 'chat' ? 'text-white/60 scale-110' : ''}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </button>
          
          <button onClick={() => setCurrentView('plaza')} className={`transition-all ${currentView === 'plaza' ? 'text-gray-900 scale-110' : ''}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
          </button>

          <button onClick={() => setCurrentView('me')} className={`transition-all ${currentView === 'me' ? 'text-gray-900 scale-110' : ''}`}>
             <span className="text-[8px] uppercase tracking-[0.5em] font-bold font-serif">Me</span>
          </button>
        </nav>
      )}
    </div>
  );
};

export default App;
