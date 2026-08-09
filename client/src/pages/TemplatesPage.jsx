import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutTemplate, ChevronRight, ArrowRight } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import Badge from '../components/ui/Badge.jsx';
import api from '../lib/api.js';
import { useEditorStore } from '../store/useEditorStore.js';
import { toast } from 'sonner';

const CATEGORIES = ['All', 'School Project', 'Class IX & X', 'Class XI & XII', 'Certificate', 'Report', 'Presentation'];

export default function TemplatesPage() {
  const navigate = useNavigate();
  const { setDocument } = useEditorStore();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [previewTemplate, setPreviewTemplate] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => (await api.get('/templates')).data.templates || [],
  });
  const templates = data || [];

  const filtered = templates.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleUse = async (template) => {
    try {
      const res = await api.post(`/templates/${template.id}/use`);
      setDocument(res.data.document);
      toast.success('Template applied!');
      navigate(`/editor/${res.data.document.id}`);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Failed to use template');
    }
  };

  return (
    <DashboardLayout>
      <div className="px-6 lg:px-8 py-8 max-w-[1200px] mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[13px] mb-3" style={{ color: 'var(--text-muted)' }}>
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: 'var(--text-primary)' }}>Templates</span>
          </div>
          <h1 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            Templates
          </h1>
          <p className="text-[14px] mt-1" style={{ color: 'var(--text-secondary)' }}>
            Start from a professionally designed template and customize to your needs.
          </p>
        </div>

        {/* Search + filter row */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2.5 rounded-xl text-[13px] w-56 border outline-none"
              style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
            />
          </div>

          {/* Category pill filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-4 py-2 rounded-xl text-[13px] font-medium border transition-all"
                style={{
                  backgroundColor: selectedCategory === cat ? 'var(--accent-soft)' : 'var(--surface-1)',
                  borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
                  color: selectedCategory === cat ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: selectedCategory === cat ? '600' : '500',
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-52 rounded-2xl animate-pulse" style={{ backgroundColor: 'var(--surface-2)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-1)' }}>
            <EmptyState
              icon={LayoutTemplate}
              title="No templates found"
              description="Try a different search term or category."
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((template) => (
              <div
                key={template.id}
                className="group rounded-2xl border overflow-hidden transition-all hover:shadow-lg cursor-pointer"
                style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
                onClick={() => setPreviewTemplate(template)}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
              >
                {/* Thumbnail placeholder */}
                <div
                  className="h-36 relative overflow-hidden"
                  style={{ backgroundColor: 'var(--surface-2)' }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }}
                    >
                      <LayoutTemplate className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Hover overlay */}
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center"
                    style={{ backgroundColor: 'rgba(30,91,63,0.9)' }}
                  >
                    <span className="text-[13px] font-semibold text-white flex items-center gap-1.5">
                      Preview
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                {/* Card content */}
                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-[14px] font-semibold leading-snug" style={{ color: 'var(--text-primary)' }}>
                      {template.name}
                    </h3>
                    <Badge variant="green">{template.category || 'Template'}</Badge>
                  </div>
                  <p className="text-[12px] line-clamp-2" style={{ color: 'var(--text-muted)' }}>
                    {template.description || 'A professional template designed for academic use.'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Preview Modal / Dialog */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div
            className="w-full max-w-lg rounded-2xl shadow-2xl border space-y-5 p-6"
            style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
          >
            {/* Template preview visual */}
            <div className="h-48 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--surface-2)' }}>
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }}>
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <p className="text-[13px] font-medium" style={{ color: 'var(--text-muted)' }}>Template preview</p>
              </div>
            </div>

            <div>
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-[18px] font-bold" style={{ color: 'var(--text-primary)' }}>{previewTemplate.name}</h2>
                <Badge variant="green">{previewTemplate.category || 'Template'}</Badge>
              </div>
              <p className="text-[14px] mt-1.5" style={{ color: 'var(--text-secondary)' }}>
                {previewTemplate.description || 'A professional template designed for academic use. Includes cover page, certificate, and structured chapters.'}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-medium border"
                style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
              >
                Cancel
              </button>
              <button
                onClick={() => { setPreviewTemplate(null); handleUse(previewTemplate); }}
                className="flex-1 py-2.5 rounded-xl text-[14px] font-semibold text-white flex items-center justify-center gap-2"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Use this template
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
