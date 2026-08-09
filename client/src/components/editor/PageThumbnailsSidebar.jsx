import React, { useState, useEffect, useRef } from 'react';
import {
  Plus, Trash2, FileText, Bookmark, Award, Sparkles, GripVertical,
  Edit3, Copy, MoreVertical
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore.js';
import { toast } from 'sonner';

const PAGE_TYPE_CONFIG = {
  cover: { label: 'Cover', icon: Bookmark, color: 'var(--primary)' },
  certificate: { label: 'Certificate', icon: Award, color: '#C48A2E' },
  declaration: { label: 'Declaration', icon: FileText, color: 'var(--primary)' },
  index: { label: 'Index', icon: FileText, color: 'var(--text-muted)' },
  bibliography: { label: 'Bibliography', icon: FileText, color: 'var(--text-muted)' },
  content: { label: 'Content', icon: FileText, color: 'var(--primary)' },
};

export default function PageThumbnailsSidebar({ onOpenAiSectionWriter }) {
  const {
    document, activePageIndex, setActivePage, addPage, deletePage,
    reorderPages, updatePageTitle
  } = useEditorStore();

  const pages = document?.contentJson?.pages || [];

  const [draggedIndex, setDraggedIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Right-click context menu state
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, pageIndex: null });
  const contextMenuRef = useRef(null);

  // Inline editing state
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const editInputRef = useRef(null);

  // Close context menu on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu({ visible: false, x: 0, y: 0, pageIndex: null });
      }
    };
    if (contextMenu.visible) {
      window.addEventListener('click', handleClickOutside);
      window.addEventListener('contextmenu', handleClickOutside);
    }
    return () => {
      window.removeEventListener('click', handleClickOutside);
      window.removeEventListener('contextmenu', handleClickOutside);
    };
  }, [contextMenu.visible]);

  // Focus input when inline editing starts
  useEffect(() => {
    if (editingIndex !== null && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingIndex]);

  const handleContextMenu = (e, index) => {
    e.preventDefault();
    e.stopPropagation();

    // Set active page to the right-clicked page
    setActivePage(index);

    // Calculate menu positioning to avoid screen overflowing
    const menuWidth = 160;
    const menuHeight = 120;
    const clickX = e.clientX;
    const clickY = e.clientY;
    const windowW = window.innerWidth;
    const windowH = window.innerHeight;

    const x = clickX + menuWidth > windowW ? windowW - menuWidth - 10 : clickX;
    const y = clickY + menuHeight > windowH ? windowH - menuHeight - 10 : clickY;

    setContextMenu({ visible: true, x, y, pageIndex: index });
  };

  const startRenaming = (index) => {
    setEditingIndex(index);
    setEditingTitle(pages[index]?.title || '');
    setContextMenu({ visible: false, x: 0, y: 0, pageIndex: null });
  };

  const saveRename = () => {
    if (editingIndex !== null && editingTitle.trim()) {
      updatePageTitle(editingIndex, editingTitle.trim());
      toast.success('Section renamed');
    }
    setEditingIndex(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      saveRename();
    } else if (e.key === 'Escape') {
      setEditingIndex(null);
    }
  };

  const handleDuplicatePage = (index) => {
    const targetPage = pages[index];
    if (!targetPage) return;

    const newPage = JSON.parse(JSON.stringify(targetPage));
    newPage.id = `page_${Date.now()}`;
    newPage.title = `${targetPage.title} (Copy)`;
    newPage.elements.forEach((el, i) => {
      el.id = `el_${Date.now()}_${i}`;
    });

    const doc = useEditorStore.getState().document;
    if (doc && doc.contentJson) {
      const newContentJson = JSON.parse(JSON.stringify(doc.contentJson));
      newContentJson.pages.splice(index + 1, 0, newPage);
      useEditorStore.setState({
        document: { ...doc, contentJson: newContentJson },
        activePageIndex: index + 1,
        isDirty: true,
      });
      toast.success(`Duplicated "${targetPage.title}"`);
    }
    setContextMenu({ visible: false, x: 0, y: 0, pageIndex: null });
  };

  const handleDragStart = (e, index) => {
    e.dataTransfer.setData('text/plain', index);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = (e, targetIndex) => {
    e.preventDefault();
    const sourceIndexStr = e.dataTransfer.getData('text/plain');
    const sourceIndex = parseInt(sourceIndexStr, 10);

    if (!isNaN(sourceIndex) && sourceIndex !== targetIndex) {
      reorderPages(sourceIndex, targetIndex);
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <aside
      className="w-56 flex flex-col h-full border-r flex-shrink-0 select-none relative"
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
            <Sparkles className="w-3.5 h-3.5" />
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
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {pages.map((page, idx) => {
          const isActive = idx === activePageIndex;
          const isDragging = idx === draggedIndex;
          const isOver = idx === dragOverIndex;
          const isEditingThis = editingIndex === idx;
          const config = PAGE_TYPE_CONFIG[page.type] || PAGE_TYPE_CONFIG.content;
          const Icon = config.icon;

          return (
            <div
              key={page.id || idx}
              draggable={!isEditingThis}
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragLeave={() => setDragOverIndex(null)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={handleDragEnd}
              onClick={() => setActivePage(idx)}
              onContextMenu={(e) => handleContextMenu(e, idx)}
              className="group relative p-2.5 rounded-xl cursor-grab active:cursor-grabbing transition-all border"
              style={{
                backgroundColor: isActive
                  ? 'var(--accent-soft)'
                  : isOver
                  ? 'var(--surface-2)'
                  : 'transparent',
                borderColor: isOver
                  ? 'var(--primary)'
                  : isActive
                  ? 'var(--primary)'
                  : 'transparent',
                opacity: isDragging ? 0.3 : 1,
                transform: isOver ? 'scale(1.02)' : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive && !isOver) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-2)';
                  e.currentTarget.style.borderColor = 'var(--border)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive && !isOver) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = 'transparent';
                }
              }}
            >
              <div className="flex items-center gap-2">
                {/* Drag handle */}
                <GripVertical
                  className="w-3.5 h-3.5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                  style={{ color: 'var(--text-muted)' }}
                />

                {/* Page number */}
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? 'var(--primary)' : 'var(--surface-2)',
                    color: isActive ? 'white' : 'var(--text-muted)',
                  }}
                >
                  {idx + 1}
                </div>

                {/* Title + type (Inline input if editing) */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isActive ? 'var(--primary)' : config.color }} />
                    {isEditingThis ? (
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        onBlur={saveRename}
                        onKeyDown={handleKeyDown}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-[12px] font-bold px-1.5 py-0.5 rounded border outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        style={{ borderColor: 'var(--primary)' }}
                      />
                    ) : (
                      <span
                        onDoubleClick={(e) => {
                          e.stopPropagation();
                          startRenaming(idx);
                        }}
                        className="text-[12px] font-semibold truncate cursor-text"
                        style={{ color: isActive ? 'var(--primary)' : 'var(--text-primary)' }}
                        title="Double-click or Right-click to rename"
                      >
                        {page.title || `Page ${idx + 1}`}
                      </span>
                    )}
                  </div>
                  <span
                    className="text-[10px] uppercase tracking-wide font-medium"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {config.label}
                  </span>
                </div>

                {/* Quick actions (Edit & Delete) */}
                {!isEditingThis && (
                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRenaming(idx);
                      }}
                      className="p-1 rounded text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors"
                      title="Rename Section"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    {pages.length > 1 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deletePage(idx);
                        }}
                        className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
                        title="Delete Page"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Right-Click Context Menu */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 w-44 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 py-1.5 space-y-0.5 animate-in fade-in zoom-in-95 text-[12px] font-medium"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-gray-100 dark:border-gray-700/50 mb-1">
            Section Options
          </div>

          <button
            onClick={() => startRenaming(contextMenu.pageIndex)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-emerald-600 transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 text-emerald-500" />
            Rename Section
          </button>

          <button
            onClick={() => handleDuplicatePage(contextMenu.pageIndex)}
            className="w-full flex items-center gap-2 px-3 py-2 text-left text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-950/40 hover:text-blue-600 transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-blue-500" />
            Duplicate Section
          </button>

          {pages.length > 1 && (
            <button
              onClick={() => {
                deletePage(contextMenu.pageIndex);
                setContextMenu({ visible: false, x: 0, y: 0, pageIndex: null });
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors border-t border-gray-100 dark:border-gray-700/50 mt-1"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-500" />
              Delete Section
            </button>
          )}
        </div>
      )}
    </aside>
  );
}
