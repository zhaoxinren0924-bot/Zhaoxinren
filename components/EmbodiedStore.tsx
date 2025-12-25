
import React from 'react';
import { CatProfile, PalBotState } from '../types';
import { CAT_COLORS } from '../constants';
import AnimatedCat from './AnimatedCat';
import PersonalityChart from './PersonalityChart';

interface EmbodiedStoreProps {
  profile: CatProfile;
  onBack: () => void;
}

const EmbodiedStore: React.FC<EmbodiedStoreProps> = ({ profile, onBack }) => {
  const colorData = CAT_COLORS.find(c => c.id === profile.color) || CAT_COLORS[0];
  
  // 动态生成硬件描述
  const getHardwareSpecs = () => {
    const specs = [];
    if (profile.personality.wisdom > 60) specs.push({ label: 'Processor', value: 'Neural Synapse v4 (High-Logic)' });
    else specs.push({ label: 'Processor', value: 'Behavior Core v2' });
    
    if (profile.personality.playfulness > 60) specs.push({ label: 'Actuators', value: 'Hydraulic High-Agility Joints' });
    else specs.push({ label: 'Actuators', value: 'Silent Glide Steppers' });

    specs.push({ label: 'Sensors', value: 'LiDAR + 12-Point Tactile Mesh' });
    specs.push({ label: 'Battery', value: '48h Bio-Polymer Cell' });
    return specs;
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center mb-16">
        <button 
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Sync
        </button>
        <div className="text-right">
          <h1 className="text-2xl font-serif italic">The Physical Foundry</h1>
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">Bringing Parallel Agents to Reality</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* 左侧：物理预览 */}
        <div className="relative aspect-square bg-gray-50 rounded-[4rem] flex items-center justify-center border border-gray-100 overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent opacity-50"></div>
          
          {/* 合成底座装饰 */}
          <div className="absolute bottom-12 w-48 h-4 bg-gray-900/5 rounded-[50%] blur-xl group-hover:bg-gray-900/10 transition-colors"></div>
          
          <div className="relative z-10 transform hover:scale-110 transition-transform duration-1000">
            {/* Fix: Replace PalBotState.Idle with PalBotState.IDLE_SELF */}
            <AnimatedCat 
              color={colorData.hex} 
              state={PalBotState.IDLE_SELF} 
              scale={1} 
              personality={profile.personality} 
            />
          </div>

          <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-tighter">Model Variant</span>
              <span className="text-sm font-serif">{profile.name} : Synthetic Edition</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-gray-400 uppercase block tracking-tighter">Manufacturing Status</span>
              <span className="text-xs font-bold text-green-500 uppercase tracking-widest">Ready for Synthesis</span>
            </div>
          </div>
        </div>

        {/* 右侧：配置与结算 */}
        <div className="space-y-12">
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">1. Neural Profile Mapping</h3>
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
              <PersonalityChart traits={profile.personality} />
              <p className="mt-4 text-xs text-gray-500 leading-relaxed text-center italic">
                "The physical vessel will be calibrated to precisely mirror the {profile.personality.loyalty}% loyalty bond established in the digital realm."
              </p>
            </div>
          </section>

          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-6">2. Hardware Specifications</h3>
            <div className="grid grid-cols-2 gap-4">
              {getHardwareSpecs().map((spec, i) => (
                <div key={i} className="p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition-colors">
                  <span className="text-[9px] font-bold text-gray-400 uppercase block tracking-tight mb-1">{spec.label}</span>
                  <span className="text-[11px] font-semibold text-gray-800">{spec.value}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="pt-8 border-t border-gray-100">
            <div className="flex justify-between items-center mb-8">
              <div>
                <span className="text-xs font-bold text-gray-400 uppercase block tracking-widest mb-1">Total Synthesis Fee</span>
                <span className="text-3xl font-serif">$2,499.00</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 block mb-1">Ships in 4-6 weeks</span>
                <span className="text-[10px] bg-black text-white px-2 py-0.5 rounded-full font-bold">FREE GLOBAL LOGISTICS</span>
              </div>
            </div>

            <button className="w-full py-6 bg-gray-900 text-white rounded-2xl font-bold uppercase tracking-[0.3em] hover:bg-gray-800 transition-all transform hover:scale-[1.02] active:scale-95 shadow-2xl flex items-center justify-center gap-3">
              Commence Synthesis
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
            <p className="text-center mt-6 text-[9px] text-gray-400 uppercase tracking-widest">
              By initiating synthesis, you agree to the Parallel Consciousness Transfer Agreement.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default EmbodiedStore;
