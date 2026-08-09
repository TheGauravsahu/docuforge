import React from 'react';
import { Sparkles, Trash2, ArrowUp, ArrowDown, Bookmark, HelpCircle, RotateCw, Type, CheckSquare, Zap, AlignLeft } from 'lucide-react';
import HierarchyDiagram from './HierarchyDiagram.jsx';
import FloatingTextToolbar from './FloatingTextToolbar.jsx';

export default function NotesBlockRenderer({
  blocks = [],
  styleConfig = {},
  pageNumber = 1,
  totalPages = 1,
  pageTitle = 'Study Sheet',
  pages = [],
  onUpdateBlock,
  onRegenerateBlock,
  onDeleteBlock,
  onMoveBlock,
  onMoveBlockToPage,
  isEditing = true,
}) {
  const globalHandFont = styleConfig.handFont || 'Kalam';
  const paperType = styleConfig.paperType || 'ruled';
  const paperColor = styleConfig.paperColor || '#FFFFFF';
  const inkColor = styleConfig.inkColor || '#1E1B4B';
  const globalFontSize = styleConfig.fontSize || 16;
  const highlightPalette = styleConfig.highlightPalette || ['#FFF176', '#FFB6C1', '#B2DFDB', '#D1C4E9'];

  const getFontFamily = (name) => {
    switch (name) {
      case 'Caveat': return "'Caveat', cursive, sans-serif";
      case 'Patrick Hand': return "'Patrick Hand', cursive, sans-serif";
      case 'Permanent Marker': return "'Permanent Marker', cursive, sans-serif";
      case 'Shadows Into Light': return "'Shadows Into Light', cursive, sans-serif";
      case 'Kalam':
      default:
        return "'Kalam', cursive, sans-serif";
    }
  };

  const getPaperStyle = () => {
    if (paperType === 'ruled') {
      return {
        backgroundColor: paperColor,
        backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.28) 1px, transparent 1px)',
        backgroundSize: '100% 30px',
        lineHeight: '30px',
      };
    } else if (paperType === 'grid') {
      return {
        backgroundColor: paperColor,
        backgroundImage: 'linear-gradient(rgba(148, 163, 184, 0.28) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.28) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      };
    }
    return { backgroundColor: paperColor };
  };

  return (
    <div
      className="mx-auto my-6 rounded-2xl shadow-2xl border relative transition-all overflow-hidden flex flex-col justify-between"
      style={{
        width: 794,
        minHeight: 1123,
        ...getPaperStyle(),
        borderColor: '#CBD5E1',
        fontFamily: getFontFamily(globalHandFont),
        color: inkColor,
        fontSize: `${globalFontSize}px`,
        padding: '36px 44px',
      }}
    >
      {/* Floating Rich Text Selection Formatting Bar */}
      <FloatingTextToolbar />

      {/* Red Vertical Margin Line for Ruled Paper */}
      {paperType === 'ruled' && (
        <div
          className="absolute top-0 bottom-0 left-14 w-0.5 pointer-events-none opacity-70"
          style={{ backgroundColor: '#EF4444' }}
        />
      )}

      {/* Top Notebook Header Line */}
      <div className="relative z-10 flex items-center justify-between pb-3 border-b-2 border-slate-300 dark:border-slate-700 text-xs font-semibold tracking-wide flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="opacity-60">DATE:</span>
          <span className="border-b border-slate-400 px-2">{new Date().toLocaleDateString()}</span>
        </div>
        <div className="text-center font-bold text-sm truncate max-w-xs" style={{ color: inkColor }}>
          {pageTitle}
        </div>
        <div className="flex items-center gap-2">
          <span className="opacity-60">PAGE:</span>
          <span className="border-b border-slate-400 px-2 font-bold">{pageNumber} / {totalPages}</span>
        </div>
      </div>

      {/* Content Block Area */}
      <div className="flex-1 space-y-4 relative z-10 py-3 pl-4 sm:pl-6">
        {blocks.map((block, idx) => {
          const blockFont = block.font || globalHandFont;
          const blockFontSize = block.fontSize || globalFontSize;

          return (
            <div
              key={block.id || idx}
              className="group relative rounded-xl transition-all hover:ring-2 hover:ring-emerald-400/40 p-2"
              style={{ fontFamily: getFontFamily(blockFont), fontSize: `${blockFontSize}px` }}
            >
              
              {/* Block Controls Overlay */}
              {isEditing && (
                <div className="absolute right-2 -top-4 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white shadow-xl rounded-xl p-1 flex items-center gap-1.5 z-30 text-xs">
                  
                  {/* Per-Block Font Selector */}
                  <select
                    value={blockFont}
                    onChange={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, font: e.target.value })}
                    className="bg-gray-800 text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg border border-gray-700 outline-none"
                    title="Change Block Font"
                  >
                    <option value="Kalam">Kalam</option>
                    <option value="Caveat">Caveat</option>
                    <option value="Patrick Hand">Patrick Hand</option>
                    <option value="Permanent Marker">Permanent Marker</option>
                    <option value="Shadows Into Light">Shadows</option>
                  </select>

                  {/* Per-Block Font Size Stepper */}
                  <select
                    value={blockFontSize}
                    onChange={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, fontSize: parseInt(e.target.value, 10) })}
                    className="bg-gray-800 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-lg border border-gray-700 outline-none"
                    title="Block Font Size"
                  >
                    <option value="12">12px</option>
                    <option value="14">14px</option>
                    <option value="16">16px</option>
                    <option value="18">18px</option>
                    <option value="20">20px</option>
                    <option value="24">24px</option>
                    <option value="28">28px</option>
                  </select>

                  {/* Diagram Controls */}
                  {block.type === 'hierarchy_diagram' && (
                    <>
                      <button
                        onClick={() =>
                          onUpdateBlock &&
                          onUpdateBlock(idx, {
                            ...block,
                            orientation: block.orientation === 'horizontal' ? 'vertical' : 'horizontal'
                          })
                        }
                        className="p-1 rounded hover:bg-gray-800 text-yellow-300 flex items-center gap-1"
                        title="Toggle Diagram Orientation (Horizontal / Vertical)"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span className="text-[10px] uppercase font-bold">{block.orientation === 'horizontal' ? 'H' : 'V'}</span>
                      </button>

                      <select
                        value={block.scale || 100}
                        onChange={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, scale: parseInt(e.target.value, 10) })}
                        className="bg-gray-800 text-amber-300 text-[10px] font-semibold px-1 py-0.5 rounded-lg border border-gray-700 outline-none"
                        title="Block Scale / Width"
                      >
                        <option value="50">50%</option>
                        <option value="65">65%</option>
                        <option value="75">75%</option>
                        <option value="90">90%</option>
                        <option value="100">100%</option>
                        <option value="125">125%</option>
                        <option value="150">150%</option>
                      </select>
                    </>
                  )}

                  {/* Move to Page Selector */}
                  {onMoveBlockToPage && pages.length > 1 && (
                    <select
                      value=""
                      onChange={(e) => {
                        const targetIdx = parseInt(e.target.value, 10);
                        if (!isNaN(targetIdx)) {
                          onMoveBlockToPage(idx, targetIdx);
                          e.target.value = '';
                        }
                      }}
                      className="bg-gray-800 text-emerald-400 text-[10px] font-semibold px-1.5 py-0.5 rounded-lg border border-gray-700 outline-none cursor-pointer"
                      title="Move Block to Page"
                    >
                      <option value="" disabled>Move to Page...</option>
                      {pages.map((p, pIdx) => (
                        <option key={pIdx} value={pIdx} disabled={pIdx === pageNumber - 1}>
                          {pIdx === pageNumber - 1 ? `Page ${pIdx + 1} (Current)` : `Page ${pIdx + 1}`}
                        </option>
                      ))}
                    </select>
                  )}

                  {onMoveBlock && (
                    <>
                      <button
                        onClick={() => onMoveBlock(idx, -1)}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-gray-800 text-gray-300 disabled:opacity-30"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onMoveBlock(idx, 1)}
                        disabled={idx === blocks.length - 1}
                        className="p-1 rounded hover:bg-gray-800 text-gray-300 disabled:opacity-30"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {onRegenerateBlock && (
                    <button
                      onClick={() => onRegenerateBlock(idx)}
                      className="p-1 rounded hover:bg-emerald-950 text-emerald-400"
                      title="AI Regenerate Block"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-current" />
                    </button>
                  )}

                  {onDeleteBlock && (
                    <button
                      onClick={() => onDeleteBlock(idx)}
                      className="p-1 rounded hover:bg-red-900 text-red-400"
                      title="Delete Block"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}

              {/* Freeform Text Block */}
              {block.type === 'freeform_text' && (
                <div className="my-2">
                  <p
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, text: e.target.innerText })}
                    className="text-base leading-relaxed outline-none"
                    style={{ fontFamily: getFontFamily(blockFont), fontSize: `${blockFontSize}px` }}
                  >
                    {block.text || block.content || 'Click to write handwritten text note...'}
                  </p>
                </div>
              )}

              {/* Banner Title */}
              {block.type === 'banner_title' && (
                <div className="my-2 text-center">
                  <div
                    className="inline-block px-8 py-2.5 rounded-2xl shadow-sm border-2 transform -rotate-1 transition-transform"
                    style={{
                      backgroundColor: block.highlightColor || highlightPalette[0],
                      borderColor: inkColor,
                      color: '#0F172A',
                    }}
                  >
                    <h1
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, text: e.target.innerText })}
                      className="text-xl font-extrabold uppercase tracking-wide outline-none"
                      style={{ fontFamily: getFontFamily(blockFont) }}
                    >
                      {block.text || block.title || block.heading || 'Title'}
                    </h1>
                  </div>
                </div>
              )}

              {/* Definition Box */}
              {block.type === 'definition_box' && (
                <div
                  className="p-3.5 rounded-2xl border-2 shadow-sm my-2 transform rotate-0.5"
                  style={{
                    backgroundColor: block.highlightColor || highlightPalette[2],
                    borderColor: inkColor,
                  }}
                >
                  <div className="flex items-center gap-2 mb-1 font-bold text-sm border-b pb-1" style={{ borderColor: `${inkColor}40` }}>
                    <Bookmark className="w-4 h-4 fill-current" />
                    <span
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, label: e.target.innerText })}
                      className="outline-none"
                    >
                      {block.label || block.title || block.term || 'Key Definition'}
                    </span>
                  </div>
                  <p
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, text: e.target.innerText, definition: e.target.innerText })}
                    className="text-sm leading-relaxed outline-none"
                  >
                    {block.text || block.definition || block.content || block.desc || block.explanation || 'Definition concept details...'}
                  </p>
                </div>
              )}

              {/* Bullet List */}
              {block.type === 'bullet_list' && (
                <div className="my-2 space-y-1">
                  {(block.heading || block.title) && (
                    <h3
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, heading: e.target.innerText })}
                      className="font-bold text-base mb-1 outline-none underline underline-offset-4"
                    >
                      {block.heading || block.title}
                    </h3>
                  )}
                  <ul className="space-y-1 pl-4">
                    {(block.items || block.bullets || block.points || []).map((item, iIdx) => (
                      <li key={iIdx} className="flex items-start gap-2 text-sm">
                        <span className="text-emerald-600 font-bold mt-0.5">•</span>
                        <span
                          contentEditable={isEditing}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newItems = [...(block.items || block.bullets || block.points)];
                            newItems[iIdx] = e.target.innerText;
                            onUpdateBlock && onUpdateBlock(idx, { ...block, items: newItems });
                          }}
                          className="flex-1 outline-none"
                        >
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                  {(block.sideNote || block.note) && (
                    <div className="mt-1 text-right text-xs font-semibold opacity-80 italic">
                      ✍️ Note: {block.sideNote || block.note}
                    </div>
                  )}
                </div>
              )}

              {/* Comparison Table */}
              {block.type === 'comparison_table' && (
                <div className="my-3 overflow-x-auto">
                  {(block.heading || block.title) && <h3 className="font-bold text-base mb-1">{block.heading || block.title}</h3>}
                  <table className="w-full border-collapse border-2 shadow-sm rounded-xl overflow-hidden" style={{ borderColor: inkColor }}>
                    <thead>
                      <tr style={{ backgroundColor: highlightPalette[0] }}>
                        {(block.columns || block.cols || block.headers || []).map((col, cIdx) => (
                          <th
                            key={cIdx}
                            contentEditable={isEditing}
                            suppressContentEditableWarning
                            onBlur={(e) => {
                              const newCols = [...(block.columns || block.cols || block.headers)];
                              newCols[cIdx] = e.target.innerText;
                              onUpdateBlock && onUpdateBlock(idx, { ...block, columns: newCols });
                            }}
                            className="p-2 border-2 text-left font-bold text-sm outline-none"
                            style={{ borderColor: inkColor }}
                          >
                            {col}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(block.rows || block.data || []).map((row, rIdx) => (
                        <tr key={rIdx} className={rIdx % 2 === 0 ? 'bg-white/60 dark:bg-black/10' : ''}>
                          {row.map((cell, cellIdx) => (
                            <td
                              key={cellIdx}
                              contentEditable={isEditing}
                              suppressContentEditableWarning
                              onBlur={(e) => {
                                const newRows = [...(block.rows || block.data)];
                                newRows[rIdx][cellIdx] = e.target.innerText;
                                onUpdateBlock && onUpdateBlock(idx, { ...block, rows: newRows });
                              }}
                              className="p-2 border-2 text-xs sm:text-sm outline-none"
                              style={{ borderColor: inkColor }}
                            >
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Hierarchy Diagram */}
              {block.type === 'hierarchy_diagram' && (
                <div
                  className="my-2 transition-all mx-auto"
                  style={{
                    width: block.scale ? `${block.scale}%` : '100%',
                  }}
                >
                  <HierarchyDiagram
                    root={block.root || block.title || 'Classification'}
                    children={block.children || block.branches || []}
                    inkColor={inkColor}
                    handFont={blockFont}
                    orientation={block.orientation || 'horizontal'}
                    fontSize={blockFontSize}
                  />
                </div>
              )}

              {/* Formula Box */}
              {block.type === 'formula_box' && (
                <div
                  className="my-3 p-3 rounded-2xl border-2 text-center shadow-sm"
                  style={{ backgroundColor: '#FEF3C7', borderColor: inkColor }}
                >
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-800 mb-1">
                    <Zap className="w-3.5 h-3.5" />
                    <span>{block.title || block.heading || 'Formula / Principle'}</span>
                  </div>
                  <div
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, formula: e.target.innerText })}
                    className="text-xl font-extrabold my-1 outline-none text-indigo-950"
                  >
                    {block.formula || block.equation || 'F = m × a'}
                  </div>
                  <p
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, desc: e.target.innerText })}
                    className="text-xs italic opacity-85 outline-none"
                  >
                    {block.desc || block.description || ''}
                  </p>
                </div>
              )}

              {/* Checklist Summary */}
              {block.type === 'checklist_summary' && (
                <div
                  className="my-3 p-3 rounded-2xl border-2 shadow-sm space-y-1.5"
                  style={{ backgroundColor: '#ECFDF5', borderColor: '#10B981' }}
                >
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm border-b border-emerald-200 pb-1">
                    <CheckSquare className="w-4 h-4" />
                    <span>{block.heading || block.title || 'Quick Revision Checklist'}</span>
                  </div>
                  <div className="space-y-1">
                    {(block.items || block.points || []).map((chk, cIdx) => (
                      <div key={cIdx} className="flex items-center gap-2 text-sm">
                        <span className="w-4 h-4 rounded border border-emerald-600 bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-xs">✓</span>
                        <span
                          contentEditable={isEditing}
                          suppressContentEditableWarning
                          onBlur={(e) => {
                            const newItems = [...(block.items || block.points)];
                            newItems[cIdx] = e.target.innerText;
                            onUpdateBlock && onUpdateBlock(idx, { ...block, items: newItems });
                          }}
                          className="flex-1 outline-none"
                        >
                          {chk}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Q&A Section */}
              {block.type === 'qa_section' && (
                <div className="my-3 p-3.5 rounded-2xl border-2 bg-amber-50/60 dark:bg-amber-950/20 shadow-sm space-y-2" style={{ borderColor: inkColor }}>
                  <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-sm border-b pb-1">
                    <HelpCircle className="w-4 h-4" />
                    <span>{block.title || 'NCERT & Board Revision Questions'}</span>
                  </div>
                  {(block.items || block.questions || []).map((qa, qIdx) => {
                    const questionText = typeof qa === 'string' ? qa : (qa.question || qa.q || qa.title || '');
                    const answerText = typeof qa === 'string' ? '' : (qa.answer || qa.ans || qa.a || qa.content || '');

                    return (
                      <div key={qIdx} className="space-y-0.5 text-sm">
                        <p className="font-bold text-emerald-700 dark:text-emerald-400">
                          Q{qIdx + 1}: {questionText || 'Question?'}
                        </p>
                        <p className="pl-3 opacity-90 leading-relaxed">
                          <strong className="text-indigo-600 dark:text-indigo-400">Ans:</strong> {answerText || 'Answer details...'}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Side Annotation */}
              {block.type === 'side_annotation' && (
                <div className="my-2 p-2 rounded-xl border-l-4 bg-emerald-50/90 dark:bg-emerald-950/40 text-xs font-semibold italic flex items-center gap-2" style={{ borderColor: '#10B981' }}>
                  <span>💡 Exam Tip:</span>
                  <span
                    contentEditable={isEditing}
                    suppressContentEditableWarning
                    onBlur={(e) => onUpdateBlock && onUpdateBlock(idx, { ...block, text: e.target.innerText })}
                    className="outline-none"
                  >
                    {block.text || block.note || block.tip || block.content || ''}
                  </span>
                </div>
              )}

            </div>
          );
        })}
      </div>

      {/* Notebook Footer */}
      <div className="relative z-10 pt-2 border-t border-slate-300 dark:border-slate-700 flex items-center justify-between text-[11px] font-semibold opacity-60 flex-shrink-0">
        <span>DocuForge AI Handwritten Notes</span>
        <span>CONFIDENTIAL / STUDY REVISION</span>
      </div>
    </div>
  );
}
