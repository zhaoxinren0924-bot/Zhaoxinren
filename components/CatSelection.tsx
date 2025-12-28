
import React, { useState } from 'react';
import { CAT_COLORS, INITIAL_PERSONALITY } from '../constants';
import { CatProfile, PalBotState } from '../types';
import AnimatedCat from './AnimatedCat';

interface CatSelectionProps {
  onSelect: (profile: CatProfile) => void;
}

const CatSelection: React.FC<CatSelectionProps> = ({ onSelect }) => {
  const [selectedColor, setSelectedColor] = useState(CAT_COLORS[0]);
  const [name, setName] = useState('My Companion');

  const handleAdopt = () => {
    const newProfile: CatProfile = {
      id: Math.random().toString(36).substr(2, 9),
      name: name || 'PalBot',
      color: selectedColor.id,
      archetype: selectedColor.name,
      personality: { ...INITIAL_PERSONALITY },
      learnedContext: "Just arrived in your digital space.",
      adoptedAt: Date.now()
    };
    onSelect(newProfile);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col items-center">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-serif text-gray-900 mb-2">Initialize Your Companion</h1>
        <p className="text-gray-400 text-sm uppercase tracking-widest font-medium">Parallel Agent Adoption</p>
      </div>

      <div className="bg-white rounded-[3rem] p-12 border border-gray-100 shadow-2xl flex flex-col md:flex-row items-center gap-12 w-full max-w-3xl">
        <div className="w-64 h-64 flex items-center justify-center">
          <AnimatedCat 
            color={selectedColor.hex} 
            colorId={selectedColor.id}
            state={PalBotState.IDLE_SELF} 
            scale={1} 
            personality={INITIAL_PERSONALITY} 
          />
        </div>

        <div className="flex-1 space-y-8">
          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Identify As</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-2xl font-serif border-b-2 border-gray-100 focus:border-gray-900 outline-none pb-2 transition-colors bg-transparent"
              placeholder="Enter name..."
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Aura Color</label>
            <div className="flex gap-4">
              {CAT_COLORS.map(color => (
                <button
                  key={color.id}
                  onClick={() => setSelectedColor(color)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${selectedColor.id === color.id ? 'border-gray-900 scale-125 shadow-lg' : 'border-transparent hover:scale-110'}`}
                  style={{ backgroundColor: color.hex, backgroundImage: color.id === 'tuxedo' ? 'linear-gradient(45deg, #020202 50%, #FDFCF0 50%)' : 'none' }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          <button 
            onClick={handleAdopt}
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-widest hover:bg-gray-800 transition-all transform active:scale-95 shadow-xl"
          >
            Commence Connection
          </button>
        </div>
      </div>
      
      <p className="mt-8 text-gray-400 text-[10px] text-center max-w-md uppercase tracking-wider leading-relaxed">
        Interaction is strictly limited to voice communication to ensure deep neural synchronization between user and agent.
      </p>
    </div>
  );
};

export default CatSelection;
