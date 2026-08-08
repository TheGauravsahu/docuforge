import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Cpu, FileText, Monitor, ShieldCheck } from 'lucide-react';

export default function BentoGrid() {
  const cards = [
    {
      id: 1,
      colSpan: 'lg:col-span-6',
      icon: Activity,
      title: 'Real-time Generation Analytics',
      description: 'Track document project creations, token spend estimates, and output formats seamlessly with our analytics module.',
      preview: (
        <div className="h-28 bg-zinc-950 rounded-2xl border border-zinc-800 p-3 flex items-end justify-between gap-1">
          {[45, 70, 50, 85, 60, 95, 75, 100, 90].map((h, idx) => (
            <div
              key={idx}
              className="w-full bg-white/80 hover:bg-white rounded-t-md transition-all duration-300"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      ),
    },
    {
      id: 2,
      colSpan: 'lg:col-span-6',
      icon: Cpu,
      title: 'Multi-Format Export Pipeline',
      description: 'Canonical JSON models derived on demand into pixel-perfect PDF, PowerPoint PPTX slides, and Word DOCX documents.',
      preview: (
        <div className="h-28 bg-zinc-950 rounded-2xl border border-zinc-800 p-4 flex items-center justify-around">
          <div className="w-12 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center text-white text-xs font-poppins font-bold">
            JSON
          </div>
          <div className="h-[2px] w-12 bg-white/60 animate-pulse" />
          <div className="w-12 h-10 rounded-xl bg-white text-black flex items-center justify-center text-xs font-poppins font-bold">
            PDF
          </div>
        </div>
      ),
    },
    {
      id: 3,
      colSpan: 'lg:col-span-4',
      icon: FileText,
      title: 'Automated Academic Outlines',
      description: 'Auto-generates chapter titles, subtopics, bonafide certificates, and candidate declarations.',
    },
    {
      id: 4,
      colSpan: 'lg:col-span-4',
      icon: Monitor,
      title: 'Canva Visual Canvas Studio',
      description: 'Drag and drop text objects, edit font sizes, colors, alignments, and double-rule borders in real time.',
    },
    {
      id: 5,
      colSpan: 'lg:col-span-4',
      icon: ShieldCheck,
      title: 'Secure Folder Management',
      description: 'Organize projects inside nested folders with role-based ownership and audit logging.',
    },
  ];

  return (
    <section className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-16 font-sans">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <h2 className="text-3xl sm:text-5xl font-poppins font-extrabold text-white tracking-tight">
          Engineered for Maximum Performance
        </h2>
        <p className="text-xs sm:text-sm font-geist text-zinc-400 leading-relaxed">
          Our AI document platform delivers high-precision page assembly so you can create faster with confidence.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className={`${card.colSpan} bg-zinc-950 border border-zinc-800 rounded-3xl p-6 shadow-xl flex flex-col justify-between space-y-4 hover:border-zinc-700 transition-colors`}
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center text-white border border-zinc-800">
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-base font-poppins font-bold text-white tracking-tight">
                  {card.title}
                </h3>
                <p className="text-xs font-geist text-zinc-400 leading-relaxed">
                  {card.description}
                </p>
              </div>

              {card.preview && <div className="mt-4">{card.preview}</div>}
            </motion.div>
          );
        })}
      </div>

    </section>
  );
}
