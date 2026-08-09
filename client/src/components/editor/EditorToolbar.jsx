import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Undo2, Redo2, Type, Download, Share2,
  Save, CheckCircle2, Circle, ZoomIn, ZoomOut, Image as ImageIcon, Edit3
} from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore.js';
import { toast } from 'sonner';
import api from '../../lib/api.js';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter' },
  { value: 'Geist', label: 'Geist' },
  { value: 'Cinzel', label: 'Cinzel' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Poppins', label: 'Poppins' },
  { value: 'DM Sans', label: 'DM Sans' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Outfit', label: 'Outfit' },
  { value: 'Montserrat', label: 'Montserrat' },
  { value: 'Playfair Display', label: 'Playfair Display' },
  { value: 'Fira Code', label: 'Fira Code' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

export default function EditorToolbar({
  onOpenExportModal,
  onOpenMediaModal,
  onOpenShareModal,
}) {
  const navigate = useNavigate();
  const {
    document, activePageIndex, selectedElementId, undo, redo, addElement,
    updateElement, updateTheme, updateDocumentTitle, isDirty, zoomLevel, setZoom
  } = useEditorStore();
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');

  const handleStartTitleEdit = () => {
    setTitleInput(document?.title || 'Untitled Document');
    setIsEditingTitle(true);
  };

  const handleSaveTitleEdit = () => {
    if (titleInput.trim() && titleInput.trim() !== document?.title) {
      updateDocumentTitle(titleInput.trim());
      toast.success('Document title updated');
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSaveTitleEdit();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const theme = document?.contentJson?.theme || {};
  const activePage = document?.contentJson?.pages?.[activePageIndex];
  const selectedElement = activePage?.elements?.find((e) => e.id === selectedElementId);

  const activeFontFamily = selectedElement
    ? (selectedElement.fontFamily || theme.fontFamily || 'Georgia')
    : (theme.fontFamily || 'Georgia');

  const handleFontChange = (newFont) => {
    if (selectedElementId && selectedElement) {
      updateElement(activePageIndex, selectedElementId, { fontFamily: newFont });
      toast.success(`Font set to ${newFont}`);
    } else {
      updateTheme({ fontFamily: newFont });
      toast.success(`Global font set to ${newFont}`);
    }
  };

  const handleAddText = () => {
    const newEl = {
      id: `el_${Date.now()}`,
      type: 'text',
      content: 'Click to edit text...',
      fontSize: 16,
      fontFamily: theme.fontFamily || 'Georgia',
      align: 'left',
      y: 200,
      x: 50,
      color: theme.primaryColor || '#1A1A1A',
    };
    addElement(activePageIndex, newEl);
  };

  const handleSave = async () => {
    if (!document) return;
    setIsSaving(true);
    try {
      await api.put(`/documents/${document.id}`, {
        title: document.title,
        contentJson: document.contentJson,
        status: 'FINALIZED',
      });
      toast.success('Document saved!');
    } catch (err) {
      toast.error('Failed to save. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <header
      className="h-14 flex items-center justify-between gap-2 px-3 border-b z-20 flex-shrink-0 overflow-x-auto"
      style={{
        backgroundColor: 'var(--surface-1)',
        borderColor: 'var(--border)',
      }}
    >
      {/* Left: back + title + save status */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded-xl transition-colors flex-shrink-0"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>

        <div className="w-px h-5 hidden sm:block" style={{ backgroundColor: 'var(--border)' }} />

        <div className="flex items-center gap-1.5">
          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onBlur={handleSaveTitleEdit}
              onKeyDown={handleTitleKeyDown}
              className="text-[13px] font-semibold px-2 py-0.5 rounded-lg border outline-none max-w-[180px] sm:max-w-[260px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              style={{ borderColor: 'var(--primary)' }}
            />
          ) : (
            <button
              onClick={handleStartTitleEdit}
              className="group flex items-center gap-1 text-[13px] sm:text-[14px] font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-lg transition-colors max-w-[140px] sm:max-w-[220px]"
              style={{ color: 'var(--text-primary)' }}
              title="Click to rename document"
            >
              <span className="truncate">{document?.title || 'Untitled Document'}</span>
              <Edit3 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-gray-400 transition-opacity flex-shrink-0" />
            </button>
          )}

          {/* Save status pill */}
          <span
            className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0"
            style={
              isDirty
                ? { backgroundColor: '#FEF3C7', color: '#92400E' }
                : { backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }
            }
          >
            {isDirty ? (
              <>
                <Circle className="w-2 h-2 fill-current" />
                Unsaved
              </>
            ) : (
              <>
                <CheckCircle2 className="w-3 h-3" />
                Saved
              </>
            )}
          </span>
        </div>
      </div>

      {/* Center: editing tools */}
      <div
        className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 rounded-xl flex-shrink-0 overflow-x-auto"
        style={{ backgroundColor: 'var(--surface-2)' }}
      >
        {/* Undo / Redo */}
        <button
          onClick={undo}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          title="Undo"
        >
          <Undo2 className="w-4 h-4" />
        </button>
        <button
          onClick={redo}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          title="Redo"
        >
          <Redo2 className="w-4 h-4" />
        </button>

        <div className="w-px h-4 mx-0.5" style={{ backgroundColor: 'var(--border)' }} />

        {/* Add text */}
        <button
          onClick={handleAddText}
          className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
        >
          <Type className="w-3.5 h-3.5" />
          Add Text
        </button>

        {/* Add image */}
        {onOpenMediaModal && (
          <button
            onClick={onOpenMediaModal}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[12px] font-medium rounded-lg transition-colors"
            style={{ color: 'var(--text-secondary)' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
          >
            <ImageIcon className="w-3.5 h-3.5" />
            Add Image
          </button>
        )}

        <div className="w-px h-4 mx-0.5" style={{ backgroundColor: 'var(--border)' }} />

        {/* Dynamic Font selector */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase font-bold text-gray-400">Font:</span>
          <select
            value={activeFontFamily}
            onChange={e => handleFontChange(e.target.value)}
            className="text-[12px] px-2 py-1 rounded-lg border outline-none font-medium cursor-pointer"
            style={{
              backgroundColor: 'var(--surface-1)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            title={selectedElement ? "Selected Text Font" : "Global Document Font"}
          >
            {FONT_OPTIONS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Border Style selector */}
        <select
          value={theme.borderStyle || 'double'}
          onChange={e => updateTheme({ borderStyle: e.target.value })}
          className="text-[12px] px-2 py-1 rounded-lg border outline-none font-medium cursor-pointer"
          style={{
            backgroundColor: 'var(--surface-1)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
        >
          <option value="double">Double Border</option>
          <option value="single">Single Border</option>
          <option value="ornamental">Ornamental Border</option>
          <option value="none">No Border</option>
        </select>

        <div className="w-px h-4 mx-0.5" style={{ backgroundColor: 'var(--border)' }} />

        {/* Zoom */}
        <button
          onClick={() => setZoom(Math.max(50, zoomLevel - 10))}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <span className="text-[12px] font-medium w-8 text-center" style={{ color: 'var(--text-muted)' }}>
          {zoomLevel}%
        </span>
        <button
          onClick={() => setZoom(Math.min(200, zoomLevel + 10))}
          className="p-1.5 rounded-lg transition-colors"
          style={{ color: 'var(--text-secondary)' }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; }}
          onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
        >
          <ZoomIn className="w-4 h-4" />
        </button>
      </div>

      {/* Right: Save & Export buttons */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold rounded-xl transition-opacity hover:opacity-90 disabled:opacity-50"
          style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}
        >
          <Save className="w-3.5 h-3.5" />
          {isSaving ? 'Saving...' : 'Save'}
        </button>

        {onOpenShareModal && (
          <button
            onClick={onOpenShareModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-[13px] font-semibold rounded-xl transition-opacity hover:opacity-90 border"
            style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-primary)', borderColor: 'var(--border)' }}
          >
            <Share2 className="w-3.5 h-3.5 text-blue-600" />
            Share
          </button>
        )}

        <button
          onClick={onOpenExportModal}
          className="flex items-center gap-1.5 px-4 py-1.5 text-[13px] font-semibold text-white rounded-xl transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>
    </header>
  );
}
