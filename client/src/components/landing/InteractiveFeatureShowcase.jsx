import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Cpu, Layers, FileCode } from 'lucide-react';

export default function InteractiveFeatureShowcase() {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      icon: Cpu,
      title: 'Automate Outlines & Chapters',
      description: 'Gemini AI generates full academic chapter outlines, bonafide certificates, candidate declarations, and index pages automatically.',
    },
    {
      id: 1,
      icon: FileCode,
      title: 'Canonical Document Model',
      description: 'Documents are structured into editable page objects rather than flat files, supporting seamless multi-format exports.',
    },
    {
      id: 2,
      icon: Layers,
      title: 'Canva Visual Canvas Editor',
      description: 'Fabric.js interactive canvas allows real-time text positioning, font sizing, student info auto-filling, and double-rule borders.',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 font-sans">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-3xl sm:text-5xl font-poppins font-extrabold text-white tracking-tight">
          Simplify Complex Document Operations with AI
        </h2>
        <p className="text-xs sm:text-sm font-geist text-zinc-400 leading-relaxed">
          Intelligent automation helps you eliminate manual formatting, auto-fill student details, and export directly to PDF, PowerPoint, and Word.
        </p>
      </div>

      {/* Grid Display: Left Controls + Right Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Left Side Tab Controls */}
        <div className="lg:col-span-5 space-y-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 border-zinc-700 shadow-2xl ring-1 ring-white/20'
                    : 'bg-zinc-950/60 border-zinc-800 hover:bg-zinc-900/60'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-2xl ${isActive ? 'bg-white text-black' : 'bg-zinc-800 text-zinc-400'}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-poppins font-bold text-white">{tab.title}</h3>
                    <p className="text-xs font-geist text-zinc-400 leading-relaxed">{tab.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side Glass Dashboard Card Preview */}
        <div className="lg:col-span-7">
          <div className="bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden group">
            
            {/* Metric Badge */}
            <div className="flex items-center justify-between border-b border-zinc-800 pb-6 mb-6">
              <div>
                <span className="text-4xl font-poppins font-extrabold text-white tracking-tight">1,632</span>
                <span className="block text-[10px] font-geist font-bold uppercase tracking-widest text-zinc-500 mt-0.5">
                  Generated Document Models
                </span>
              </div>

              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3.5 py-1.5 rounded-full text-xs text-zinc-200 font-poppins font-semibold">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                Double-Rule Border Active
              </div>
            </div>

            {/* Wave Graph SVG Visualization in Monochrome */}
            <div className="h-44 relative flex items-center justify-center my-4">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 500 150">
                <defs>
                  <linearGradient id="monoWave" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                  </linearGradient>
                </defs>
                
                <path
                  d="M0,100 Q125,20 250,90 T500,40 L500,150 L0,150 Z"
                  fill="url(#monoWave)"
                />
                <path
                  d="M0,100 Q125,20 250,90 T500,40"
                  fill="none"
                  stroke="#FFFFFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                <circle cx="250" cy="90" r="5" fill="#000000" stroke="#FFFFFF" strokeWidth="3" />
              </svg>
            </div>

            {/* Bottom Card Footer */}
            <div className="pt-4 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400 font-geist">
              <span>Gemini 2.5 Structured JSON Mode</span>
              <span className="text-white font-poppins font-bold">Latency: ~280ms</span>
            </div>

          </div>
        </div>

      </div>

    </section>
  );
}
