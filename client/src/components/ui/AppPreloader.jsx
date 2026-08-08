import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

export default function AppPreloader({ onFinish }) {
  const [phase, setPhase] = useState(0); // 0=logo, 1=fade out, 2=done

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 900);
    const t2 = setTimeout(() => { setPhase(2); onFinish?.(); }, 1400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onFinish]);

  if (phase === 2) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center transition-opacity duration-500"
      style={{
        backgroundColor: '#0B0F0D',
        opacity: phase === 1 ? 0 : 1,
        pointerEvents: phase === 1 ? 'none' : 'auto',
      }}
    >
      {/* Radial glow */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(30,91,63,0.35) 0%, transparent 70%)',
        }}
      />

      {/* Logo */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl"
          style={{ backgroundColor: '#1E5B3F' }}
        >
          <Sparkles className="w-8 h-8 text-white fill-white" />
        </div>
        <div className="text-center">
          <p className="text-[20px] font-bold text-white tracking-tight">DocuForge</p>
          <p className="text-[12px] tracking-widest uppercase font-semibold mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
            AI Studio
          </p>
        </div>
        {/* Loading bar */}
        <div className="w-32 h-0.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
          <div
            className="h-full rounded-full"
            style={{
              backgroundColor: '#4ADE80',
              width: phase === 0 ? '0%' : '100%',
              transition: 'width 800ms ease-out',
            }}
          />
        </div>
      </div>
    </div>
  );
}
