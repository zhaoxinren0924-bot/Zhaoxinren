
import React, { useState } from 'react';
import { CAT_COLORS, INITIAL_PERSONALITY } from '../constants';
import { CatProfile, PalBotState } from '../types';
import AnimatedCat from './AnimatedCat';

interface CatSelectionProps {
  onSelect: (profile: CatProfile) => void;
  // Added isDarkMode prop to fix TS error in App.tsx
  isDarkMode?: boolean;
}

const CatSelection: React.FC<CatSelectionProps> = ({ onSelect, isDarkMode = true }) => {
  const [selectedColor, setSelectedColor] = useState(CAT_COLORS[0]);
  const [name, setName] = useState('圆觉');

  const handleAdopt = () => {
    const newProfile: CatProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || '禅师猫',
      color: selectedColor.id,
      archetype: 'Zen Master (禅师)',
      personality: { ...INITIAL_PERSONALITY },
      learnedContext: "已在南华寺法界中显化，准备开启这段尘世缘分。",
      adoptedAt: Date.now(),
      earFoldLevel: 0 // 初始化贴合度
    };
    onSelect(newProfile);
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 py-12 flex flex-col items-center ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif mb-2">迎请禅师猫</h1>
        <p className={`${isDarkMode ? 'text-white/30' : 'text-gray-400'} text-sm uppercase tracking-[0.5em] font-medium`}>Zen Master Invitation Ceremony</p>
      </div>

      <div className={`${isDarkMode ? 'bg-white/5 border-white/10 shadow-xl' : 'bg-white border-gray-100 shadow-2xl'} rounded-[3rem] p-12 border flex flex-col md:flex-row items-center gap-12 w-full max-w-3xl transition-all duration-1000`}>
        <div className="w-64 h-64 flex items-center justify-center">
          <AnimatedCat 
            color={selectedColor.hex} 
            colorId={selectedColor.id}
            state={PalBotState.IDLE_SELF} 
            scale={1.1} 
            personality={INITIAL_PERSONALITY}
            earFoldLevel={0}
          />
        </div>

        <div className="flex-1 space-y-8">
          <div>
            <label className={`block text-xs font-bold ${isDarkMode ? 'text-white/20' : 'text-gray-400'} uppercase tracking-widest mb-3`}>法名 (Sacred Name)</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full text-2xl font-serif border-b-2 ${isDarkMode ? 'border-white/10 focus:border-white/40' : 'border-gray-100 focus:border-gray-900'} outline-none pb-2 transition-colors bg-transparent ${isDarkMode ? 'text-white' : 'text-gray-900'}`}
              placeholder="请输入法名..."
            />
          </div>

          <div>
            <label className={`block text-xs font-bold ${isDarkMode ? 'text-white/20' : 'text-gray-400'} uppercase tracking-widest mb-3`}>色蕴 (Aura Color)</label>
            <div className="flex gap-4">
              {CAT_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor.id === color.id ? (isDarkMode ? 'border-white scale-125 shadow-[0_0_12px_rgba(255,255,255,0.3)]' : 'border-gray-900 scale-125 shadow-lg') : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: color.hex }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <button 
            onClick={handleAdopt}
            className={`w-full py-4 ${isDarkMode ? 'bg-white text-black hover:bg-white/90' : 'bg-gray-900 text-white hover:bg-gray-800'} rounded-2xl font-bold uppercase tracking-widest transition-all transform active:scale-95 shadow-xl`}
          >
            迎请法身
          </button>
        </div>
      </div>
      
      <p className={`mt-8 ${isDarkMode ? 'text-white/20' : 'text-gray-400'} text-[10px] text-center max-w-md uppercase tracking-wider leading-relaxed`}>
        本系统致力于通过数字交互探索禅宗智慧。禅师猫的行为由其独特的性格矩阵驱动，请以清净心待之。
      </p>
    </div>
  );
};

export default CatSelection;
