
import React from 'react';
import { PersonalityTraits, PalBotState } from '../types';

interface AnimatedCatProps {
  color: string;
  state: PalBotState;
  isSinging?: boolean;
  scale?: number;
  personality: PersonalityTraits;
}

const AnimatedCat: React.FC<AnimatedCatProps> = ({ state, isSinging = false, scale = 1, personality }) => {
  // Ultra-low frequency breathing for 'Existential Presence'
  const breathDuration = isSinging ? 0.8 : Math.max(12.0, (personality.calmness + 50) / 5);
  
  const isInteracting = state === PalBotState.INTERACTION;
  
  // Engineering Redline: Minimalist Poses
  // Head tilt only slightly changes during interaction to acknowledge but not 'cater'
  const headRotation = isInteracting ? 'rotate(-0.8deg) translate(-0.5px, 0px)' : 'rotate(1deg) translate(1px, 1px)';
  const bodyTilt = 'rotate(0deg)'; // Completely grounded body
  const tailRotation = isInteracting ? 'rotate(-0.5deg)' : 'rotate(1.5deg)';

  return (
    <div 
      className="relative w-full h-full flex items-center justify-center transition-all duration-[6000ms] ease-in-out select-none"
      style={{ transform: `scale(${scale})` }}
    >
      <svg viewBox="0 0 200 240" className="w-full h-full relative z-10 overflow-visible">
        <defs>
          <linearGradient id="rimLightGrad" x1="100%" y1="0%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="rgba(255,200,120,0.2)" />
            <stop offset="20%" stopColor="rgba(0,0,0,0)" />
          </linearGradient>
        </defs>

        {/* Tail - Almost static presence */}
        <g style={{ transform: tailRotation, transformOrigin: '135px 185px', transition: 'transform 8s' }}>
           <path 
            d="M135 185 Q175 200 170 145" 
            fill="none" 
            stroke="#080808" 
            strokeWidth="15" 
            strokeLinecap="round" 
            className="animate-tail-slow"
          />
           <path 
            d="M135 185 Q175 200 170 145" 
            fill="none" 
            stroke="url(#rimLightGrad)" 
            strokeWidth="15" 
            strokeLinecap="round" 
            opacity="0.15"
          />
        </g>

        {/* Body Volume - Heavy Silhouette */}
        <g className="animate-breath-slow" style={{ transform: bodyTilt, transformOrigin: 'center bottom' }}>
          <ellipse cx="100" cy="190" rx="68" ry="48" fill="#080808" />
          <path d="M52 190 Q100 218 148 190 L132 105 Q100 88 68 105 Z" fill="#080808" />
          
          {/* Subtle Shoulder Rim */}
          <path d="M132 105 Q145 150 148 190" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

          {/* Head - Back Profile (The Parallel Life View) */}
          <g style={{ transform: headRotation, transformOrigin: '100px 105px', transition: 'transform 6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            <circle cx="100" cy="80" r="52" fill="#080808" />
            <circle cx="100" cy="80" r="52" fill="none" stroke="url(#rimLightGrad)" strokeWidth="1.2" opacity="0.1" />

            {/* Bionic Silhouette Ears */}
            <path d="M60 55 L42 12 Q70 15 85 50 Z" fill="#080808" strokeLinejoin="round" />
            <path d="M140 55 L158 12 Q130 15 115 50 Z" fill="#080808" strokeLinejoin="round" />
            
            {/* Minimal optical feedback (only if interacting) */}
            {isInteracting && (
              <g opacity="0.08">
                <ellipse cx="80" cy="85" rx="1" ry="2" fill="#f39c12" filter="blur(1px)" />
                <ellipse cx="120" cy="85" rx="1" ry="2" fill="#f39c12" filter="blur(1px)" />
              </g>
            )}
          </g>
        </g>
      </svg>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes bionic-breathing-existential {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-0.2px) scale(1.001); }
        }
        @keyframes tail-presence {
          0%, 100% { transform: rotate(0deg); }
          50% { transform: rotate(0.4deg); }
        }
        .animate-breath-slow { 
          animation: bionic-breathing-existential ${breathDuration}s ease-in-out infinite;
          transform-origin: center 190px;
        }
        .animate-tail-slow {
          animation: tail-presence 25s ease-in-out infinite;
          transform-origin: 135px 185px;
        }
      `}} />
    </div>
  );
};

export default AnimatedCat;
