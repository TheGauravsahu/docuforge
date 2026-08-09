import React, { useState } from 'react';
import {
  X, Sparkles, Loader2, Download, RefreshCw,
  GitBranch, Network, Clock, Microscope, BarChart2,
  ArrowRightLeft, TrendingUp, Lightbulb, LayoutDashboard,
  Plus, CheckCircle2
} from 'lucide-react';
import api from '../../lib/api.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { toast } from 'sonner';

const DIAGRAM_TYPES = [
  {
    id: 'flowchart',
    label: 'Flowchart',
    description: 'Process steps & decision flow',
    icon: GitBranch,
    color: '#1E5B3F',
    example: 'Steps of photosynthesis',
  },
  {
    id: 'mindmap',
    label: 'Mind Map',
    description: 'Central topic with branches',
    icon: Network,
    color: '#2B4C7E',
    example: 'Types of tissues in biology',
  },
  {
    id: 'timeline',
    label: 'Timeline',
    description: 'Chronological sequence',
    icon: Clock,
    color: '#C1663E',
    example: 'History of atomic models',
  },
  {
    id: 'scientific',
    label: 'Scientific Diagram',
    description: 'Labeled scientific illustration',
    icon: Microscope,
    color: '#8B6508',
    example: 'Structure of a neuron',
  },
  {
    id: 'graph',
    label: 'Graph / Chart',
    description: 'Data visualization',
    icon: BarChart2,
    color: '#6D28D9',
    example: 'Temperature vs resistance graph',
  },
  {
    id: 'comparison',
    label: 'Comparison Table',
    description: 'Compare two or more items',
    icon: ArrowRightLeft,
    color: '#0F766E',
    example: 'AC vs DC comparison',
  },
  {
    id: 'process',
    label: 'Process Diagram',
    description: 'Step-by-step workflow',
    icon: TrendingUp,
    color: '#B45309',
    example: 'Water purification process',
  },
  {
    id: 'conceptmap',
    label: 'Concept Map',
    description: 'Ideas with labeled relationships',
    icon: Lightbulb,
    color: '#1E5B3F',
    example: 'Newton\'s laws and their applications',
  },
  {
    id: 'infographic',
    label: 'Infographic',
    description: 'Visual data storytelling',
    icon: LayoutDashboard,
    color: '#BE185D',
    example: 'Key facts about the human heart',
  },
];

export default function AiDiagramModal({ isOpen, onClose }) {
  const { document, activePageIndex, addElement } = useEditorStore();

  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('flowchart');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedDiagram, setGeneratedDiagram] = useState(null); // { dataUrl, svgCode, diagramType }
  const [step, setStep] = useState(1); // 1: configure, 2: preview

  if (!isOpen) return null;

  const docTopic = document?.title || '';

  const handleGenerate = async (e) => {
    e?.preventDefault();
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedDiagram(null);
    try {
      const res = await api.post('/ai/diagram', {
        prompt: prompt.trim(),
        diagramType: selectedType,
        topic: docTopic,
      });

      setGeneratedDiagram(res.data.diagram);
      setStep(2);
      toast.success('Diagram generated!');
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429 || err.response?.data?.error?.includes('quota')) {
        toast.error('AI quota reached. Please wait a few seconds and try again.');
      } else {
        toast.error('Diagram generation failed. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInsertIntoPage = () => {
    if (!generatedDiagram?.dataUrl) return;

    const TARGET_W = 580;
    const TARGET_H = 380;

    // Convert SVG data URL → PNG via offscreen canvas to fix Fabric.js scaling issues with SVGs.
    // Fabric uses the image's natural pixel dimensions to compute scaleX/scaleY.
    // An SVG data URL may report a different naturalWidth, so we rasterize at the exact
    // target size so Fabric receives a PNG with naturalWidth === TARGET_W.
    const img = new Image();
    img.onload = () => {
      const canvas = window.document.createElement('canvas');
      canvas.width = TARGET_W;
      canvas.height = TARGET_H;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, TARGET_W, TARGET_H);
      const pngDataUrl = canvas.toDataURL('image/png');

      const newEl = {
        id: `diagram_${Date.now()}`,
        type: 'image',
        url: pngDataUrl,
        x: 45,
        y: 150,
        width: TARGET_W,
        height: TARGET_H,
      };

      addElement(activePageIndex, newEl);
      toast.success('Diagram inserted into page!');
      handleClose();
    };
    img.onerror = () => {
      // Fallback: insert raw data URL if rasterization fails
      const newEl = {
        id: `diagram_${Date.now()}`,
        type: 'image',
        url: generatedDiagram.dataUrl,
        x: 45,
        y: 150,
        width: TARGET_W,
        height: TARGET_H,
      };
      addElement(activePageIndex, newEl);
      toast.success('Diagram inserted into page!');
      handleClose();
    };
    img.src = generatedDiagram.dataUrl;
  };

  const handleClose = () => {
    setStep(1);
    setGeneratedDiagram(null);
    setPrompt('');
    onClose();
  };

  const handleRegenerate = () => {
    setStep(1);
    setGeneratedDiagram(null);
  };

  const selectedTypeInfo = DIAGRAM_TYPES.find((t) => t.id === selectedType);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl border animate-in fade-in zoom-in-95 overflow-hidden"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #1E5B3F 0%, #2B4C7E 100%)' }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                AI Diagram Generator
              </h2>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                {step === 1
                  ? 'Choose type, describe your diagram, and let AI create it'
                  : 'Preview & insert the generated diagram into your page'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Step indicator */}
            <div className="flex items-center gap-1 mr-2">
              <div
                className="w-2 h-2 rounded-full transition-colors"
                style={{ backgroundColor: step >= 1 ? 'var(--primary)' : 'var(--border)' }}
              />
              <div
                className="w-6 h-px"
                style={{ backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--border)' }}
              />
              <div
                className="w-2 h-2 rounded-full transition-colors"
                style={{ backgroundColor: step >= 2 ? 'var(--primary)' : 'var(--border)' }}
              />
            </div>

            <button
              onClick={handleClose}
              className="p-2 rounded-xl transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {/* ─── Step 1: Configure ─── */}
          {step === 1 && (
            <form onSubmit={handleGenerate} className="p-6 space-y-5">
              {/* Diagram type grid */}
              <div>
                <label className="block text-[13px] font-semibold mb-2.5" style={{ color: 'var(--text-secondary)' }}>
                  Diagram Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {DIAGRAM_TYPES.map((type) => {
                    const Icon = type.icon;
                    const isSelected = selectedType === type.id;
                    return (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => setSelectedType(type.id)}
                        className="relative flex flex-col items-start gap-1.5 p-3 rounded-xl border text-left transition-all"
                        style={{
                          backgroundColor: isSelected ? `${type.color}15` : 'var(--surface-2)',
                          borderColor: isSelected ? type.color : 'var(--border)',
                          borderWidth: isSelected ? '2px' : '1px',
                        }}
                      >
                        <Icon
                          className="w-4 h-4 flex-shrink-0"
                          style={{ color: isSelected ? type.color : 'var(--text-muted)' }}
                        />
                        <span
                          className="text-[12px] font-bold leading-tight"
                          style={{ color: isSelected ? type.color : 'var(--text-primary)' }}
                        >
                          {type.label}
                        </span>
                        <span className="text-[10px] leading-tight" style={{ color: 'var(--text-muted)' }}>
                          {type.description}
                        </span>
                        {isSelected && (
                          <div
                            className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: type.color }}
                          >
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prompt input */}
              <div>
                <label className="block text-[13px] font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Describe Your Diagram *
                </label>
                {selectedTypeInfo && (
                  <p className="text-[11px] mb-2" style={{ color: 'var(--text-muted)' }}>
                    Example: <em>"{selectedTypeInfo.example}"</em>
                  </p>
                )}
                <textarea
                  rows={3}
                  required
                  placeholder={`Describe what you want in the ${selectedTypeInfo?.label || 'diagram'}...${docTopic ? `\n(Context: ${docTopic})` : ''}`}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border outline-none resize-none transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                />
                <p className="text-[11px] mt-1" style={{ color: 'var(--text-muted)' }}>
                  {prompt.length}/300 characters
                </p>
              </div>

              {/* Quick prompts for current doc topic */}
              {docTopic && (
                <div>
                  <label className="block text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                    Quick ideas for "{docTopic}"
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      `Flowchart for ${docTopic}`,
                      `Mind map of key concepts in ${docTopic}`,
                      `Timeline of ${docTopic} development`,
                      `Labeled diagram of ${docTopic}`,
                      `Comparison table for ${docTopic}`,
                    ].map((idea) => (
                      <button
                        key={idea}
                        type="button"
                        onClick={() => setPrompt(idea)}
                        className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors"
                        style={{
                          backgroundColor: 'var(--surface-2)',
                          borderColor: 'var(--border)',
                          color: 'var(--text-secondary)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--primary)')}
                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
                      >
                        {idea.length > 40 ? idea.substring(0, 40) + '…' : idea}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div
                className="flex items-center justify-end gap-3 pt-4 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-[13px] font-medium rounded-xl transition-colors"
                  style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGenerating || !prompt.trim()}
                  className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-xl shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'linear-gradient(135deg, #1E5B3F 0%, #2B4C7E 100%)' }}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating Diagram...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Diagram
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {/* ─── Step 2: Preview ─── */}
          {step === 2 && generatedDiagram && (
            <div className="p-6 space-y-5">
              {/* Preview label */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    Generated {selectedTypeInfo?.label || 'Diagram'}
                  </h3>
                  <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                    "{prompt}"
                  </p>
                </div>
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-xl border transition-colors"
                  style={{
                    backgroundColor: 'var(--surface-2)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-1)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-2)')}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Regenerate
                </button>
              </div>

              {/* SVG Preview */}
              <div
                className="rounded-xl border overflow-hidden shadow-inner"
                style={{
                  backgroundColor: '#FAFAF8',
                  borderColor: 'var(--border)',
                  minHeight: '300px',
                }}
              >
                <img
                  src={generatedDiagram.dataUrl}
                  alt="AI Generated Diagram"
                  className="w-full h-auto object-contain"
                  style={{ minHeight: '280px' }}
                />
              </div>

              {/* Info badge */}
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-xl text-[12px]"
                style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>
                  Diagram generated successfully. Insert it into your page or regenerate with a different prompt.
                </span>
              </div>

              {/* Actions */}
              <div
                className="flex items-center justify-between pt-4 border-t"
                style={{ borderColor: 'var(--border)' }}
              >
                <button
                  onClick={handleRegenerate}
                  className="flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-xl transition-colors"
                  style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Try Again
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClose}
                    className="px-4 py-2 text-[13px] font-medium rounded-xl transition-colors"
                    style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInsertIntoPage}
                    className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-xl shadow-md transition-opacity hover:opacity-90"
                    style={{ background: 'linear-gradient(135deg, #1E5B3F 0%, #2B4C7E 100%)' }}
                  >
                    <Plus className="w-4 h-4" />
                    Insert into Page
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ─── Loading overlay ─── */}
          {isGenerating && (
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] flex items-center justify-center z-10 rounded-2xl">
              <div
                className="flex flex-col items-center gap-4 p-8 rounded-2xl shadow-2xl border"
                style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
              >
                <div className="relative">
                  <div
                    className="w-14 h-14 rounded-full border-4 animate-spin"
                    style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'var(--primary)' }}
                  />
                  <Sparkles
                    className="w-5 h-5 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    style={{ color: 'var(--primary)' }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-[14px] font-bold" style={{ color: 'var(--text-primary)' }}>
                    Generating {selectedTypeInfo?.label}...
                  </p>
                  <p className="text-[12px] mt-1" style={{ color: 'var(--text-muted)' }}>
                    Gemini AI is composing your diagram
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
