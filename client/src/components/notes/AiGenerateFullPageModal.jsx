import React, { useState } from 'react';
import { Sparkles, X, FilePlus } from 'lucide-react';
import { toast } from 'sonner';
import api from '../../lib/api.js';

export default function AiGenerateFullPageModal({ isOpen, onClose, onAddFullPage, docTitle, pageCount }) {
  const [topicPrompt, setTopicPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleGeneratePage = async (e) => {
    e.preventDefault();
    if (!topicPrompt.trim()) return;

    setIsLoading(true);
    try {
      const res = await api.post('/notes/generate', {
        topic: `${docTitle} — ${topicPrompt.trim()}`,
        outline: [
          { id: 'page_new', heading: topicPrompt.trim(), description: topicPrompt.trim() }
        ],
        targetClass: 'Class X',
      });

      const pages = res.data.document?.contentJson?.pages || [];
      const generatedBlocks = pages[0]?.blocks || res.data.document?.contentJson?.blocks || [];

      if (generatedBlocks.length > 0) {
        const newPage = {
          id: `page_${Date.now()}`,
          title: `Page ${pageCount + 1}: ${topicPrompt.trim()}`,
          blocks: generatedBlocks
        };
        onAddFullPage(newPage);
        toast.success(`Generated & added Page ${pageCount + 1}!`);
        setTopicPrompt('');
        onClose();
      } else {
        toast.error('AI generated no blocks. Please try again.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate full page with AI');
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
              Generate Full Page with AI
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleGeneratePage} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
              What topic or chapter section should this new A4 page cover? *
            </label>
            <textarea
              rows={3}
              required
              placeholder="e.g. Nervous System & Neuron Structure with definitions, diagrams, and NCERT exam questions..."
              value={topicPrompt}
              onChange={(e) => setTopicPrompt(e.target.value)}
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
              disabled={isLoading || !topicPrompt.trim()}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <FilePlus className="w-4 h-4" />
              {isLoading ? 'Generating Full Page...' : 'Generate New Page'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
