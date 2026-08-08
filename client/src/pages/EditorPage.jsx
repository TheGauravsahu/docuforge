import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import EditorToolbar from '../components/editor/EditorToolbar.jsx';
import PageThumbnailsSidebar from '../components/editor/PageThumbnailsSidebar.jsx';
import FabricCanvas from '../components/editor/FabricCanvas.jsx';
import InspectorPanel from '../components/editor/InspectorPanel.jsx';
import PlaceholderFormModal from '../components/editor/PlaceholderFormModal.jsx';
import ExportModal from '../components/editor/ExportModal.jsx';
import AiGeneratorModal from '../components/editor/AiGeneratorModal.jsx';
import AiSectionWriterModal from '../components/editor/AiSectionWriterModal.jsx';
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
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (docId && (!document || document.id !== docId)) {
      fetchDocument(docId);
    }
  }, [docId]);

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

  const fetchDocument = async (id) => {
    setIsLoading(true);
    try {
      const res = await api.get(`/documents/${id}`);
      setDocument(res.data.document);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load document. Returning to dashboard.');
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

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
      />

      {/* Main studio body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: page thumbnails */}
        <PageThumbnailsSidebar
          onOpenAiSectionWriter={() => setIsAiSectionModalOpen(true)}
        />

        {/* Center: canvas */}
        <div
          className="flex-1 overflow-auto flex items-start justify-center p-8"
          style={{ backgroundColor: 'var(--surface-2)' }}
        >
          <FabricCanvas />
        </div>

        {/* Right: inspector */}
        <InspectorPanel
          onOpenPlaceholderModal={() => setIsPlaceholderModalOpen(true)}
          onOpenAiModal={() => setIsAiModalOpen(true)}
          onOpenAiSectionModal={() => setIsAiSectionModalOpen(true)}
        />
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
    </div>
  );
}
