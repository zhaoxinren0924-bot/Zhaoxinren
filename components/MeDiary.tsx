
import React from 'react';
import { CatProfile, DiaryEntry } from '../types';
import PersonalityChart from './PersonalityChart';

interface MeDiaryProps {
  profile: CatProfile;
  setProfile: (profile: CatProfile) => void;
}

const MeDiary: React.FC<MeDiaryProps> = ({ profile, setProfile }) => {
  const diary = profile.diary || [];

  const handleResetData = () => {
    if (confirm("Resetting will terminate the neural bond and wipe all scholarly reflections. Proceed?")) {
      localStorage.removeItem('palbot_profile');
      window.location.reload();
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'Joyful': return 'text-amber-500 bg-amber-50';
      case 'Calm': return 'text-slate-500 bg-slate-50';
      case 'Anxious': return 'text-rose-500 bg-rose-50';
      case 'Inspired': return 'text-indigo-500 bg-indigo-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className="h-full w-full overflow-y-auto px-8 py-16 no-scrollbar bg-[#fcfcfc] animate-in fade-in duration-1000">
      <div className="max-w-2xl mx-auto space-y-20">
        
        {/* Scholar Header */}
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
             <div className="w-28 h-28 rounded-full border border-gray-100 p-2 bg-white shadow-sm">
               <div className="w-full h-full rounded-full bg-gradient-to-br from-[#E8E8E1] to-[#D1D1CB] flex items-center justify-center text-[#4A4E52] text-4xl font-serif">
                 {profile.name[0]}
               </div>
             </div>
             <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#C2A878] border-4 border-white rounded-full shadow-sm"></div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-serif text-gray-900 mb-1">{profile.name}</h2>
            <p className="text-[10px] uppercase tracking-[0.5em] text-gray-400 font-bold">Parallel Life Agent Node</p>
          </div>
        </div>

        {/* Neural Parameters */}
        <section className="bg-white rounded-[3.5rem] p-10 border border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]">
           <h3 className="text-[10px] uppercase tracking-[0.6em] text-gray-300 font-bold mb-10 text-center">Bionic Personality Matrix</h3>
           <PersonalityChart traits={profile.personality} />
        </section>

        {/* Scholarly Reflections */}
        <section className="space-y-10">
          <div className="flex items-end justify-between px-4">
            <div>
              <h3 className="text-2xl font-serif italic text-gray-800">Neural Reflections</h3>
              <p className="text-[9px] uppercase tracking-[0.4em] text-gray-300 font-bold mt-2">Chronological Pulse Logs</p>
            </div>
            <span className="text-[11px] text-gray-300 font-bold tracking-widest">{diary.length} LOGS</span>
          </div>

          <div className="space-y-8">
            {diary.length > 0 ? diary.map((entry) => (
              <div key={entry.id} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-500 group">
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${getMoodColor(entry.mood)}`}>
                    {entry.mood}
                  </span>
                  <span className="text-[10px] text-gray-300 font-mono tracking-tighter">
                    {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className="text-gray-800 font-serif text-xl leading-relaxed mb-6 italic">
                  "{entry.reflection}"
                </p>
                <div className="pt-6 border-t border-gray-50 flex gap-4 items-start">
                   <div className="w-7 h-7 rounded-full bg-[#fdfcf0] border border-gray-100 flex-none flex items-center justify-center text-[10px] font-bold text-[#C2A878]">
                     {profile.name[0]}
                   </div>
                   <p className="text-sm text-gray-500 leading-relaxed font-light">
                     {entry.agentNote}
                   </p>
                </div>
              </div>
            )) : (
              <div className="bg-gray-50/50 border border-dashed border-gray-200 p-16 rounded-[3.5rem] text-center">
                <p className="text-gray-300 font-serif italic text-xl mb-3">No reflections recorded yet.</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] leading-relaxed max-w-xs mx-auto">
                  Engage in neural sync sessions to document your parallel journey.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* System Terminal */}
        <div className="pt-16 border-t border-gray-100 flex flex-col items-center gap-8 pb-12">
          <button 
            onClick={handleResetData}
            className="text-[10px] text-gray-300 hover:text-red-400 font-bold uppercase tracking-[0.6em] transition-all"
          >
            Terminal Reset / 终止连接
          </button>
          <div className="flex gap-4 opacity-20">
            <span className="text-[8px] text-gray-400 uppercase tracking-widest">Protocol 2.5.A</span>
            <span className="text-[8px] text-gray-400 uppercase tracking-widest">Grounded Bionics</span>
          </div>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
};

export default MeDiary;
