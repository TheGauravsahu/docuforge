import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layers, FileText, Sliders } from 'lucide-react';
import { toast } from 'sonner';
import EditorToolbar from '../components/editor/EditorToolbar.jsx';
import PageThumbnailsSidebar from '../components/editor/PageThumbnailsSidebar.jsx';
import FabricCanvas from '../components/editor/FabricCanvas.jsx';
import InspectorPanel from '../components/editor/InspectorPanel.jsx';
import PlaceholderFormModal from '../components/editor/PlaceholderFormModal.jsx';
import ExportModal from '../components/editor/ExportModal.jsx';
import AiGeneratorModal from '../components/editor/AiGeneratorModal.jsx';
import AiSectionWriterModal from '../components/editor/AiSectionWriterModal.jsx';
import MediaModal from '../components/editor/MediaModal.jsx';
import { useEditorStore } from '../store/useEditorStore.js';
import api from '../lib/api.js';

export default function EditorPage() {
  const { docId } = useParams();
  const navigate = useNavigate();
  const { document, setDocument, isDirty, markSaved } = useEditorStore();

  const [isPlaceholderModalOpen, setIsPlaceholderModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isAiSectionModalOpen, setIsAiSectionModalOpen] = useState(false);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState('canvas'); // 'pages' | 'canvas' | 'inspector'

  const { data: docData, isLoading } = useQuery({
    queryKey: ['document', docId],
    queryFn: async () => {
      const res = await api.get(`/documents/${docId}`);
      return res.data.document;
    },
    enabled: !!docId,
    staleTime: 1000 * 60 * 5,
    onError: () => {
      toast.error('Failed to load document. Returning to dashboard.');
      navigate('/dashboard');
    }
  });

  useEffect(() => {
    if (docData && (!document || document.id !== docData.id)) {
      setDocument(docData);
    }
  }, [docData]);

  // Debounced auto-save effect
  useEffect(() => {
    if (!isDirty || !document?.id) return;

    const timer = setTimeout(async () => {
      try {
        await api.put(`/documents/${document.id}`, {
          title: document.title,
          contentJson: document.contentJson,
        });
        markSaved();
      } catch (err) {
        console.error('[AutoSave] Failed:', err);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [document, isDirty]);

  if (isLoading || !document) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-4"
        style={{ backgroundColor: 'var(--bg-page)' }}
      >
        <div className="relative">
          <div
            className="w-14 h-14 rounded-full border-4 animate-spin"
            style={{
              borderColor: 'var(--accent-soft)',
              borderTopColor: 'var(--primary)',
            }}
          />
          <div
            className="absolute inset-0 rounded-full blur-md opacity-30"
            style={{ backgroundColor: 'var(--primary)' }}
          />
        </div>
        <div className="text-center space-y-1">
          <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            Loading document studio...
          </p>
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            Preparing your visual editor
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="h-screen flex flex-col overflow-hidden select-none"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Top toolbar */}
      <EditorToolbar
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onOpenPlaceholderModal={() => setIsPlaceholderModalOpen(true)}
        onOpenAiModal={() => setIsAiModalOpen(true)}
        onOpenAiSectionModal={() => setIsAiSectionModalOpen(true)}
        onOpenMediaModal={() => setIsMediaModalOpen(true)}
      />

      {/* Mobile Tab Switcher */}
      <div className="lg:hidden flex items-center justify-around border-b px-2 py-1.5 z-10 flex-shrink-0" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
        <button
          onClick={() => setMobileTab('pages')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${mobileTab === 'pages' ? 'bg-emerald-500/10 text-emerald-500' : 'text-gray-400'}`}
        >
          <Layers className="w-3.5 h-3.5" /> Pages
        </button>
        <button
          onClick={() => setMobileTab('canvas')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${mobileTab === 'canvas' ? 'bg-emerald-500/10 text-emerald-500' : 'text-gray-400'}`}
        >
          <FileText className="w-3.5 h-3.5" /> Canvas
        </button>
        <button
          onClick={() => setMobileTab('inspector')}
          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${mobileTab === 'inspector' ? 'bg-emerald-500/10 text-emerald-500' : 'text-gray-400'}`}
        >
          <Sliders className="w-3.5 h-3.5" /> Inspector
        </button>
      </div>

      {/* Main studio body */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: page thumbnails */}
        <div className={`h-full ${mobileTab === 'pages' ? 'block w-full' : 'hidden'} lg:block lg:w-auto flex-shrink-0`}>
          <PageThumbnailsSidebar
            onOpenAiSectionWriter={() => setIsAiSectionModalOpen(true)}
          />
        </div>

        {/* Center: canvas */}
        <div
          className={`flex-1 overflow-auto flex items-start justify-center p-3 sm:p-8 ${mobileTab === 'canvas' ? 'flex w-full' : 'hidden lg:flex'}`}
          style={{ backgroundColor: 'var(--surface-2)' }}
        >
          <FabricCanvas />
        </div>

        {/* Right: inspector */}
        <div className={`h-full ${mobileTab === 'inspector' ? 'block w-full' : 'hidden'} lg:block lg:w-auto flex-shrink-0`}>
          <InspectorPanel
            onOpenPlaceholderModal={() => setIsPlaceholderModalOpen(true)}
            onOpenAiModal={() => setIsAiModalOpen(true)}
            onOpenAiSectionModal={() => setIsAiSectionModalOpen(true)}
            onOpenMediaModal={() => setIsMediaModalOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <PlaceholderFormModal
        isOpen={isPlaceholderModalOpen}
        onClose={() => setIsPlaceholderModalOpen(false)}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
      />
      <AiGeneratorModal
        isOpen={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
      />
      <AiSectionWriterModal
        isOpen={isAiSectionModalOpen}
        onClose={() => setIsAiSectionModalOpen(false)}
      />
      <MediaModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
      />
    </div>
  );
}
