import React, { useState } from 'react';
import { Plus, Mic, Cpu, Brain, Send } from 'lucide-react';
import { motion } from 'framer-motion';

export default function FloatingPromptCapsule({ onSubmit }) {
  const [promptText, setPromptText] = useState('');
  const [mode] = useState('Gemini 2.5 Flash');
  const [thinkLevel] = useState('Structured Document');

  const handleSend = (e) => {
    e?.preventDefault();
    if (onSubmit) onSubmit(promptText);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="w-full max-w-3xl mx-auto mt-10 relative group font-sans"
    >
      {/* High-contrast Monochrome Border Glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700 via-zinc-400 to-zinc-800 rounded-3xl blur-md opacity-30 group-hover:opacity-60 transition duration-500" />

      <div className="relative bg-zinc-950 border border-zinc-800 rounded-3xl p-4 shadow-2xl backdrop-blur-2xl">
        
        {/* Input Textarea Area */}
        <div className="px-2 pt-1 pb-3">
          <input
            type="text"
            placeholder="[Describe your topic... e.g. Physics Investigatory Project on Electromagnetism & Transformers]"
            value={promptText}
            onChange={(e) => setPromptText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            className="w-full bg-transparent text-xs sm:text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none font-sans tracking-wide"
          />
        </div>

        {/* Bottom Control Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-zinc-800/80">
          
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
              <Plus className="w-4 h-4" />
            </button>

            {/* Model Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-poppins font-semibold text-zinc-300">
              <Cpu className="w-3.5 h-3.5 text-white" />
              <span>{mode}</span>
            </div>

            {/* Structured Document Model Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-poppins font-semibold text-zinc-300">
              <Brain className="w-3.5 h-3.5 text-zinc-400" />
              <span>{thinkLevel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-[11px] font-poppins font-semibold text-zinc-400 hover:text-white transition-colors">
              <Mic className="w-3.5 h-3.5" />
              <span>Voice</span>
            </button>

            <button
              onClick={handleSend}
              className="w-9 h-9 rounded-full bg-white text-black hover:bg-zinc-200 flex items-center justify-center font-bold shadow-lg transition-transform active:scale-95"
            >
              <Send className="w-4 h-4 fill-current ml-0.5" />
            </button>
          </div>

        </div>

      </div>
    </motion.div>
  );
}
