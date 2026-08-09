import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  ArrowLeft, Save, Download, Plus, Sparkles, Edit3, CheckCircle2,
  Circle, Layers, FileText, ChevronLeft, ChevronRight, ZoomIn, ZoomOut,
  Palette, Trash2, Copy, Eye, Sliders, Wand2, FilePlus, FastForward, Type,
  GripVertical
} from 'lucide-react';
import api from '../lib/api.js';
import NotesBlockRenderer from '../components/notes/NotesBlockRenderer.jsx';
import AiAddNotesSectionModal from '../components/notes/AiAddNotesSectionModal.jsx';
import AiGenerateFullPageModal from '../components/notes/AiGenerateFullPageModal.jsx';
import AiSmartContinueModal from '../components/notes/AiSmartContinueModal.jsx';
import { printDocumentPages } from '../lib/pdfPrint.js';

export default function NotesEditorPage() {
  const { docId } = useParams();
  const navigate = useNavigate();

  const [document, setDocument] = useState(null);
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState('');
  const [editingPageTitleIdx, setEditingPageTitleIdx] = useState(null);
  const [pageTitleInput, setPageTitleInput] = useState('');
  const [zoom, setZoom] = useState(100);
  const [isInspectorOpen, setIsInspectorOpen] = useState(true);
  const [isAiSectionModalOpen, setIsAiSectionModalOpen] = useState(false);
  const [isAiPageModalOpen, setIsAiPageModalOpen] = useState(false);
  const [isSmartContinueModalOpen, setIsSmartContinueModalOpen] = useState(false);
  const [draggedPageIdx, setDraggedPageIdx] = useState(null);

  const { data: docData, isLoading } = useQuery({
    queryKey: ['document', docId],
    queryFn: async () => {
      const res = await api.get(`/documents/${docId}`);
      return res.data.document;
    },
    enabled: !!docId,
    onError: () => {
      toast.error('Failed to load handwritten notes');
      navigate('/dashboard');
    }
  });

  useEffect(() => {
    if (docData && !document) {
      const content = docData.contentJson || {};
      if (content.blocks && (!content.pages || content.pages.length === 0)) {
        content.pages = [{ id: 'page_1', title: 'Page 1: Overview', blocks: content.blocks }];
        delete content.blocks;
      }
      if (!content.pages || content.pages.length === 0) {
        content.pages = [{ id: 'page_1', title: 'Page 1', blocks: [] }];
      }
      setDocument({ ...docData, contentJson: content });
    }
  }, [docData]);

  // Debounced Auto-save
  useEffect(() => {
    if (!isDirty || !document?.id) return;
    const timer = setTimeout(async () => {
      try {
        await api.put(`/documents/${document.id}`, {
          title: document.title,
          contentJson: document.contentJson,
        });
        setIsDirty(false);
      } catch (e) {
        console.error('[Notes AutoSave Error]', e);
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [document, isDirty]);

  const handleManualSave = async () => {
    if (!document?.id) return;
    setIsSaving(true);
    try {
      await api.put(`/documents/${document.id}`, {
        title: document.title,
        contentJson: document.contentJson,
      });
      setIsDirty(false);
      toast.success('Notes saved successfully!');
    } catch (e) {
      console.error('[Manual Save Error]', e);
      toast.error('Failed to save notes');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !document) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--bg-page)' }}>
        <div className="flex items-center gap-3 font-bold text-emerald-600">
          <Sparkles className="w-6 h-6 animate-spin" />
          <span>Loading Handwritten Notes Studio...</span>
        </div>
      </div>
    );
  }

  const contentJson = document.contentJson || {};
  const styleConfig = contentJson.styleConfig || {};
  const pages = contentJson.pages || [{ id: 'page_1', title: 'Page 1', blocks: [] }];
  const activePage = pages[activePageIndex] || pages[0];
  const activeBlocks = activePage?.blocks || [];

  const updateStyleConfig = (newConfig) => {
    const updated = {
      ...document,
      contentJson: {
        ...contentJson,
        styleConfig: { ...styleConfig, ...newConfig }
      }
    };
    setDocument(updated);
    setIsDirty(true);
  };

  const updateActivePageBlocks = (newBlocks) => {
    const newPages = [...pages];
    newPages[activePageIndex] = { ...activePage, blocks: newBlocks };
    setDocument({
      ...document,
      contentJson: { ...contentJson, pages: newPages }
    });
    setIsDirty(true);
  };

  const updateBlock = (blockIdx, newBlock) => {
    const newBlocks = [...activeBlocks];
    newBlocks[blockIdx] = newBlock;
    updateActivePageBlocks(newBlocks);
  };

  const moveBlock = (blockIdx, direction) => {
    const targetIdx = blockIdx + direction;
    if (targetIdx < 0 || targetIdx >= activeBlocks.length) return;
    const newBlocks = [...activeBlocks];
    const [moved] = newBlocks.splice(blockIdx, 1);
    newBlocks.splice(targetIdx, 0, moved);
    updateActivePageBlocks(newBlocks);
  };

  const moveBlockToPage = (blockIdx, targetPageIdx) => {
    if (targetPageIdx === activePageIndex) return;
    const blockToMove = activeBlocks[blockIdx];

    const newPages = [...pages];
    newPages[activePageIndex] = {
      ...activePage,
      blocks: activePage.blocks.filter((_, idx) => idx !== blockIdx)
    };

    if (!newPages[targetPageIdx]) {
      newPages[targetPageIdx] = {
        id: `page_${Date.now()}`,
        title: `Page ${targetPageIdx + 1}`,
        blocks: [blockToMove]
      };
    } else {
      newPages[targetPageIdx] = {
        ...newPages[targetPageIdx],
        blocks: [...(newPages[targetPageIdx].blocks || []), blockToMove]
      };
    }

    setDocument({ ...document, contentJson: { ...contentJson, pages: newPages } });
    setIsDirty(true);
    toast.success(`Moved block to Page ${targetPageIdx + 1}`);
  };

  const deleteBlock = (blockIdx) => {
    const newBlocks = activeBlocks.filter((_, idx) => idx !== blockIdx);
    updateActivePageBlocks(newBlocks);
    toast.success('Block removed');
  };

  const addBlock = (type) => {
    let newBlock = { type: 'bullet_list', heading: 'New Section', items: ['Point 1', 'Point 2'] };
    if (type === 'freeform_text') newBlock = { type: 'freeform_text', text: 'Write handwritten text note here...' };
    if (type === 'banner_title') newBlock = { type: 'banner_title', text: 'SECTION TITLE', highlightColor: '#FFF176' };
    if (type === 'definition_box') newBlock = { type: 'definition_box', label: 'Term', text: 'Definition text...', highlightColor: '#B2DFDB' };
    if (type === 'comparison_table') newBlock = { type: 'comparison_table', heading: 'Comparison', columns: ['Property', 'Type A', 'Type B'], rows: [['Feature 1', 'Val 1', 'Val 2']] };
    if (type === 'side_annotation') newBlock = { type: 'side_annotation', text: 'Exam Tip or Formula Note' };
    if (type === 'qa_section') newBlock = { type: 'qa_section', items: [{ question: 'Sample Question?', answer: 'Sample Answer...', source: 'NCERT' }] };
    if (type === 'hierarchy_diagram') newBlock = { type: 'hierarchy_diagram', root: 'Root Concept', orientation: 'horizontal', scale: 100, children: [{ label: 'Branch A', children: ['Sub 1', 'Sub 2'] }, { label: 'Branch B', children: ['Sub 3'] }] };
    if (type === 'formula_box') newBlock = { type: 'formula_box', title: 'Key Formula', formula: 'F = m × a', desc: 'Where F is force, m is mass, and a is acceleration.' };
    if (type === 'checklist_summary') newBlock = { type: 'checklist_summary', heading: 'Revision Checklist', items: ['Key Concept A', 'Key Concept B', 'Key Concept C'] };

    updateActivePageBlocks([...activeBlocks, newBlock]);
    toast.success(`Added ${type.replace('_', ' ')} block`);
  };

  const handleAddAiBlocks = (newBlocks) => {
    updateActivePageBlocks([...activeBlocks, ...newBlocks]);
  };

  const handleAddFullPage = (newPage) => {
    const newPages = [...pages, newPage];
    setDocument({ ...document, contentJson: { ...contentJson, pages: newPages } });
    setActivePageIndex(newPages.length - 1);
    setIsDirty(true);
  };

  const handleAppendPages = (continuationPages) => {
    const startIdx = pages.length;
    const newPages = [...pages, ...continuationPages];
    setDocument({ ...document, contentJson: { ...contentJson, pages: newPages } });
    setActivePageIndex(startIdx);
    setIsDirty(true);
  };

  const handleReorderPages = (sourceIdx, targetIdx) => {
    if (sourceIdx === targetIdx || sourceIdx < 0 || targetIdx < 0 || targetIdx >= pages.length) return;
    const newPages = [...pages];
    const [moved] = newPages.splice(sourceIdx, 1);
    newPages.splice(targetIdx, 0, moved);

    setDocument({ ...document, contentJson: { ...contentJson, pages: newPages } });
    setActivePageIndex(targetIdx);
    setIsDirty(true);
    toast.success('Pages reordered!');
  };

  const handleRegenerateBlock = async (blockIdx) => {
    const targetBlock = activeBlocks[blockIdx];
    toast.info('Regenerating block with Gemini AI...');
    try {
      const res = await api.post('/notes/block/regenerate', {
        block: targetBlock,
        topic: document.title,
        styleConfig,
      });
      if (res.data.block) {
        updateBlock(blockIdx, res.data.block);
        toast.success('Block regenerated!');
      }
    } catch (e) {
      toast.error('Failed to regenerate block');
    }
  };

  // Page Operations
  const handleAddPage = () => {
    const newPage = {
      id: `page_${Date.now()}`,
      title: `Page ${pages.length + 1}`,
      blocks: [{ type: 'banner_title', text: `Page ${pages.length + 1} Section`, highlightColor: '#FFF176' }]
    };
    const newPages = [...pages, newPage];
    setDocument({ ...document, contentJson: { ...contentJson, pages: newPages } });
    setActivePageIndex(newPages.length - 1);
    setIsDirty(true);
    toast.success('New A4 page added!');
  };

  const handleDeletePage = (pageIdx) => {
    if (pages.length <= 1) {
      toast.error('Document must contain at least one page');
      return;
    }
    const newPages = pages.filter((_, idx) => idx !== pageIdx);
    setDocument({ ...document, contentJson: { ...contentJson, pages: newPages } });
    setActivePageIndex(Math.max(0, pageIdx - 1));
    setIsDirty(true);
    toast.success('Page deleted');
  };

  const handleSavePageTitle = (pageIdx) => {
    if (pageTitleInput.trim()) {
      const newPages = [...pages];
      newPages[pageIdx] = { ...newPages[pageIdx], title: pageTitleInput.trim() };
      setDocument({ ...document, contentJson: { ...contentJson, pages: newPages } });
      setIsDirty(true);
    }
    setEditingPageTitleIdx(null);
  };

  const handleSaveTitle = () => {
    if (titleInput.trim() && titleInput.trim() !== document.title) {
      setDocument({ ...document, title: titleInput.trim() });
      setIsDirty(true);
      toast.success('Title updated');
    }
    setIsEditingTitle(false);
  };

  const handlePrintPDF = () => {
    printDocumentPages(contentJson, document.title);
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden select-none" style={{ backgroundColor: 'var(--bg-page)', color: 'var(--text-primary)' }}>
      
      {/* Top Navbar Header */}
      <header className="h-14 border-b flex items-center justify-between px-4 z-30 flex-shrink-0" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
        
        {/* Left: Back + Title + Status */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="p-1.5 rounded-xl transition-colors hover:bg-gray-100 dark:hover:bg-gray-800"
            style={{ color: 'var(--text-muted)' }}
            title="Back to Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div className="w-px h-5 hidden sm:block" style={{ backgroundColor: 'var(--border)' }} />

          {isEditingTitle ? (
            <input
              type="text"
              autoFocus
              value={titleInput}
              onChange={e => setTitleInput(e.target.value)}
              onBlur={handleSaveTitle}
              onKeyDown={e => e.key === 'Enter' && handleSaveTitle()}
              className="text-[13px] font-bold px-2 py-0.5 rounded-lg border outline-none max-w-xs bg-white dark:bg-gray-800"
              style={{ borderColor: 'var(--primary)' }}
            />
          ) : (
            <button
              onClick={() => { setTitleInput(document.title); setIsEditingTitle(true); }}
              className="group flex items-center gap-1.5 text-[13px] sm:text-[14px] font-bold hover:bg-gray-100 dark:hover:bg-gray-800 px-2 py-1 rounded-lg transition-colors max-w-xs truncate"
              style={{ color: 'var(--text-primary)' }}
              title="Click to rename document"
            >
              <span className="truncate">{document.title}</span>
              <Edit3 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-gray-400" />
            </button>
          )}

          <span
            className="flex items-center gap-1 text-[10px] sm:text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={
              isDirty
                ? { backgroundColor: '#FEF3C7', color: '#92400E' }
                : { backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }
            }
          >
            {isDirty ? <Circle className="w-2 h-2 fill-current" /> : <CheckCircle2 className="w-3 h-3" />}
            {isDirty ? 'Unsaved' : 'Saved'}
          </span>
        </div>

        {/* Center: Controls Toolbar */}
        <div className="flex items-center gap-2">
          {/* Page Navigator Stepper */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-xl border text-[12px] font-semibold" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
            <button
              onClick={() => setActivePageIndex(prev => Math.max(0, prev - 1))}
              disabled={activePageIndex === 0}
              className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span>Page {activePageIndex + 1} of {pages.length}</span>
            <button
              onClick={() => setActivePageIndex(prev => Math.min(pages.length - 1, prev + 1))}
              disabled={activePageIndex === pages.length - 1}
              className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom controls */}
          <div className="hidden md:flex items-center gap-1 border-l pl-2" style={{ borderColor: 'var(--border)' }}>
            <button
              onClick={() => setZoom(prev => Math.max(60, prev - 10))}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="text-[11px] font-semibold w-10 text-center">{zoom}%</span>
            <button
              onClick={() => setZoom(prev => Math.min(150, prev + 10))}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Manual Save Button */}
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold rounded-xl border transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--primary)' }}
            title="Save Notes Manually"
          >
            <Save className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isSaving ? 'Saving...' : 'Save'}</span>
          </button>

          {/* Add Block Menu */}
          <select
            onChange={(e) => { if (e.target.value) { addBlock(e.target.value); e.target.value = ''; } }}
            className="text-[12px] font-semibold px-3 py-1.5 rounded-xl border outline-none cursor-pointer transition-all"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
          >
            <option value="">+ Add Block</option>
            <option value="freeform_text">Text / Freeform Note</option>
            <option value="banner_title">Banner Title</option>
            <option value="definition_box">Definition Box</option>
            <option value="bullet_list">Bullet List</option>
            <option value="comparison_table">Comparison Table</option>
            <option value="hierarchy_diagram">Classification Tree</option>
            <option value="formula_box">Formula / Equation Box</option>
            <option value="checklist_summary">Revision Checklist</option>
            <option value="side_annotation">Exam Tip / Formula</option>
            <option value="qa_section">Q&A Section</option>
          </select>

          <button
            onClick={() => setIsInspectorOpen(!isInspectorOpen)}
            className="p-2 rounded-xl border transition-colors"
            style={{ backgroundColor: isInspectorOpen ? 'var(--accent-soft)' : 'var(--surface-1)', borderColor: 'var(--border)' }}
            title="Inspector Panel"
          >
            <Sliders className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={handlePrintPDF}
            className="flex items-center gap-1.5 px-4 py-1.5 text-[12px] font-bold text-white rounded-xl shadow-sm transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Download className="w-3.5 h-3.5" />
            Print PDF
          </button>
        </div>

      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar: Drag and Drop Pages List */}
        <aside className="w-56 border-r p-3 overflow-y-auto space-y-2 flex-shrink-0" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pages ({pages.length})</span>
            <button
              onClick={handleAddPage}
              className="p-1 rounded-lg hover:bg-emerald-100 text-emerald-600 font-bold flex items-center gap-1 text-[11px]"
              title="Add Blank Page"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {pages.map((p, idx) => (
            <div
              key={p.id || idx}
              draggable
              onDragStart={(e) => {
                setDraggedPageIdx(idx);
                e.dataTransfer.setData('text/plain', idx);
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const sourceIdx = parseInt(e.dataTransfer.getData('text/plain'), 10);
                if (!isNaN(sourceIdx)) {
                  handleReorderPages(sourceIdx, idx);
                }
              }}
              onClick={() => setActivePageIndex(idx)}
              className={`group flex items-center justify-between p-2 rounded-xl border text-left cursor-grab active:cursor-grabbing transition-all ${
                activePageIndex === idx
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 font-bold text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'border-transparent hover:bg-gray-200 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <GripVertical className="w-3.5 h-3.5 text-gray-400 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity" />
                <span className="w-5 h-5 rounded-md bg-gray-200 dark:bg-gray-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </span>

                {editingPageTitleIdx === idx ? (
                  <input
                    type="text"
                    autoFocus
                    value={pageTitleInput}
                    onClick={e => e.stopPropagation()}
                    onChange={e => setPageTitleInput(e.target.value)}
                    onBlur={() => handleSavePageTitle(idx)}
                    onKeyDown={e => e.key === 'Enter' && handleSavePageTitle(idx)}
                    className="w-full text-[12px] font-bold px-1.5 py-0.5 rounded border outline-none bg-white dark:bg-gray-800"
                  />
                ) : (
                  <span
                    onDoubleClick={(e) => {
                      e.stopPropagation();
                      setEditingPageTitleIdx(idx);
                      setPageTitleInput(p.title || `Page ${idx + 1}`);
                    }}
                    className="text-[12px] truncate"
                    title="Double click to rename or drag to reorder"
                  >
                    {p.title || `Page ${idx + 1}`}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingPageTitleIdx(idx);
                    setPageTitleInput(p.title || `Page ${idx + 1}`);
                  }}
                  className="p-1 rounded hover:bg-gray-300 dark:hover:bg-gray-700 text-gray-500"
                  title="Rename Page"
                >
                  <Edit3 className="w-3 h-3" />
                </button>

                {pages.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeletePage(idx); }}
                    className="p-1 rounded hover:bg-red-100 text-red-500"
                    title="Delete Page"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </aside>

        {/* Center: A4 Page View */}
        <main className="flex-1 overflow-auto p-8 flex flex-col items-center justify-start bg-gray-200 dark:bg-gray-950">
          <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center', transition: 'transform 0.2s' }}>
            <NotesBlockRenderer
              blocks={activeBlocks}
              styleConfig={styleConfig}
              pageNumber={activePageIndex + 1}
              totalPages={pages.length}
              pageTitle={activePage?.title || document.title}
              pages={pages}
              onUpdateBlock={updateBlock}
              onRegenerateBlock={handleRegenerateBlock}
              onDeleteBlock={deleteBlock}
              onMoveBlock={moveBlock}
              onMoveBlockToPage={moveBlockToPage}
              isEditing={true}
            />
          </div>
        </main>

        {/* Right Inspector Panel (Contains AI Generation Tools & Style Controls) */}
        {isInspectorOpen && (
          <aside className="w-72 border-l p-4 overflow-y-auto space-y-6 flex-shrink-0 animate-in slide-in-from-right-5" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
            
            {/* Section 1: AI Generation & Continuation Tools */}
            <div className="p-3.5 rounded-2xl border bg-gradient-to-br from-emerald-50 to-indigo-50 dark:from-emerald-950/30 dark:to-indigo-950/30 space-y-2.5" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
                <Sparkles className="w-4 h-4 fill-current" />
                <span>AI Creation Tools</span>
              </div>

              <button
                onClick={() => setIsSmartContinueModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <FastForward className="w-4 h-4 fill-current" />
                <span>+ AI Smart Continue Notes</span>
              </button>

              <button
                onClick={() => setIsAiPageModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all"
              >
                <FilePlus className="w-4 h-4" />
                <span>+ AI Generate Full Page</span>
              </button>

              <button
                onClick={() => setIsAiSectionModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-100 border border-gray-300 dark:border-gray-700 font-bold text-xs text-gray-800 dark:text-gray-200 shadow-xs transition-all"
              >
                <Wand2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ AI Write Section</span>
              </button>
            </div>

            {/* Section 2: Handwriting Font & Size */}
            <div className="space-y-3">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-gray-400">
                Handwriting Font & Size
              </h3>
              
              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Font Family</label>
                <select
                  value={styleConfig.handFont || 'Kalam'}
                  onChange={(e) => updateStyleConfig({ handFont: e.target.value })}
                  className="w-full text-[13px] px-3 py-2 rounded-xl border outline-none font-semibold"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                >
                  <option value="Kalam">Kalam (Rounded Pen)</option>
                  <option value="Caveat">Caveat (Casual Marker)</option>
                  <option value="Patrick Hand">Patrick Hand (Clean Ink)</option>
                  <option value="Permanent Marker">Permanent Marker</option>
                  <option value="Shadows Into Light">Shadows Into Light</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-500 mb-1">Font Size</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={styleConfig.fontSize || 16}
                    onChange={(e) => updateStyleConfig({ fontSize: parseInt(e.target.value, 10) })}
                    className="flex-1 accent-emerald-600"
                  />
                  <span className="text-[12px] font-bold w-10 text-center">{styleConfig.fontSize || 16}px</span>
                </div>
              </div>
            </div>

            {/* Section 3: Paper Texture */}
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider mb-2 text-gray-400">
                Paper Texture
              </h3>
              <select
                value={styleConfig.paperType || 'ruled'}
                onChange={(e) => updateStyleConfig({ paperType: e.target.value })}
                className="w-full text-[13px] px-3 py-2 rounded-xl border outline-none font-semibold"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              >
                <option value="ruled">Ruled Lined Notebook</option>
                <option value="grid">Math / Science Grid</option>
                <option value="plain">Plain Blank Sheet</option>
              </select>
            </div>

            {/* Section 4: Paper Tint Color */}
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider mb-2 text-gray-400">
                Paper Tint Color
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'White', val: '#FFFFFF' },
                  { label: 'Cream', val: '#FFFDE7' },
                  { label: 'Mint', val: '#F0FDF4' },
                  { label: 'Ice Blue', val: '#F0F9FF' },
                ].map(c => (
                  <button
                    key={c.val}
                    onClick={() => updateStyleConfig({ paperColor: c.val })}
                    className={`p-2 rounded-xl border text-[12px] font-semibold text-center transition-all ${
                      styleConfig.paperColor === c.val ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: c.val, color: '#0F172A' }}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Section 5: Ink Pen Color */}
            <div>
              <h3 className="text-[12px] font-bold uppercase tracking-wider mb-2 text-gray-400">
                Ink Pen Color
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Navy', val: '#1E1B4B' },
                  { label: 'Dark Slate', val: '#0F172A' },
                  { label: 'Forest', val: '#064E3B' },
                ].map(c => (
                  <button
                    key={c.val}
                    onClick={() => updateStyleConfig({ inkColor: c.val })}
                    className={`h-8 rounded-xl border transition-all ${
                      styleConfig.inkColor === c.val ? 'ring-2 ring-emerald-500 border-emerald-500' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: c.val }}
                    title={c.label}
                  />
                ))}
              </div>
            </div>
          </aside>
        )}

      </div>

      {/* AI Add Section Modal */}
      <AiAddNotesSectionModal
        isOpen={isAiSectionModalOpen}
        onClose={() => setIsAiSectionModalOpen(false)}
        onAddBlocks={handleAddAiBlocks}
        docTitle={document.title}
      />

      {/* AI Generate Full Page Modal */}
      <AiGenerateFullPageModal
        isOpen={isAiPageModalOpen}
        onClose={() => setIsAiPageModalOpen(false)}
        onAddFullPage={handleAddFullPage}
        docTitle={document.title}
        pageCount={pages.length}
      />

      {/* AI Smart Continue Modal */}
      <AiSmartContinueModal
        isOpen={isSmartContinueModalOpen}
        onClose={() => setIsSmartContinueModalOpen(false)}
        onAppendPages={handleAppendPages}
        docTitle={document.title}
        existingPages={pages}
      />

    </div>
  );
}
