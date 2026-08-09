import React, { useState } from 'react';
import { X, FileText, Download, Eye, Calendar, Sparkles, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEditorStore } from '../../store/useEditorStore.js';
import { printDocumentPages } from '../../lib/pdfPrint.js';

export default function DocumentPreviewModal({ doc, isOpen, onClose }) {
  const navigate = useNavigate();
  const { setDocument } = useEditorStore();
  const [activePageIndex, setActivePageIndex] = useState(0);

  if (!isOpen || !doc) return null;

  const pages = doc.contentJson?.pages || [];
  const theme = doc.contentJson?.theme || {};
  const placeholders = doc.contentJson?.placeholders || {};
  const activePage = pages[activePageIndex] || pages[0];

  const handleOpenEditor = () => {
    setDocument(doc);
    onClose();
    navigate(`/editor/${doc.id}`);
  };

  const handlePrint = () => {
    printDocumentPages(doc.contentJson, doc.title);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in fade-in zoom-in-95"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm flex-shrink-0"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="text-[16px] font-bold tracking-tight truncate max-w-md" style={{ color: 'var(--text-primary)' }}>
                {doc.title}
              </h2>
              <div className="flex items-center gap-2 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                <span>Type: {doc.type}</span>
                <span>•</span>
                <span>{pages.length} Pages</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-emerald-500" />
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-semibold rounded-xl border transition-colors"
              style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            >
              <Download className="w-3.5 h-3.5" /> Print PDF
            </button>
            <button
              onClick={handleOpenEditor}
              className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-semibold text-white rounded-xl shadow-sm transition-opacity hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <Sparkles className="w-3.5 h-3.5 fill-current" /> Open in Editor
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl transition-colors ml-2"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Thumbnails List */}
          <div className="w-56 border-r p-3 overflow-y-auto space-y-1.5 flex-shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">
              Page Navigator ({pages.length})
            </p>
            {pages.map((p, idx) => (
              <button
                key={p.id || idx}
                onClick={() => setActivePageIndex(idx)}
                className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all border ${
                  activePageIndex === idx
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                    : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>
                <span className="text-[12px] truncate">{p.title || `Page ${idx + 1}`}</span>
              </button>
            ))}
          </div>

          {/* Canvas Preview Area */}
          <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-start bg-gray-200 dark:bg-gray-950">
            {/* Page Navigation Controls */}
            <div className="flex items-center gap-3 mb-4 bg-white dark:bg-gray-800 px-3 py-1.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-700 dark:text-gray-300">
              <button
                onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))}
                disabled={activePageIndex === 0}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span>Page {activePageIndex + 1} of {pages.length}</span>
              <button
                onClick={() => setActivePageIndex(prev => Math.min(pages.length - 1, prev + 1))}
                disabled={activePageIndex === pages.length - 1}
                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-30"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {activePage && (
              <div
                className="bg-white shadow-2xl relative transition-all"
                style={{
                  width: 580,
                  minHeight: 820,
                  backgroundColor: theme.backgroundColor || '#FAFAF8',
                  border: theme.borderStyle === 'double' ? `4px double ${theme.borderColor || theme.primaryColor || '#1E5B3F'}` : `2px solid ${theme.borderColor || '#1E5B3F'}`,
                  padding: '30px',
                }}
              >
                {activePage.elements?.map((el) => {
                  if (el.type === 'text') {
                    return (
                      <div
                        key={el.id}
                        style={{
                          position: 'absolute',
                          left: `${(el.x || 45) * 0.82}px`,
                          top: `${(el.y || 50) * 0.82}px`,
                          width: `${(el.width || 610) * 0.82}px`,
                          fontSize: `${Math.max(9, (el.fontSize || 14) * 0.82)}px`,
                          fontFamily: el.fontFamily || theme.fontFamily || 'Georgia',
                          fontWeight: el.fontWeight || 'normal',
                          fontStyle: el.fontStyle || 'normal',
                          textDecoration: el.underline ? 'underline' : el.linethrough ? 'line-through' : 'none',
                          color: el.color || theme.primaryColor || '#1A1A1A',
                          textAlign: el.align || 'left',
                          whiteSpace: 'pre-wrap',
                          lineHeight: el.lineHeight || 1.3,
                          backgroundColor: el.textBackgroundColor || 'transparent',
                        }}
                      >
                        {el.content}
                      </div>
                    );
                  } else if (el.type === 'image' && el.url) {
                    return (
                      <img
                        key={el.id}
                        src={el.url}
                        alt="Canvas Content"
                        style={{
                          position: 'absolute',
                          left: `${(el.x || 50) * 0.82}px`,
                          top: `${(el.y || 100) * 0.82}px`,
                          width: `${(el.width || 320) * 0.82}px`,
                          height: `${(el.height || 220) * 0.82}px`,
                          objectFit: 'contain',
                        }}
                      />
                    );
                  }
                  return null;
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
