
import React from 'react';
import { CatProfile, DiaryEntry } from '../types';
import PersonalityChart from './PersonalityChart';

interface MeDiaryProps {
  profile: CatProfile;
  setProfile: (profile: CatProfile) => void;
  isDarkMode?: boolean;
}

const MeDiary: React.FC<MeDiaryProps> = ({ profile, setProfile, isDarkMode = true }) => {
  const diary = profile.diary || [];

  const handleResetData = () => {
    if (confirm("终止这段善缘将抹去所有的修行记录。施主确定吗？")) {
      localStorage.removeItem('palbot_profile');
      window.location.reload();
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'Joyful': return isDarkMode ? 'text-amber-400 bg-amber-900/20' : 'text-amber-500 bg-amber-50';
      case 'Calm': return isDarkMode ? 'text-slate-400 bg-slate-900/20' : 'text-slate-500 bg-slate-50';
      case 'Anxious': return isDarkMode ? 'text-rose-400 bg-rose-900/20' : 'text-rose-500 bg-rose-50';
      case 'Inspired': return isDarkMode ? 'text-indigo-400 bg-indigo-900/20' : 'text-indigo-500 bg-indigo-50';
      default: return isDarkMode ? 'text-gray-400 bg-gray-900/20' : 'text-gray-500 bg-gray-50';
    }
  };

  return (
    <div className={`h-full w-full overflow-y-auto px-8 py-16 no-scrollbar transition-colors duration-[2000ms] ${isDarkMode ? 'bg-[#0A0A0A] text-white' : 'bg-[#FCFCF9] text-gray-900'} animate-in fade-in duration-1000`}>
      <div className="max-w-2xl mx-auto space-y-20">
        
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
             <div className={`w-28 h-28 rounded-full border ${isDarkMode ? 'border-white/5 bg-white/5' : 'border-gray-100 bg-white'} p-2 shadow-sm`}>
               <div className={`w-full h-full rounded-full ${isDarkMode ? 'bg-gradient-to-br from-[#2A2A2A] to-[#1A1A1A] text-white/60' : 'bg-gradient-to-br from-[#E8E8E1] to-[#D1D1CB] text-[#4A4E52]'} flex items-center justify-center text-4xl font-serif`}>
                 {profile.name[0]}
               </div>
             </div>
             <div className={`absolute -bottom-1 -right-1 w-6 h-6 ${isDarkMode ? 'bg-gray-400' : 'bg-[#C2A878]'} border-4 ${isDarkMode ? 'border-[#0A0A0A]' : 'border-white'} rounded-full shadow-sm`}></div>
          </div>
          <div className="text-center">
            <h2 className="text-3xl font-serif mb-1">{profile.name}</h2>
            <p className={`text-[10px] uppercase tracking-[0.5em] ${isDarkMode ? 'text-white/20' : 'text-gray-400'} font-bold`}>Zen Master Node / 禅意节点</p>
          </div>
        </div>

        <section className={`${isDarkMode ? 'bg-white/5 border-white/5 shadow-none' : 'bg-white border-gray-100 shadow-[0_10px_40px_rgba(0,0,0,0.02)]'} rounded-[3.5rem] p-10 border`}>
           <h3 className={`text-[10px] uppercase tracking-[0.6em] ${isDarkMode ? 'text-white/10' : 'text-gray-300'} font-bold mb-10 text-center`}>Spiritual Matrix / 修行矩阵</h3>
           <PersonalityChart traits={profile.personality} />
        </section>

        <section className="space-y-10">
          <div className="flex items-end justify-between px-4">
            <div>
              <h3 className="text-2xl font-serif italic">Dharma Reflections</h3>
              <p className={`text-[9px] uppercase tracking-[0.4em] ${isDarkMode ? 'text-white/20' : 'text-gray-300'} font-bold mt-2`}>Spiritual Logs / 禅思录</p>
            </div>
            <span className={`text-[11px] ${isDarkMode ? 'text-white/10' : 'text-gray-300'} font-bold tracking-widest`}>{diary.length} GATHAS</span>
          </div>

          <div className="space-y-8">
            {diary.length > 0 ? diary.map((entry) => (
              <div key={entry.id} className={`${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-gray-100 shadow-sm'} p-8 rounded-[2.5rem] border hover:shadow-lg transition-all duration-500 group`}>
                <div className="flex justify-between items-start mb-6">
                  <span className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] ${getMoodColor(entry.mood)}`}>
                    {entry.mood}
                  </span>
                  <span className={`text-[10px] ${isDarkMode ? 'text-white/20' : 'text-gray-300'} font-mono tracking-tighter`}>
                    {new Date(entry.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <p className={`font-serif text-xl leading-relaxed mb-6 italic ${isDarkMode ? 'text-white/80' : 'text-gray-800'}`}>
                  "{entry.reflection}"
                </p>
                <div className={`pt-6 border-t ${isDarkMode ? 'border-white/5' : 'border-gray-50'} flex gap-4 items-start`}>
                   <div className={`w-7 h-7 rounded-full ${isDarkMode ? 'bg-white/10 text-white/40 border-white/5' : 'bg-[#fdfcf0] text-[#C2A878] border-gray-100'} border flex-none flex items-center justify-center text-[10px] font-bold`}>
                     {profile.name[0]}
                   </div>
                   <p className={`text-sm ${isDarkMode ? 'text-white/40' : 'text-gray-500'} leading-relaxed font-light`}>
                     {entry.agentNote}
                   </p>
                </div>
              </div>
            )) : (
              <div className={`${isDarkMode ? 'bg-white/2 border-white/5' : 'bg-gray-50/50 border-gray-200'} border border-dashed p-16 rounded-[3.5rem] text-center`}>
                <p className={`font-serif italic text-xl mb-3 ${isDarkMode ? 'text-white/20' : 'text-gray-300'}`}>万籁俱寂，尚无修行录。</p>
              </div>
            )}
          </div>
        </section>

        <div className="pt-16 border-t border-gray-100/10 flex flex-col items-center gap-8 pb-12">
          <button onClick={handleResetData} className={`text-[10px] ${isDarkMode ? 'text-white/10 hover:text-rose-900' : 'text-gray-300 hover:text-red-400'} font-bold uppercase tracking-[0.6em] transition-all`}>
            Terminal Reset / 终止缘分
          </button>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{ __html: `.no-scrollbar::-webkit-scrollbar { display: none; }` }} />
    </div>
  );
};

export default MeDiary;
