import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useAuthStore } from '../../store/useAuthStore.js';

export default function LandingNavbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 bg-black/90 dark:bg-black/90 backdrop-blur-xl border-b border-zinc-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between font-sans">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center font-bold shadow-mono-glow group-hover:scale-105 transition-transform">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-poppins font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
              Docu<span className="text-zinc-400">Forge</span>
            </span>
            <span className="text-[9px] tracking-widest uppercase font-extrabold text-zinc-500">
              AI Document Studio
            </span>
          </div>
        </Link>

        {/* Center Pill Navbar (Pricing Removed) */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-900/90 border border-zinc-800 p-1.5 rounded-full shadow-2xl backdrop-blur-md">
          <a href="#hero" className="px-4 py-1.5 rounded-full text-xs font-poppins font-bold bg-white text-black flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-black animate-pulse" />
            Home
          </a>
          <a href="#features" className="px-4 py-1.5 rounded-full text-xs font-poppins font-semibold text-zinc-400 hover:text-white transition-colors">
            Features
          </a>
          <a href="#templates" className="px-4 py-1.5 rounded-full text-xs font-poppins font-semibold text-zinc-400 hover:text-white transition-colors">
            Templates
          </a>
          <a href="#editor" className="px-4 py-1.5 rounded-full text-xs font-poppins font-semibold text-zinc-400 hover:text-white transition-colors">
            Canva Canvas
          </a>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/80 transition-colors"
            title="Toggle Light / Dark Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-zinc-200" /> : <Moon className="w-4 h-4 text-zinc-800" />}
          </button>

          <button
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/auth')}
            className="px-5 py-2.5 rounded-full text-xs font-poppins font-extrabold bg-white text-black hover:bg-zinc-200 transition-all shadow-mono-glow hover:scale-105"
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Sign In'}
          </button>
        </div>

      </div>
    </header>
  );
}
