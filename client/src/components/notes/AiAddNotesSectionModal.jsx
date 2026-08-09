import React, { useState } from 'react';
import { Sparkles, X, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api.js';

export default function AiAddNotesSectionModal({ isOpen, onClose, onAddBlocks, docTitle }) {
  const [promptText, setPromptText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGenerateSection = async (e) => {
    e.preventDefault();
    if (!promptText.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.post('/notes/generate', {
        topic: `${docTitle} — Section: ${promptText.trim()}`,
        outline: [
          { id: 'sec_new', heading: promptText.trim(), description: promptText.trim() }
        ],
        targetClass: 'Class X',
      });

      const pages = res.data.document?.contentJson?.pages || [];
      const newBlocks = pages[0]?.blocks || res.data.document?.contentJson?.blocks || [];

      if (newBlocks.length > 0) {
        onAddBlocks(newBlocks);
        toast.success('AI Section added to notes!');
        setPromptText('');
        onClose();
      } else {
        toast.error('AI generated no blocks. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate AI section');
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
            <Sparkles className="w-5 h-5 fill-current" />
            <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>
              Add AI Section to Notes
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleGenerateSection} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              What section or topic would you like AI to write? *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Add a comparison table between Meristematic vs Permanent Tissues with an exam tip..."
              value={promptText}
              onChange={(e) => setPromptText(e.target.value)}
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
              disabled={isLoading || !promptText.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Wand2 className="w-3.5 h-3.5" />
              {isLoading ? 'Generating Section...' : 'Generate & Insert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
