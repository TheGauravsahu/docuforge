import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, FileText, Wand2, Layers, CheckCircle2, ChevronRight, Zap, Github, Heart, LayoutDashboard, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore.js';

// The landing page is always dark — ignores the user's app theme toggle
export default function LandingPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [openUserMenu, setOpenUserMenu] = useState(false);
  const [promptText, setPromptText] = useState('');
  const [format, setFormat] = useState('PDF');

  const handlePromptSubmit = (e) => {
    e.preventDefault();
    navigate(isAuthenticated ? '/generate' : '/auth');
  };

  const features = [
    {
      icon: Sparkles,
      title: 'AI Document Generation',
      description: 'Gemini 2.5 drafts full chapters, bonafide certificates, and candidate declarations from a single topic prompt.'
    },
    {
      icon: Layers,
      title: 'Visual Canvas Editor',
      description: 'Edit text positions, fonts, and border styles in a Canva-style visual workspace — no design skills needed.'
    },
    {
      icon: FileText,
      title: 'Multi-Format Export',
      description: 'Export your finished project as PDF, PowerPoint PPTX, or Word DOCX with a single click.'
    },
  ];

  const steps = [
    { num: '01', title: 'Describe your topic', body: 'Enter your research topic and student details. Gemini AI generates a structured outline in seconds.' },
    { num: '02', title: 'Edit on canvas', body: 'Open the visual editor to adjust text, borders, and layout to match your school\'s format.' },
    { num: '03', title: 'Export & submit', body: 'Download as PDF or PowerPoint. Print and hand in. Done.' },
  ];

  return (
    <div className="landing-page-root min-h-screen overflow-x-hidden" style={{ backgroundColor: '#0B0F0D', color: '#EDF2EE' }}>

      {/* ── NAV ───────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b" style={{ backgroundColor: 'rgba(11,15,13,0.92)', backdropFilter: 'blur(12px)', borderColor: '#1E2922' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: '#1E5B3F' }}>
              <Sparkles className="w-4 h-4 text-white fill-white" />
            </div>
            <span className="font-bold text-[16px]" style={{ color: '#EDF2EE' }}>DocuForge</span>
          </Link>

          {/* Center links */}
          <div className="hidden md:flex items-center gap-6 text-[14px] font-medium" style={{ color: '#9AAAA1' }}>
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <Link to="/templates" className="hover:text-white transition-colors">Templates</Link>
          </div>

          {/* Right CTAs */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-[13px] sm:text-[14px] font-semibold text-white flex items-center gap-2 transition-opacity hover:opacity-90 shadow-sm"
                  style={{ backgroundColor: '#1E5B3F' }}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </button>

                {/* User avatar dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setOpenUserMenu(!openUserMenu)}
                    className="flex items-center gap-2 p-1 pl-2 rounded-xl transition-colors border"
                    style={{ borderColor: '#1E2922', backgroundColor: '#141A17' }}
                  >
                    <img
                      src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                      alt="Avatar"
                      className="w-7 h-7 rounded-full border"
                      style={{ borderColor: '#1E2922' }}
                    />
                    <span className="text-[13px] font-semibold text-white truncate max-w-[90px]">
                      {user?.name || 'User'}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 text-gray-400 mr-1" />
                  </button>

                  {openUserMenu && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setOpenUserMenu(false)} />
                      <div
                        className="absolute right-0 top-11 z-20 w-48 rounded-xl border shadow-2xl py-1.5 space-y-1 animate-in fade-in zoom-in-95"
                        style={{ backgroundColor: '#141A17', borderColor: '#1E2922' }}
                      >
                        <button
                          onClick={() => { setOpenUserMenu(false); navigate('/dashboard'); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-left text-gray-200 hover:bg-[#1E2922] transition-colors"
                        >
                          <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                          Dashboard
                        </button>
                        <button
                          onClick={() => { setOpenUserMenu(false); navigate('/settings'); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-left text-gray-200 hover:bg-[#1E2922] transition-colors"
                        >
                          <Settings className="w-4 h-4 text-gray-400" />
                          Settings
                        </button>
                        <div style={{ height: '1px', backgroundColor: '#1E2922', margin: '4px 0' }} />
                        <button
                          onClick={() => { setOpenUserMenu(false); logout(); }}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-left text-red-400 hover:bg-red-950/30 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log out
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => navigate('/auth')}
                  className="text-[14px] font-medium transition-colors"
                  style={{ color: '#9AAAA1' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#EDF2EE'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9AAAA1'}
                >
                  Sign in
                </button>
                <button
                  onClick={() => navigate('/auth')}
                  className="px-4 py-2 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: '#1E5B3F' }}
                >
                  Get started
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-5 sm:px-8 pt-24 pb-16 text-center">
        {/* Eyebrow badge */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[13px] font-medium mb-8"
          style={{ backgroundColor: '#0B3021', color: '#4ADE80', border: '1px solid #1a4a2a' }}
        >
          <Zap className="w-3.5 h-3.5" />
          AI-powered project builder — powered by Gemini AI
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{
            fontSize: 'clamp(36px, 6vw, 60px)',
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: '#EDF2EE',
          }}
        >
          Turn any topic into a<br />
          <span style={{ color: '#4ADE80' }}>finished project</span> — in minutes
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-5 text-[16px] max-w-2xl mx-auto"
          style={{ color: '#9AAAA1', lineHeight: 1.6 }}
        >
          DocuForge generates structured academic investigatory projects, bonafide certificates, and reports — then lets you customize them in a visual canvas editor. Export to PDF, PPTX, or DOCX.
        </motion.p>

        {/* Hero CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-wrap items-center justify-center gap-3"
        >
          <button
            onClick={() => navigate('/auth')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1E5B3F' }}
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </button>
          <Link
            to="/templates"
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-[15px] font-medium transition-colors"
            style={{ color: '#9AAAA1', border: '1px solid #26312B' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EDF2EE'; e.currentTarget.style.borderColor = '#4ADE80'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#9AAAA1'; e.currentTarget.style.borderColor = '#26312B'; }}
          >
            See templates
          </Link>
        </motion.div>
      </section>

      {/* ── AI COMMAND BAR MOCKUP ─────────────────────────── */}
      <section className="max-w-3xl mx-auto px-5 sm:px-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="rounded-2xl p-4 shadow-2xl border"
          style={{ backgroundColor: '#161D19', borderColor: '#26312B' }}
        >
          <form onSubmit={handlePromptSubmit} className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder='e.g. "Physics project on Electromagnetic Induction for Class XII"'
              value={promptText}
              onChange={e => setPromptText(e.target.value)}
              className="flex-1 bg-transparent text-[14px] outline-none"
              style={{ color: '#EDF2EE', placeholder: '#6B7D73' }}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <select
                value={format}
                onChange={e => setFormat(e.target.value)}
                className="text-[13px] px-3 py-2 rounded-xl border outline-none font-medium"
                style={{ backgroundColor: '#1D2621', borderColor: '#26312B', color: '#9AAAA1' }}
              >
                <option value="PDF">PDF</option>
                <option value="PPTX">PPTX</option>
                <option value="DOCX">DOCX</option>
              </select>
              <button
                type="submit"
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-[14px] font-semibold text-white"
                style={{ backgroundColor: '#1E5B3F' }}
              >
                <Sparkles className="w-4 h-4" />
                Generate
              </button>
            </div>
          </form>
        </motion.div>
        <p className="text-center text-[12px] mt-3" style={{ color: '#6B7D73' }}>
          No sign-up needed to preview — just start typing
        </p>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────── */}
      <section id="how-it-works" className="py-20 border-t" style={{ borderColor: '#1E2922' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-semibold tracking-tight" style={{ color: '#EDF2EE' }}>
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {steps.map((step) => (
              <div
                key={step.num}
                className="rounded-2xl p-6 border space-y-3"
                style={{ backgroundColor: '#161D19', borderColor: '#26312B' }}
              >
                <div className="text-[28px] font-bold" style={{ color: '#1E5B3F' }}>{step.num}</div>
                <h3 className="text-[16px] font-semibold" style={{ color: '#EDF2EE' }}>{step.title}</h3>
                <p className="text-[14px] leading-relaxed" style={{ color: '#9AAAA1' }}>{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="py-20 border-t" style={{ borderColor: '#1E2922' }}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <h2 className="text-[32px] font-semibold tracking-tight" style={{ color: '#EDF2EE' }}>
              Everything you need
            </h2>
            <p className="mt-3 text-[15px]" style={{ color: '#9AAAA1' }}>
              Built for students, researchers, and educators who need polished documents fast.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="rounded-2xl p-6 border space-y-3 group transition-all hover:border-opacity-80"
                  style={{ backgroundColor: '#161D19', borderColor: '#26312B' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#1E5B3F'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = '#26312B'}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: '#0B3021', color: '#4ADE80' }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-[16px] font-semibold" style={{ color: '#EDF2EE' }}>{feature.title}</h3>
                  <p className="text-[14px] leading-relaxed" style={{ color: '#9AAAA1' }}>{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA FOOTER STRIP ─────────────────────────────── */}
      <section className="py-20 border-t" style={{ borderColor: '#1E2922' }}>
        <div className="max-w-3xl mx-auto px-5 sm:px-8 text-center space-y-5">
          <h2 className="text-[32px] font-semibold tracking-tight" style={{ color: '#EDF2EE' }}>
            Ready to build your project?
          </h2>
          <p className="text-[15px]" style={{ color: '#9AAAA1' }}>
            Join students and educators who create structured academic documents in minutes, not hours.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="px-8 py-3.5 rounded-xl text-[15px] font-semibold text-white inline-flex items-center gap-2 transition-opacity hover:opacity-90"
            style={{ backgroundColor: '#1E5B3F' }}
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t py-10" style={{ borderColor: '#1E2922' }}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-[13px]" style={{ color: '#6B7D73' }}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md flex items-center justify-center" style={{ backgroundColor: '#1E5B3F' }}>
              <Sparkles className="w-3 h-3 text-white" />
            </div>
            <span>DocuForge AI © 2026. All rights reserved.</span>
          </div>

          {/* Gaurav Sahu Developer Credits */}
          <div className="flex items-center gap-2 text-[13px]">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 fill-current text-emerald-400" />
            <span>by</span>
            <a
              href="https://gauravsahu.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold underline transition-colors"
              style={{ color: '#4ADE80' }}
            >
              Gaurav Sahu
            </a>
            <span>•</span>
            <a
              href="https://github.com/TheGauravsahu"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 font-medium transition-colors hover:text-white"
              style={{ color: '#9AAAA1' }}
            >
              <Github className="w-3.5 h-3.5" />
              GitHub
            </a>
          </div>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>

    </div>
  );
}
