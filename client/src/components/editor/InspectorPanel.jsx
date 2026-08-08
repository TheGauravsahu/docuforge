import React from 'react';
import { Sliders, Trash2, AlignLeft, AlignCenter, AlignRight, Bold, Type, Sparkles, GraduationCap, Wand2, ChevronRight, Image as ImageIcon } from 'lucide-react';
import { useEditorStore } from '../../store/useEditorStore.js';

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter (Sans-Serif)' },
  { value: 'Geist', label: 'Geist (Modern Sans)' },
  { value: 'Cinzel', label: 'Cinzel (Academic Serif)' },
  { value: 'Georgia', label: 'Georgia (Classic Serif)' },
  { value: 'Poppins', label: 'Poppins (Geometric)' },
  { value: 'DM Sans', label: 'DM Sans (SaaS Sans)' },
  { value: 'Roboto', label: 'Roboto (Standard)' },
  { value: 'Outfit', label: 'Outfit (Display)' },
  { value: 'Montserrat', label: 'Montserrat (Heading)' },
  { value: 'Playfair Display', label: 'Playfair Display (Serif)' },
  { value: 'Fira Code', label: 'Fira Code (Monospace)' },
  { value: 'Times New Roman', label: 'Times New Roman' },
];

export default function InspectorPanel({
  onOpenPlaceholderModal,
  onOpenAiModal,
  onOpenAiSectionModal,
  onOpenMediaModal
}) {
  const { document, activePageIndex, selectedElementId, updateElement, deleteElement, updateTheme } = useEditorStore();

  const activePage = document?.contentJson?.pages?.[activePageIndex];
  const selectedElement = activePage?.elements?.find((e) => e.id === selectedElementId);
  const theme = document?.contentJson?.theme || {};

  return (
    <aside
      className="w-72 flex flex-col h-full overflow-y-auto p-4 select-none border-l flex-shrink-0 space-y-6"
      style={{
        backgroundColor: 'var(--surface-1)',
        borderColor: 'var(--border)',
      }}
    >
      <div
        className="flex items-center gap-2 pb-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <Sliders className="w-4 h-4" style={{ color: 'var(--primary)' }} />
        <h3 className="text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          {selectedElement ? 'Element Inspector' : 'Page Inspector'}
        </h3>
      </div>

      {selectedElement ? (
        selectedElement.type === 'image' ? (
          /* ── IMAGE ELEMENT INSPECTOR ── */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 flex items-center justify-between">
                <span>Image Preview</span>
                <button
                  onClick={onOpenMediaModal}
                  className="text-[11px] font-semibold text-emerald-500 hover:underline flex items-center gap-1"
                >
                  <ImageIcon className="w-3 h-3" /> Replace
                </button>
              </label>
              <div
                className="w-full h-36 rounded-xl border p-2 flex items-center justify-center overflow-hidden"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
              >
                <img
                  src={selectedElement.url}
                  alt="Selected Canvas Media"
                  className="max-h-full max-w-full object-contain rounded-lg shadow-sm"
                />
              </div>
            </div>

            {/* Direct Image URL Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Image Source URL
              </label>
              <input
                type="url"
                value={selectedElement.url || ''}
                onChange={(e) => updateElement(activePageIndex, selectedElement.id, { url: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Width (px) */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <span>Width ({selectedElement.width || 320}px)</span>
              </div>
              <input
                type="range"
                min={50}
                max={650}
                value={selectedElement.width || 320}
                onChange={(e) => updateElement(activePageIndex, selectedElement.id, { width: parseInt(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Height (px) */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                <span>Height ({selectedElement.height || 220}px)</span>
              </div>
              <input
                type="range"
                min={50}
                max={900}
                value={selectedElement.height || 220}
                onChange={(e) => updateElement(activePageIndex, selectedElement.id, { height: parseInt(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>

            {/* Position X & Y */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Position X</label>
                <input
                  type="number"
                  value={selectedElement.x || 50}
                  onChange={(e) => updateElement(activePageIndex, selectedElement.id, { x: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-gray-500 mb-1">Position Y</label>
                <input
                  type="number"
                  value={selectedElement.y || 100}
                  onChange={(e) => updateElement(activePageIndex, selectedElement.id, { y: parseInt(e.target.value) || 0 })}
                  className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            {/* Delete Image Button */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => deleteElement(activePageIndex, selectedElement.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Image Element
              </button>
            </div>
          </div>
        ) : (
          /* ── TEXT ELEMENT INSPECTOR ── */
          <div className="space-y-4">
            
            {/* Element Content Editor */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Text Content
              </label>
              <textarea
                rows={4}
                value={selectedElement.content || ''}
                onChange={(e) => updateElement(activePageIndex, selectedElement.id, { content: e.target.value })}
                className="w-full text-xs p-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-blue"
              />
            </div>

            {/* Element Specific Font Family */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 flex items-center gap-1">
                <Type className="w-3.5 h-3.5 text-brand-blue" />
                Font Family
              </label>
              <select
                value={selectedElement.fontFamily || theme.fontFamily || 'Georgia'}
                onChange={(e) => updateElement(activePageIndex, selectedElement.id, { fontFamily: e.target.value })}
                className="w-full text-xs p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none font-medium cursor-pointer"
              >
                {FONT_OPTIONS.map(f => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Font Size ({selectedElement.fontSize || 14}px)
              </label>
              <input
                type="range"
                min={10}
                max={48}
                value={selectedElement.fontSize || 14}
                onChange={(e) => updateElement(activePageIndex, selectedElement.id, { fontSize: parseInt(e.target.value) })}
                className="w-full accent-brand-blue"
              />
            </div>

            {/* Text Formatting & Alignment */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Alignment & Style
              </label>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
                <button
                  onClick={() => updateElement(activePageIndex, selectedElement.id, { align: 'left' })}
                  className={`p-1.5 rounded flex-1 flex justify-center ${
                    selectedElement.align === 'left' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
                  }`}
                >
                  <AlignLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateElement(activePageIndex, selectedElement.id, { align: 'center' })}
                  className={`p-1.5 rounded flex-1 flex justify-center ${
                    selectedElement.align === 'center' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
                  }`}
                >
                  <AlignCenter className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => updateElement(activePageIndex, selectedElement.id, { align: 'right' })}
                  className={`p-1.5 rounded flex-1 flex justify-center ${
                    selectedElement.align === 'right' ? 'bg-white dark:bg-gray-700 shadow-sm' : ''
                  }`}
                >
                  <AlignRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() =>
                    updateElement(activePageIndex, selectedElement.id, {
                      fontWeight: selectedElement.fontWeight === 'bold' ? 'normal' : 'bold'
                    })
                  }
                  className={`p-1.5 rounded flex-1 flex justify-center ${
                    selectedElement.fontWeight === 'bold' ? 'bg-white dark:bg-gray-700 shadow-sm text-brand-blue font-bold' : ''
                  }`}
                >
                  <Bold className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Text Color Picker */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedElement.color || '#1A1A1A'}
                  onChange={(e) => updateElement(activePageIndex, selectedElement.id, { color: e.target.value })}
                  className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                />
                <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                  {selectedElement.color || '#1A1A1A'}
                </span>
              </div>
            </div>

            {/* Delete Element Button */}
            <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => deleteElement(activePageIndex, selectedElement.id)}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-lg text-xs font-semibold hover:bg-red-100 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Element
              </button>
            </div>

          </div>
        )
      ) : (
        /* Global Document Theme Controls */
        <div className="space-y-4">
          
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Primary Theme Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.primaryColor || '#2B4C7E'}
                onChange={(e) => updateTheme({ primaryColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {theme.primaryColor || '#2B4C7E'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Accent Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.accentColor || '#C1663E'}
                onChange={(e) => updateTheme({ accentColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {theme.accentColor || '#C1663E'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.backgroundColor || '#FAFAF8'}
                onChange={(e) => updateTheme({ backgroundColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {theme.backgroundColor || '#FAFAF8'}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Page Border Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={theme.borderColor || theme.primaryColor || '#1E5B3F'}
                onChange={(e) => updateTheme({ borderColor: e.target.value })}
                className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
              />
              <span className="text-xs font-mono text-gray-600 dark:text-gray-400">
                {theme.borderColor || theme.primaryColor || '#1E5B3F'}
              </span>
            </div>
          </div>

        </div>
      )}

      {/* AI Studio Tools Section */}
      <div className="pt-4 border-t space-y-2.5" style={{ borderColor: 'var(--border)' }}>
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
          <Wand2 className="w-3.5 h-3.5" style={{ color: 'var(--primary)' }} />
          AI Studio Tools
        </div>

        <div className="space-y-2">
          <button
            onClick={onOpenMediaModal}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[12px] font-bold transition-all border text-left shadow-sm hover:opacity-90"
            style={{
              backgroundColor: 'var(--accent-soft)',
              borderColor: 'var(--primary)',
              color: 'var(--primary)',
            }}
          >
            <span className="flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Insert Media / Image
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenAiSectionModal}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors border text-left"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 fill-current text-emerald-500" />
              AI Add Section
            </span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onOpenPlaceholderModal}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors border text-left"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
          >
            <span className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" style={{ color: 'var(--primary)' }} />
              Fill Student & School Info
            </span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </button>

          <button
            onClick={onOpenAiModal}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors border text-left"
            style={{
              backgroundColor: 'var(--surface-2)',
              borderColor: 'var(--border)',
              color: 'var(--text-primary)',
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              AI Rewrite & Polish
            </span>
            <ChevronRight className="w-3.5 h-3.5" style={{ color: 'var(--text-muted)' }} />
          </button>
        </div>
      </div>

    </aside>
  );
}
