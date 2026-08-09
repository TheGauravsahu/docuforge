import React, { useState } from 'react';
import { Sparkles, X, FastForward } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api.js';

export default function AiSmartContinueModal({ isOpen, onClose, onAppendPages, docTitle, existingPages }) {
  const [instruction, setInstruction] = useState('Continue notes with more pages based on current progress');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleContinue = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await api.post('/notes/continue', {
        documentTitle: docTitle,
        existingPages: existingPages.map(p => ({
          title: p.title,
          blocks: (p.blocks || []).map(b => ({ heading: b.heading, text: b.text, label: b.label, type: b.type }))
        })),
        userInstruction: instruction.trim(),
        targetClass: 'Class X'
      });

      const newPages = res.data.pages || [];
      if (newPages.length > 0) {
        onAppendPages(newPages);
        toast.success(`AI added ${newPages.length} continuation page(s)!`);
        onClose();
      } else {
        toast.error('AI generated no new pages. Try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to continue notes with AI');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl border p-6 space-y-4 animate-in fade-in zoom-in-95"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2 text-emerald-600 font-bold">
            <Sparkles className="w-5 h-5 fill-current animate-pulse" />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              AI Smart Continue Notes
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs leading-relaxed opacity-80" style={{ color: 'var(--text-secondary)' }}>
          AI will analyze all {existingPages.length} existing page(s) created so far and automatically generate the next subtopics/pages to complete your study guide.
        </p>

        <form onSubmit={handleContinue} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              Continuation Prompt / Custom Direction:
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Continue notes with Epithelial Tissue types, Muscular Tissues, and NCERT Board Questions..."
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              className="w-full text-sm p-3 rounded-xl border outline-none font-medium"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold"
              style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-secondary)' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !instruction.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <FastForward className="w-4 h-4 fill-current" />
              {isLoading ? 'Analyzing & Writing Pages...' : 'Continue Notes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
