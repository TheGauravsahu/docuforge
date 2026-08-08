import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown, FileText, Bookmark, Award, Sparkles } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore.js';

const PAGE_TYPE_CONFIG = {
  cover: { label: 'Cover', icon: Bookmark, color: 'var(--primary)' },
  certificate: { label: 'Certificate', icon: Award, color: '#C48A2E' },
  declaration: { label: 'Declaration', icon: FileText, color: 'var(--primary)' },
  index: { label: 'Index', icon: FileText, color: 'var(--text-muted)' },
  bibliography: { label: 'Bibliography', icon: FileText, color: 'var(--text-muted)' },
  content: { label: 'Content', icon: FileText, color: 'var(--primary)' },
};

export default function PageThumbnailsSidebar({ onOpenAiSectionWriter }) {
  const { document, activePageIndex, setActivePage, addPage, deletePage, reorderPages } = useEditorStore();
  const pages = document?.contentJson?.pages || [];

  return (
    <aside
      className="w-56 flex flex-col h-full border-r flex-shrink-0"
      style={{
        backgroundColor: 'var(--surface-1)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Header */}
      <div
        className="px-4 py-3 flex items-center justify-between border-b flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        <div>
          <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
            Pages
          </p>
          <p className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {pages.length} {pages.length === 1 ? 'page' : 'pages'}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenAiSectionWriter}
            className="flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-semibold transition-colors"
            style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }}
            title="AI Section Writer"
          >
            <Sparkles className="w-3 h-3" />
            AI Page
          </button>
          <button
            onClick={() => addPage('content', `Chapter ${pages.length - 2}: New Section`)}
            className="p-1.5 rounded-xl text-[12px] font-semibold transition-colors border"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
            title="Add Blank Page"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Pages list */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-1.5">
        {pages.map((page, idx) => {
          const isActive = idx === activePageIndex;
          const config = PAGE_TYPE_CONFIG[page.type] || PAGE_TYPE_CONFIG.content;
          const Icon = config.icon;

          return (
            <div
              key={page.id || idx}
              onClick={() => setActivePage(idx)}
              className="group relative p-2.5 rounded-xl cursor-pointer transition-all border"
              style={{
                backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                borderColor: isActive ? 'var(--primary)' : 'transparent',
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center gap-2.5">
                {/* Page number */}
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--surface-2)',
                    color: isActive ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {idx + 1}
                </div>

                {/* Title + type */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Icon className="w-3 h-3 flex-shrink-0" style={{ color: isActive ? 'var(--primary)' : config.color }} />
                    <span
                      className="text-[12px] font-semibold truncate"
                      style={{ color: isActive ? 'var(--primary)' : 'var(--text-primary)' }}
                    >
                      {page.title || `Page ${idx + 1}`}
                    </span>
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-wide font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Page controls */}
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  {idx > 0 && (
                    <button
                      onClick={e => { e.stopPropagation(); reorderPages(idx, idx - 1); }}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      title="Move Up"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </button>
                  )}
                  {idx < pages.length - 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); reorderPages(idx, idx + 1); }}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                      title="Move Down"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  )}
                  {pages.length > 1 && (
                    <button
                      onClick={e => { e.stopPropagation(); deletePage(idx); }}
                      className="p-1 rounded transition-colors"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FEE2E2'; e.currentTarget.style.color = 'var(--danger)'; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                      title="Delete Page"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
