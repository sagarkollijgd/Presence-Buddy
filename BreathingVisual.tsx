import React from 'react';

export const BreathingVisual: React.FC = () => {
  return (
    <div className="relative w-64 h-64 flex items-center justify-center pointer-events-none select-none">
      {/* Outer Glow - Dark mode adjusted (mix-blend-screen or simple opacity for dark bg) */}
      <div className="absolute w-full h-full rounded-full bg-blue-500/20 filter blur-3xl animate-breathe" style={{ animationDelay: '0s' }}></div>
      <div className="absolute w-full h-full rounded-full bg-indigo-500/20 filter blur-3xl animate-breathe" style={{ animationDelay: '2s' }}></div>
      <div className="absolute w-full h-full rounded-full bg-stone-500/20 filter blur-3xl animate-breathe" style={{ animationDelay: '4s' }}></div>
      
      {/* Center Circle */}
      <div className="relative z-10 w-32 h-32 bg-stone-900/40 backdrop-blur-md rounded-full shadow-2xl flex items-center justify-center border border-stone-700/50">
        <span className="serif-font text-stone-500 text-xs tracking-widest uppercase opacity-70">Breathe</span>
      </div>
    </div>
  );
};