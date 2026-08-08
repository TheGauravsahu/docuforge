import React, { useState } from 'react';
import { X, Sparkles, Loader2, Plus, ArrowRight } from 'lucide-react';
import api from '../../lib/api.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { toast } from 'sonner';

export default function AiSectionWriterModal({ isOpen, onClose }) {
  const { document, addPage, updateElement } = useEditorStore();
  const [sectionTitle, setSectionTitle] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSection = async (e) => {
    e.preventDefault();
    if (!sectionTitle.trim()) return;

    setIsGenerating(true);
    try {
      const res = await api.post('/ai/write-section', {
        title: sectionTitle.trim(),
        topic: document?.title || '',
      });

      const sec = res.data.section;
      const theme = document?.contentJson?.theme || {};

      // Build elements array for new section page
      const elements = [
        {
          id: `sec_${Date.now()}_title`,
          type: 'text',
          content: sec.title || sectionTitle,
          fontSize: 18,
          fontWeight: 'bold',
          align: 'left',
          x: 45,
          y: 55,
          width: 610,
          color: theme.primaryColor || '#1E5B3F',
        },
      ];

      if (sec.subtopics && sec.subtopics.length > 0) {
        elements.push({
          id: `sec_${Date.now()}_sub`,
          type: 'text',
          content: `Key Focus Areas:\n${sec.subtopics.map(s => `• ${s}`).join('\n')}`,
          fontSize: 12,
          fontWeight: 'bold',
          align: 'left',
          x: 45,
          y: 95,
          width: 610,
          color: theme.accentColor || '#C1663E',
        });
      }

      if (sec.bodyParagraphs && sec.bodyParagraphs.length > 0) {
        let currentY = 180;
        sec.bodyParagraphs.forEach((pText, pIdx) => {
          elements.push({
            id: `sec_${Date.now()}_body_${pIdx}`,
            type: 'text',
            content: pText,
            fontSize: 13,
            align: 'left',
            x: 45,
            y: currentY,
            width: 610,
            color: '#222222',
          });
          currentY += 160;
        });
      }

      // Append page to document using store
      const doc = useEditorStore.getState().document;
      if (doc && doc.contentJson) {
        const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
        const newPageId = `page_${Date.now()}`;
        newContentJson.pages.push({
          id: newPageId,
          type: 'content',
          title: sec.title || sectionTitle,
          elements,
        });

        useEditorStore.setState({
          document: { ...doc, contentJson: newContentJson },
          activePageIndex: newContentJson.pages.length - 1,
          isDirty: true,
        });
      }

      toast.success(`AI Section "${sec.title || sectionTitle}" added!`);
      setIsGenerating(false);
      setSectionTitle('');
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('AI Section writing failed. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl border p-6 space-y-5 animate-in fade-in zoom-in-95"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                AI Content Writer
              </h2>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Generate a full academic section page based on your title.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleGenerateSection} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Section / Chapter Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Chapter 9: Artificial Intelligence in Modern Robotics"
              value={sectionTitle}
              onChange={e => setSectionTitle(e.target.value)}
              className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border outline-none transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t" style={{ borderColor: 'var(--border)' }}>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-[13px] font-medium rounded-xl transition-colors"
              style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-xl shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Writing Section with AI...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Generate Section
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
