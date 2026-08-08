import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, X, ArrowRight, CheckCircle2, Loader2 } from 'lucide-react';
import api from '../../lib/api.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { toast } from 'sonner';

export default function AiGeneratorModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const { setDocument } = useEditorStore();

  const [step, setStep] = useState(1); // 1: prompt & template, 2: outline review, 3: generating
  const [topic, setTopic] = useState('Study of Electromagnetic Induction & Application in Transformers');
  const [referenceText, setReferenceText] = useState('');
  const [docType, setDocType] = useState('PDF');
  const [templateId, setTemplateId] = useState('tpl_physics_proj');
  const [isGenerating, setIsGenerating] = useState(false);
  const [outline, setOutline] = useState(null);

  if (!isOpen) return null;

  const handleGenerateOutline = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setIsGenerating(true);
    try {
      const res = await api.post('/ai/outline', { topic, docType, referenceText });
      setOutline(res.data.outline);
      setIsGenerating(false);
      setStep(2);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429 || err.response?.data?.error?.includes('quota')) {
        toast.error('AI quota reached. Please wait a few seconds and try again.');
      } else {
        toast.error('Failed to generate outline. Please try again.');
      }
      setIsGenerating(false);
    }
  };

  const handleGenerateDocument = async () => {
    setStep(3);
    setIsGenerating(true);
    try {
      const res = await api.post('/ai/generate', {
        topic,
        type: docType,
        templateId,
        outline
      });

      const doc = res.data.document;
      setDocument(doc);
      setIsGenerating(false);
      onClose();
      toast.success('Document generated successfully!');
      navigate(`/editor/${doc.id}`);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 429 || err.response?.data?.error?.includes('quota')) {
        toast.error('AI quota reached. Please wait a few seconds and try again.');
      } else {
        toast.error('Document generation failed.');
      }
      setIsGenerating(false);
      setStep(2);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl border p-6 space-y-5 animate-in fade-in zoom-in-95"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Sparkles className="w-5 h-5 fill-current" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Gemini AI Document Generator
              </h2>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Stage 1: Topic Outline → Stage 2: Chapter Review → Stage 3: Visual Canvas Model
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step Indicator */}
        <div
          className="flex items-center justify-between px-4 py-2.5 rounded-xl text-[12px] font-semibold"
          style={{ backgroundColor: 'var(--surface-2)' }}
        >
          <span style={{ color: step >= 1 ? 'var(--primary)' : 'var(--text-muted)' }}>
            1. Topic & Template
          </span>
          <span style={{ color: 'var(--border)' }}>→</span>
          <span style={{ color: step >= 2 ? 'var(--primary)' : 'var(--text-muted)' }}>
            2. Outline Review
          </span>
          <span style={{ color: 'var(--border)' }}>→</span>
          <span style={{ color: step === 3 ? 'var(--primary)' : 'var(--text-muted)' }}>
            3. Final Assembly
          </span>
        </div>

        {/* Step 1: Prompt & Template Selection */}
        {step === 1 && (
          <form onSubmit={handleGenerateOutline} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Project / Document Topic *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Study of Electromagnetic Induction & Application in Transformers"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border outline-none transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Optional Reference Notes or Source Excerpt
              </label>
              <textarea
                rows={3}
                placeholder="Paste key notes, formulas, or experiment steps here..."
                value={referenceText}
                onChange={(e) => setReferenceText(e.target.value)}
                className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border outline-none resize-none transition-colors"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Document Preset Template
                </label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border outline-none font-medium"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="tpl_physics_proj">Physics Investigatory Project (CBSE/NCERT)</option>
                  <option value="tpl_cert_excellence">Certificate of Achievement / Excellence</option>
                  <option value="tpl_lab_report">Academic Research & Lab Report</option>
                </select>
              </div>

              <div>
                <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Target Export Format
                </label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border outline-none font-medium"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="PDF">PDF Printable Document</option>
                  <option value="PPTX">PowerPoint Presentation (PPTX)</option>
                  <option value="DOCX">Microsoft Word Document (DOCX)</option>
                </select>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center justify-end gap-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-[13px] font-medium transition-colors"
                style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating Outline...
                  </>
                ) : (
                  <>
                    Generate Outline
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Outline Review */}
        {step === 2 && outline && (
          <div className="space-y-4">
            <div
              className="p-4 rounded-xl border space-y-1"
              style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--border)' }}
            >
              <h3 className="text-[15px] font-bold" style={{ color: 'var(--primary)' }}>
                {outline.title}
              </h3>
              <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {outline.subtitle}
              </p>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
              <span className="text-[12px] font-semibold uppercase tracking-wider block" style={{ color: 'var(--text-muted)' }}>
                Chapters ({outline.chapters?.length || 0})
              </span>
              {outline.chapters?.map((ch, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border space-y-1.5"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
                >
                  <span className="text-[13px] font-semibold block" style={{ color: 'var(--text-primary)' }}>
                    {ch.chapterNumber}. {ch.title}
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {ch.subtopics?.map((sub, sIdx) => (
                      <span
                        key={sIdx}
                        className="px-2 py-0.5 rounded-md text-[11px] font-medium border"
                        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[13px] font-medium"
                style={{ color: 'var(--text-muted)' }}
              >
                ← Back to Topic
              </button>
              <button
                onClick={handleGenerateDocument}
                disabled={isGenerating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Building Document...
                  </>
                ) : (
                  <>
                    Approve & Build Document
                    <CheckCircle2 className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Assembly Loader */}
        {step === 3 && (
          <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div
                className="w-14 h-14 rounded-full border-4 animate-spin"
                style={{ borderColor: 'var(--accent-soft)', borderTopColor: 'var(--primary)' }}
              />
            </div>
            <div>
              <h3 className="text-[16px] font-bold" style={{ color: 'var(--text-primary)' }}>
                Building Visual Canvas Document
              </h3>
              <p className="text-[13px] mt-1" style={{ color: 'var(--text-muted)' }}>
                Gemini is composing cover page, certificates, chapters, and bibliography...
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
