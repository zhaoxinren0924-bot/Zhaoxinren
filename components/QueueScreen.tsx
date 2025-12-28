
import React, { useState, useEffect } from 'react';

interface QueueScreenProps {
  onQueueComplete: () => void;
}

const QueueScreen: React.FC<QueueScreenProps> = ({ onQueueComplete }) => {
  const [position, setPosition] = useState(Math.floor(Math.random() * 5) + 3);
  const [progress, setProgress] = useState(0);
  const [zenQuote, setZenQuote] = useState("凡事皆有定数，缘分亦需等待。");

  const quotes = [
    "心如止水，静候缘起。",
    "每一分等待，都是在修持内心的清净。",
    "猫咪正在万水千山外，向你的心念奔赴。",
    "虚空无碍，只等因缘合拢。",
    "莫急，莫躁，当下即是修行。"
  ];

  useEffect(() => {
    const quoteTimer = setInterval(() => {
      setZenQuote(quotes[Math.floor(Math.random() * quotes.length)]);
    }, 4000);

    const queueTimer = setInterval(() => {
      setPosition(prev => {
        if (prev <= 1) {
          clearInterval(queueTimer);
          setTimeout(onQueueComplete, 1500);
          return 0;
        }
        return prev - 1;
      });
    }, Math.random() * 3000 + 3000);

    return () => {
      clearInterval(quoteTimer);
      clearInterval(queueTimer);
    };
  }, []);

  useEffect(() => {
    const progTimer = setInterval(() => {
      setProgress(prev => (prev < 100 ? prev + 0.5 : 100));
    }, 50);
    return () => clearInterval(progTimer);
  }, []);

  return (
    <div className="h-full w-full bg-black flex flex-col items-center justify-center px-8 text-white">
      <div className="relative w-64 h-64 mb-16 flex items-center justify-center">
        {/* 呼吸感的外圈 */}
        <div className="absolute inset-0 border border-white/5 rounded-full animate-pulse scale-110"></div>
        <div className="absolute inset-0 border border-white/10 rounded-full animate-ping opacity-20"></div>
        
        {/* 进度环 */}
        <svg className="w-full h-full -rotate-90">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="2"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeDasharray="754"
            strokeDashoffset={754 - (754 * progress) / 100}
            className="transition-all duration-500 ease-linear"
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          {position > 0 ? (
            <>
              <span className="text-[10px] uppercase tracking-[0.5em] text-white/30 mb-2">Queue Position</span>
              <span className="text-6xl font-mono font-light tracking-tighter">{position}</span>
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30 mt-2">位缘主在前方</span>
            </>
          ) : (
            <div className="animate-in zoom-in duration-1000">
              <span className="text-sm font-serif italic text-white/90">因缘已至...</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-xs text-center">
        <p className="text-xl font-serif italic text-white/60 leading-relaxed mb-4 animate-in fade-in slide-in-from-bottom-2 duration-1000 key={zenQuote}">
          "{zenQuote}"
        </p>
        <div className="h-px w-12 bg-white/10 mx-auto mb-4"></div>
        <p className="text-[9px] uppercase tracking-[0.4em] text-white/20 font-bold">
          Neural Connection Initializing
        </p>
      </div>

      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <div className="w-1 h-1 rounded-full bg-white/20 animate-bounce"></div>
        <div className="w-1 h-1 rounded-full bg-white/40 animate-bounce [animation-delay:0.2s]"></div>
        <div className="w-1 h-1 rounded-full bg-white/20 animate-bounce [animation-delay:0.4s]"></div>
      </div>
    </div>
  );
};

export default QueueScreen;
