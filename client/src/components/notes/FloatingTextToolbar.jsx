import React, { useEffect, useState } from 'react';
import { Bold, Italic, Underline, Highlighter, Palette, Type } from 'lucide-react';

export default function FloatingTextToolbar() {
  const [position, setPosition] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  const [showFontSizePicker, setShowFontSizePicker] = useState(false);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        setPosition(null);
        setShowColorPicker(false);
        setShowHighlightPicker(false);
        setShowFontSizePicker(false);
        return;
      }

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) {
        setPosition(null);
        return;
      }

      let container = range.commonAncestorContainer;
      if (container.nodeType === Node.TEXT_NODE) container = container.parentNode;
      
      const isEditable = container && (container.isContentEditable || container.closest('[contenteditable="true"]'));
      if (!isEditable) {
        setPosition(null);
        return;
      }

      setPosition({
        top: Math.max(10, rect.top - 54) + window.scrollY,
        left: Math.max(20, rect.left + rect.width / 2) + window.scrollX,
      });
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    document.addEventListener('mouseup', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      document.removeEventListener('mouseup', handleSelectionChange);
    };
  }, []);

  if (!position) return null;

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const applyFontSize = (sizePx) => {
    // Standard execCommand fontSize uses 1-7. For exact px, wrap selection in span with inline style
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    span.style.fontSize = `${sizePx}px`;
    range.surroundContents(span);
    setShowFontSizePicker(false);
  };

  const HIGHLIGHT_COLORS = ['#FFF176', '#FFB6C1', '#B2DFDB', '#D1C4E9', '#FED7AA', 'transparent'];
  const INK_COLORS = ['#1E1B4B', '#0F172A', '#064E3B', '#B91C1C', '#6D28D9', '#0284C7'];
  const FONT_SIZES = [12, 14, 16, 18, 20, 24];

  return (
    <div
      className="fixed z-50 transform -translate-x-1/2 bg-gray-900 text-white border border-gray-700 shadow-2xl rounded-2xl p-1.5 flex items-center gap-1.5 animate-in fade-in zoom-in-95 select-none"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <button
        onClick={() => applyFormat('bold')}
        className="p-1.5 rounded-xl hover:bg-gray-800 transition-colors font-bold text-xs"
        title="Bold (Ctrl+B)"
      >
        <Bold className="w-4 h-4" />
      </button>

      <button
        onClick={() => applyFormat('italic')}
        className="p-1.5 rounded-xl hover:bg-gray-800 transition-colors text-xs"
        title="Italic (Ctrl+I)"
      >
        <Italic className="w-4 h-4" />
      </button>

      <button
        onClick={() => applyFormat('underline')}
        className="p-1.5 rounded-xl hover:bg-gray-800 transition-colors text-xs"
        title="Underline (Ctrl+U)"
      >
        <Underline className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-gray-700 mx-0.5" />

      {/* Font Size Picker */}
      <div className="relative">
        <button
          onClick={() => { setShowFontSizePicker(!showFontSizePicker); setShowColorPicker(false); setShowHighlightPicker(false); }}
          className="p-1.5 rounded-xl hover:bg-gray-800 text-sky-400 transition-colors flex items-center gap-1 text-xs font-semibold"
          title="Font Size"
        >
          <Type className="w-4 h-4" />
        </button>

        {showFontSizePicker && (
          <div className="absolute top-10 left-0 bg-gray-800 border border-gray-700 shadow-xl rounded-xl p-1.5 flex items-center gap-1 z-50">
            {FONT_SIZES.map((sz) => (
              <button
                key={sz}
                onClick={() => applyFontSize(sz)}
                className="px-2 py-1 rounded hover:bg-gray-700 text-xs font-bold transition-colors"
              >
                {sz}px
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Highlighter Picker */}
      <div className="relative">
        <button
          onClick={() => { setShowHighlightPicker(!showHighlightPicker); setShowColorPicker(false); setShowFontSizePicker(false); }}
          className="p-1.5 rounded-xl hover:bg-gray-800 text-yellow-300 transition-colors flex items-center gap-1"
          title="Highlight Marker"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        {showHighlightPicker && (
          <div className="absolute top-10 left-0 bg-gray-800 border border-gray-700 shadow-xl rounded-xl p-2 flex items-center gap-1.5 z-50">
            {HIGHLIGHT_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  applyFormat('hiliteColor', c);
                  setShowHighlightPicker(false);
                }}
                className="w-5 h-5 rounded-full border border-gray-600 transition-transform hover:scale-110"
                style={{ backgroundColor: c === 'transparent' ? '#374151' : c }}
                title={c === 'transparent' ? 'Clear Highlight' : 'Highlight'}
              />
            ))}
          </div>
        )}
      </div>

      {/* Ink Color Picker */}
      <div className="relative">
        <button
          onClick={() => { setShowColorPicker(!showColorPicker); setShowHighlightPicker(false); setShowFontSizePicker(false); }}
          className="p-1.5 rounded-xl hover:bg-gray-800 text-emerald-400 transition-colors"
          title="Text Color"
        >
          <Palette className="w-4 h-4" />
        </button>

        {showColorPicker && (
          <div className="absolute top-10 left-0 bg-gray-800 border border-gray-700 shadow-xl rounded-xl p-2 flex items-center gap-1.5 z-50">
            {INK_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => {
                  applyFormat('foreColor', c);
                  setShowColorPicker(false);
                }}
                className="w-5 h-5 rounded-full border border-gray-600 transition-transform hover:scale-110"
                style={{ backgroundColor: c }}
                title="Ink Color"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
