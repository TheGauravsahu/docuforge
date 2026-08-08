import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sparkles, FolderKanban, LayoutTemplate, Shield, LogOut, Sun, Moon, PlusCircle, Wand2 } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useTheme } from '../../context/ThemeContext.jsx';

export default function Navbar({ onOpenAiModal }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-brand-darkcard/80 backdrop-blur-xl border-b border-gray-200/80 dark:border-brand-darkborder transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-blue to-blue-600 flex items-center justify-center text-white shadow-md shadow-brand-blue/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div className="flex flex-col">
            <span className="font-sans font-extrabold text-lg tracking-tight text-gray-900 dark:text-white flex items-center gap-1">
              Docu<span className="text-brand-blue">Forge</span>
            </span>
            <span className="text-[9px] tracking-widest uppercase font-extrabold text-brand-terracotta">
              AI Studio
            </span>
          </div>
        </Link>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5">
          <Link
            to="/dashboard"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isActive('/dashboard')
                ? 'bg-brand-blue/10 text-brand-blue dark:bg-blue-500/20 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            Projects
          </Link>

          <Link
            to="/generate"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isActive('/generate')
                ? 'bg-brand-blue/10 text-brand-blue dark:bg-blue-500/20 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60'
            }`}
          >
            <Wand2 className="w-4 h-4 text-brand-terracotta" />
            AI Generator
          </Link>

          <Link
            to="/templates"
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
              isActive('/templates')
                ? 'bg-brand-blue/10 text-brand-blue dark:bg-blue-500/20 dark:text-blue-400'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60'
            }`}
          >
            <LayoutTemplate className="w-4 h-4" />
            Templates
          </Link>

          {user?.role === 'ADMIN' && (
            <Link
              to="/admin"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                isActive('/admin')
                  ? 'bg-brand-blue/10 text-brand-blue dark:bg-blue-500/20 dark:text-blue-400'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800/60'
              }`}
            >
              <Shield className="w-4 h-4 text-brand-terracotta" />
              Admin
            </Link>
          )}
        </nav>

        {/* Actions & Profile */}
        <div className="flex items-center gap-3">
          
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-gray-500 hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-800 transition-colors"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* New Document CTA */}
          <Link
            to="/generate"
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-blue to-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-brand-blue/20 hover:opacity-95 transition-opacity"
          >
            <PlusCircle className="w-4 h-4" />
            New Document
          </Link>

          {/* User Profile */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <img
                src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Aarav'}
                alt={user?.name || 'User'}
                className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-700 object-cover"
              />
              <span className="hidden sm:inline text-xs font-semibold text-gray-800 dark:text-gray-200">
                {user?.name || 'Aarav Sharma'}
              </span>
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-brand-darkcard rounded-2xl shadow-2xl border border-gray-200/80 dark:border-brand-darkborder py-2 z-50 animate-in fade-in">
                <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">{user?.name || 'User'}</p>
                  <p className="text-[11px] text-gray-500 truncate">{user?.email || 'user@school.edu'}</p>
                  <span className="inline-block mt-1 px-2 py-0.5 text-[9px] font-extrabold uppercase rounded bg-brand-blue/10 text-brand-blue dark:bg-blue-900/40 dark:text-blue-300">
                    {user?.role || 'USER'}
                  </span>
                </div>

                <button
                  onClick={() => {
                    setDropdownOpen(false);
                    logout();
                    navigate('/auth');
                  }}
                  className="w-full text-left px-4 py-2.5 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 font-semibold"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
