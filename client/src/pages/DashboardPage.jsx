import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  FileText, Search, Sparkles, Trash2, Clock,
  LayoutGrid, List, Wand2, ArrowRight, FileCheck,
  FileClock, Cpu, FolderOpen
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ProgressDonut from '../components/ui/ProgressDonut.jsx';
import Badge from '../components/ui/Badge.jsx';
import api from '../lib/api.js';
import { useFolderStore } from '../store/useFolderStore.js';
import { useEditorStore } from '../store/useEditorStore.js';
import { useAuthStore } from '../store/useAuthStore.js';

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeFolderId, setActiveFolder } = useFolderStore();
  const { setDocument } = useEditorStore();
  const { user } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [newFolderName, setNewFolderName] = useState('');
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState('grid');

  const { data: foldersData } = useQuery({
    queryKey: ['folders'],
    queryFn: async () => (await api.get('/folders')).data.folders || [],
  });
  const folders = foldersData || [];

  const { data: docsData, isLoading } = useQuery({
    queryKey: ['documents', activeFolderId],
    queryFn: async () => {
      const params = {};
      if (activeFolderId) params.folderId = activeFolderId;
      return (await api.get('/documents', { params })).data.documents || [];
    },
  });
  const documents = docsData || [];

  const createFolderMutation = useMutation({
    mutationFn: async (name) => (await api.post('/folders', { name, parentId: activeFolderId })).data.folder,
    onSuccess: () => {
      toast.success('Folder created');
      queryClient.invalidateQueries({ queryKey: ['folders'] });
      setNewFolderName('');
      setIsFolderModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to create folder'),
  });

  const deleteDocMutation = useMutation({
    mutationFn: async (docId) => await api.delete(`/documents/${docId}`),
    onSuccess: () => {
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Failed to delete'),
  });

  const handleOpenDocument = (doc) => {
    setDocument(doc);
    navigate(`/editor/${doc.id}`);
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === 'ALL' || doc.type === selectedType;
    return matchesSearch && matchesType;
  });

  const stats = {
    total: documents.length,
    drafts: documents.filter(d => d.status === 'DRAFT').length,
    finalized: documents.filter(d => d.status === 'FINALIZED').length,
    generations: 5, // Would come from user usage logs
    generationsLimit: 10,
  };

  return (
    <DashboardLayout folders={folders} onOpenFolderModal={() => setIsFolderModalOpen(true)}>
      <div className="px-6 lg:px-8 py-8 space-y-8 max-w-[1400px] mx-auto">

        {/* Top bar: greeting + CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0] || 'there'} 👋
            </h1>
            <p className="text-[14px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
              Here's what's happening in your workspace.
            </p>
          </div>

          <button
            onClick={() => navigate('/generate')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white shadow-md transition-opacity hover:opacity-90 flex-shrink-0"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Wand2 className="w-4 h-4" />
            New from topic
          </button>
        </div>

        {/* Stat row: 4 cards, last one dark green */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard label="Total Documents" value={stats.total} icon={FileText} />
          <StatCard label="Drafts" value={stats.drafts} icon={FileClock} trend="In progress" />
          <StatCard label="Finalized" value={stats.finalized} icon={FileCheck} trend="Export-ready" />
          <StatCard
            label="AI Generations This Month"
            value={`${stats.generations}/${stats.generationsLimit}`}
            icon={Cpu}
            variant="dark"
            trend={`${stats.generationsLimit - stats.generations} remaining`}
          />
        </div>

        {/* Main content area + optional right rail */}
        <div className="flex gap-6">

          {/* Document workspace */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Controls bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
                  {activeFolderId
                    ? folders.find(f => f.id === activeFolderId)?.name || 'Folder'
                    : 'Recent Documents'}
                </h2>
                <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
                  {filteredDocs.length} {filteredDocs.length === 1 ? 'document' : 'documents'}
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-9 pr-3 py-2 rounded-xl text-[13px] w-48 outline-none border"
                    style={{
                      backgroundColor: 'var(--surface-1)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                  />
                </div>

                {/* Type filter */}
                <select
                  value={selectedType}
                  onChange={e => setSelectedType(e.target.value)}
                  className="py-2 px-2.5 rounded-xl text-[13px] border outline-none font-medium"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                >
                  <option value="ALL">All</option>
                  <option value="PDF">PDF</option>
                  <option value="PPTX">PPTX</option>
                  <option value="DOCX">DOCX</option>
                </select>

                {/* View toggle */}
                <div className="flex items-center rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  <button
                    onClick={() => setViewMode('grid')}
                    className="p-2 transition-colors"
                    style={{
                      backgroundColor: viewMode === 'grid' ? 'var(--accent-soft)' : 'var(--surface-1)',
                      color: viewMode === 'grid' ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className="p-2 transition-colors"
                    style={{
                      backgroundColor: viewMode === 'list' ? 'var(--accent-soft)' : 'var(--surface-1)',
                      color: viewMode === 'list' ? 'var(--primary)' : 'var(--text-muted)',
                    }}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Grid / List / Empty state */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-36 rounded-xl animate-pulse" style={{ backgroundColor: 'var(--surface-2)' }} />
                ))}
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="rounded-2xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-1)' }}>
                <EmptyState
                  icon={FolderOpen}
                  title="No documents yet"
                  description="Generate your first academic project, certificate, or report with Gemini AI."
                  action="Generate first project"
                  onAction={() => navigate('/generate')}
                />
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => handleOpenDocument(doc)}
                    className="group rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md flex flex-col justify-between gap-4"
                    style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-[14px] font-semibold leading-snug line-clamp-2" style={{ color: 'var(--text-primary)' }}>
                        {doc.title}
                      </h3>
                      <button
                        onClick={e => { e.stopPropagation(); deleteDocMutation.mutate(doc.id); }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg transition-all flex-shrink-0"
                        style={{ color: 'var(--text-muted)' }}
                        onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge variant={doc.type === 'PDF' ? 'green' : 'default'}>{doc.type}</Badge>
                      <span className="text-[12px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                        <Clock className="w-3 h-3" />
                        {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-1)' }}>
                <table className="w-full text-left">
                  <thead style={{ backgroundColor: 'var(--surface-2)' }}>
                    <tr>
                      {['Title', 'Format', 'Status', 'Modified', ''].map(h => (
                        <th key={h} className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: `1px solid var(--border)` }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDocs.map((doc) => (
                      <tr
                        key={doc.id}
                        onClick={() => handleOpenDocument(doc)}
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: `1px solid var(--border)` }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-5 py-3.5 text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>{doc.title}</td>
                        <td className="px-5 py-3.5"><Badge variant="green">{doc.type}</Badge></td>
                        <td className="px-5 py-3.5 text-[13px] font-medium" style={{ color: 'var(--text-secondary)' }}>{doc.status}</td>
                        <td className="px-5 py-3.5 text-[13px]" style={{ color: 'var(--text-muted)' }}>
                          {new Date(doc.updatedAt || doc.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <button
                            onClick={e => { e.stopPropagation(); deleteDocMutation.mutate(doc.id); }}
                            className="p-1.5 rounded-lg"
                            style={{ color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = 'var(--danger)'; e.currentTarget.style.backgroundColor = '#FEE2E2'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right rail — Generations card */}
          <div className="hidden xl:flex flex-col gap-4 w-60 flex-shrink-0">
            {/* Dark green hero card */}
            <div
              className="rounded-2xl p-5 space-y-4"
              style={{ backgroundColor: 'var(--accent-dark-card)' }}
            >
              <div>
                <p className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Generations remaining</p>
                <p className="text-2xl font-bold text-white mt-0.5">
                  {stats.generationsLimit - stats.generations}
                  <span className="text-[14px] font-normal ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>/ {stats.generationsLimit}</span>
                </p>
              </div>
              <div className="flex justify-center py-2">
                <ProgressDonut
                  value={stats.generations}
                  max={stats.generationsLimit}
                  size={88}
                  strokeWidth={9}
                  label="Used this month"
                />
              </div>
              <button
                onClick={() => navigate('/settings?tab=billing')}
                className="w-full py-2.5 rounded-xl text-[13px] font-semibold text-center transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)', color: 'var(--accent-dark-card)' }}
              >
                Upgrade plan
              </button>
            </div>

            {/* Quick actions */}
            <div
              className="rounded-2xl border p-4 space-y-2"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
            >
              <p className="text-[12px] font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>Quick actions</p>
              {[
                { label: 'New project', icon: Wand2, path: '/generate' },
                { label: 'Browse templates', icon: FileText, path: '/templates' },
              ].map(({ label, icon: Icon, path }) => (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium transition-colors"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--accent-soft)'; e.currentTarget.style.color = 'var(--primary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* New Folder Modal */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-sm rounded-2xl shadow-2xl p-6 border space-y-4"
            style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
          >
            <h3 className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>
              New Folder
            </h3>
            <form onSubmit={e => { e.preventDefault(); createFolderMutation.mutate(newFolderName); }} className="space-y-4">
              <input
                type="text"
                required
                placeholder="e.g. School Projects 2025"
                value={newFolderName}
                onChange={e => setNewFolderName(e.target.value)}
                autoFocus
                className="w-full text-[14px] px-3.5 py-2.5 rounded-xl border outline-none"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-[13px] font-medium"
                  style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createFolderMutation.isPending}
                  className="px-4 py-2 rounded-xl text-[13px] font-semibold text-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
