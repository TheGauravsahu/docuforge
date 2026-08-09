import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { PenTool, Sparkles, BookOpen, ArrowRight, CheckCircle2, ChevronRight, Layers, FileText } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import api from '../lib/api.js';

const FONTS = [
  { id: 'Kalam', label: 'Kalam (Rounded Pen)', sample: 'Sample Handwritten Notes' },
  { id: 'Caveat', label: 'Caveat (Casual Marker)', sample: 'Sample Handwritten Notes' },
  { id: 'Patrick Hand', label: 'Patrick Hand (Clean Ink)', sample: 'Sample Handwritten Notes' },
];

const PAPERS = [
  { id: 'ruled', label: 'Ruled Notebook', desc: 'Classic lined exercise notebook paper' },
  { id: 'grid', label: 'Grid / Graph Paper', desc: 'Mathematical & science grid background' },
  { id: 'plain', label: 'Plain Paper', desc: 'Clean unlined study sheet' },
];

const CLASSES = ['Class IX', 'Class X', 'Class XI', 'Class XII', 'Undergraduate', 'Middle School'];

export default function NotesGeneratorPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState('');
  const [referenceText, setReferenceText] = useState('');
  const [targetClass, setTargetClass] = useState('Class X');
  const [handFont, setHandFont] = useState('Kalam');
  const [paperType, setPaperType] = useState('ruled');
  const [paperColor, setPaperColor] = useState('#FFFFFF');
  const [outline, setOutline] = useState(null);

  const outlineMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/notes/outline', { topic, referenceText, targetClass });
      return res.data.outline;
    },
    onSuccess: (data) => {
      setOutline(data);
      setStep(3);
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to generate notes outline');
    },
  });

  const generateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/notes/generate', {
        topic,
        outline,
        targetClass,
        styleConfig: {
          handFont,
          paperType,
          paperColor,
          inkColor: '#1E1B4B',
          highlightPalette: ['#FFF176', '#FFB6C1', '#B2DFDB', '#D1C4E9']
        }
      });
      return res.data.document;
    },
    onSuccess: (doc) => {
      toast.success('Handwritten Notes generated!');
      navigate(`/notes/editor/${doc.id}`);
    },
    onError: (err) => {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to assemble notes');
    },
  });

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        
        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-xs mb-2" style={{ color: 'var(--text-muted)' }}>
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>AI Studio</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: 'var(--text-primary)' }}>Handwritten Notes</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white bg-emerald-600 shadow-md">
              <PenTool className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Handwritten Study Notes Studio
              </h1>
              <p className="text-xs sm:text-sm mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                Transform complex textbook chapters & PDFs into high-yield handwritten revision sheets with classification trees & markers.
              </p>
            </div>
          </div>
        </div>

        {/* Step Stepper */}
        <div className="flex items-center justify-between p-3 rounded-xl border text-xs font-semibold" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
          <span className={step >= 1 ? 'text-emerald-600 font-bold' : 'text-gray-400'}>1. Topic & Source</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-emerald-600 font-bold' : 'text-gray-400'}>2. Font & Paper Style</span>
          <span>→</span>
          <span className={step === 3 ? 'text-emerald-600 font-bold' : 'text-gray-400'}>3. Assembly</span>
        </div>

        {/* Step 1: Topic Input */}
        {step === 1 && (
          <div className="rounded-2xl border p-6 space-y-5 shadow-sm" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Study Topic / Chapter Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Tissues — Plant & Animal Tissues (NCERT Class 9 Biology)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-sm px-4 py-3 rounded-xl border outline-none font-medium"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                  Target Class Level *
                </label>
                <select
                  value={targetClass}
                  onChange={(e) => setTargetClass(e.target.value)}
                  className="w-full text-sm px-3.5 py-2.5 rounded-xl border outline-none font-medium"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5" style={{ color: 'var(--text-primary)' }}>
                Optional Textbook Excerpt or Reference Notes
              </label>
              <textarea
                rows={4}
                placeholder="Paste chapter text or notes outline here..."
                value={referenceText}
                onChange={(e) => setReferenceText(e.target.value)}
                className="w-full text-xs sm:text-sm px-4 py-3 rounded-xl border outline-none font-normal"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                disabled={!topic.trim()}
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 shadow-sm transition-all"
              >
                Next: Choose Style
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Font & Paper Customization */}
        {step === 2 && (
          <div className="rounded-2xl border p-6 space-y-6 shadow-sm" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
            <div>
              <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Select Handwriting Font
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {FONTS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => setHandFont(f.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      handFont === f.id ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20' : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-gray-500 mb-1">{f.label}</p>
                    <p className="text-lg font-bold" style={{ fontFamily: `${f.id}, cursive`, color: 'var(--text-primary)' }}>
                      {f.sample}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-base font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
                Select Paper Texture
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PAPERS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setPaperType(p.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      paperType === p.id ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20' : 'border-gray-200 dark:border-gray-800'
                    }`}
                  >
                    <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{p.label}</p>
                    <p className="text-xs text-gray-500 mt-1">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                onClick={() => setStep(1)}
                className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                Back
              </button>
              <button
                onClick={() => outlineMutation.mutate()}
                disabled={outlineMutation.isPending}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4 fill-current" />
                {outlineMutation.isPending ? 'Generating Outline...' : 'Generate Notes'}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Assembly & Final Progress */}
        {step === 3 && (
          <div className="rounded-2xl border p-8 text-center space-y-6 shadow-sm" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
              <Sparkles className="w-8 h-8 fill-current" />
            </div>
            <div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Assembling Your Handwritten Study Sheet...
              </h2>
              <p className="text-xs sm:text-sm mt-1 text-gray-500 max-w-md mx-auto">
                Gemini is building your structured blocks, hierarchy trees, comparison tables, and revision Q&A.
              </p>
            </div>

            <button
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
              className="px-8 py-3 rounded-xl text-base font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg transition-all"
            >
              {generateMutation.isPending ? 'Building Blocks...' : 'Open Notes Editor →'}
            </button>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
