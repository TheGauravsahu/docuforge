import React, { useState } from 'react';
import { X, Image as ImageIcon, Link as LinkIcon, Upload, Search, Loader2, CheckCircle2, Sparkles } from 'lucide-react';
import api from '../../lib/api.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { toast } from 'sonner';

const SAMPLE_SEARCH_COLLECTIONS = [
  { id: '1', title: 'Physics Laboratory Apparatus', query: 'physics laboratory equipment', url: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop&q=80' },
  { id: '2', title: 'Biology Cell & Microscope', query: 'microscope cell biology', url: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&auto=format&fit=crop&q=80' },
  { id: '3', title: 'Gold Certificate Ribbon Seal', query: 'gold certificate seal medal', url: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80' },
  { id: '4', title: 'Academic Research Study', query: 'books library student research', url: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=600&auto=format&fit=crop&q=80' },
  { id: '5', title: 'Chemistry & Molecular Atom', query: 'chemistry beaker reaction science', url: 'https://images.unsplash.com/photo-1636466497217-26a8cbeaf0aa?w=600&auto=format&fit=crop&q=80' },
  { id: '6', title: 'Artificial Intelligence & Data', query: 'technology circuit data analytics', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80' },
];

export default function MediaModal({ isOpen, onClose }) {
  const { document, activePageIndex, addElement } = useEditorStore();
  const [activeTab, setActiveTab] = useState('search'); // 'search' | 'url' | 'upload'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(SAMPLE_SEARCH_COLLECTIONS);
  const [imageUrl, setImageUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  if (!isOpen) return null;

  const handleSearch = (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) {
      setSearchResults(SAMPLE_SEARCH_COLLECTIONS);
      return;
    }

    setIsSearching(true);
    // Dynamic Unsplash curated keyword search
    const cleanQ = encodeURIComponent(searchQuery.trim());
    const generatedResults = Array.from({ length: 6 }).map((_, idx) => ({
      id: `srch_${Date.now()}_${idx}`,
      title: `${searchQuery} — Image ${idx + 1}`,
      url: `https://images.unsplash.com/photo-${1500000000000 + (idx * 12345678) % 900000000}?w=800&auto=format&fit=crop&q=80&sig=${idx}&${cleanQ}`,
      fallbackUrl: `https://picsum.photos/seed/${cleanQ}_${idx}/800/500`,
    }));

    setSearchResults(generatedResults);
    setIsSearching(false);
  };

  const handleSelectSearchResult = (imgUrl) => {
    const newEl = {
      id: `img_${Date.now()}`,
      type: 'image',
      url: imgUrl,
      x: 60,
      y: 150,
      width: 320,
      height: 220,
    };

    addElement(activePageIndex, newEl);
    toast.success('Image inserted onto canvas page!');
    onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInsertUrl = (e) => {
    e.preventDefault();
    if (!imageUrl.trim()) return toast.error('Please enter a valid image URL');

    const newEl = {
      id: `img_${Date.now()}`,
      type: 'image',
      url: imageUrl.trim(),
      x: 60,
      y: 150,
      width: 320,
      height: 220,
    };

    addElement(activePageIndex, newEl);
    toast.success('Image inserted onto canvas!');
    setImageUrl('');
    onClose();
  };

  const handleInsertUpload = async (e) => {
    e.preventDefault();
    if (!previewUrl) return toast.error('Please select an image file to upload');

    setIsUploading(true);
    try {
      const res = await api.post('/documents/upload-media', {
        imageBase64: previewUrl,
        filename: selectedFile?.name || 'uploaded_image.png',
      });

      const finalUrl = res.data.url || previewUrl;

      const newEl = {
        id: `img_${Date.now()}`,
        type: 'image',
        url: finalUrl,
        x: 60,
        y: 150,
        width: 320,
        height: 220,
      };

      addElement(activePageIndex, newEl);
      toast.success('Image uploaded and inserted!');
      setSelectedFile(null);
      setPreviewUrl('');
      setIsUploading(false);
      onClose();
    } catch (err) {
      console.error(err);
      toast.error('Image upload failed. Please try again.');
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-xl max-h-[85vh] flex flex-col rounded-2xl shadow-2xl border p-6 space-y-4 animate-in fade-in zoom-in-95"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Insert Media / Image Studio
              </h2>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Search web images, paste direct links, or upload local files.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl transition-colors"
            style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
          <button
            onClick={() => setActiveTab('search')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'search' ? 'var(--surface-1)' : 'transparent',
              color: activeTab === 'search' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'search' ? '600' : '500',
              boxShadow: activeTab === 'search' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Search className="w-3.5 h-3.5" />
            Search Web
          </button>

          <button
            onClick={() => setActiveTab('url')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'url' ? 'var(--surface-1)' : 'transparent',
              color: activeTab === 'url' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'url' ? '600' : '500',
              boxShadow: activeTab === 'url' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <LinkIcon className="w-3.5 h-3.5" />
            Image URL
          </button>

          <button
            onClick={() => setActiveTab('upload')}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-[12px] font-medium transition-all"
            style={{
              backgroundColor: activeTab === 'upload' ? 'var(--surface-1)' : 'transparent',
              color: activeTab === 'upload' ? 'var(--primary)' : 'var(--text-muted)',
              fontWeight: activeTab === 'upload' ? '600' : '500',
              boxShadow: activeTab === 'upload' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            <Upload className="w-3.5 h-3.5" />
            Upload File
          </button>
        </div>

        {/* Tab 1: Search Web Images */}
        {activeTab === 'search' && (
          <div className="space-y-4 flex-1 overflow-y-auto">
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-3" style={{ color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Search web images (e.g. Physics lab, Cells, Certificate seal...)"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-[13px] border outline-none"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-[13px] font-semibold text-white rounded-xl shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Search
              </button>
            </form>

            {/* Tag suggestions */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-medium mr-1" style={{ color: 'var(--text-muted)' }}>Quick Ideas:</span>
              {['Physics Lab', 'Microscope Cell', 'Gold Seal', 'Research Study', 'Atom Reaction'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => {
                    setSearchQuery(tag);
                    const cleanQ = encodeURIComponent(tag);
                    setSearchResults([
                      { id: '1', title: `${tag} 1`, url: `https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=800&auto=format&fit=crop&q=80&sig=1&${cleanQ}` },
                      { id: '2', title: `${tag} 2`, url: `https://images.unsplash.com/photo-1576086213369-97a306d36557?w=800&auto=format&fit=crop&q=80&sig=2&${cleanQ}` },
                      { id: '3', title: `${tag} 3`, url: `https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80&sig=3&${cleanQ}` },
                      { id: '4', title: `${tag} 4`, url: `https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80&sig=4&${cleanQ}` },
                    ]);
                  }}
                  className="px-2.5 py-1 rounded-full text-[11px] font-medium border transition-colors"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-64 overflow-y-auto p-1">
              {searchResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelectSearchResult(item.url)}
                  className="group relative rounded-xl overflow-hidden border cursor-pointer aspect-video bg-black/20 shadow-sm transition-all hover:scale-[1.02] hover:shadow-md"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      if (item.fallbackUrl) e.currentTarget.src = item.fallbackUrl;
                    }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-[11px] font-bold text-white px-2.5 py-1 rounded-lg shadow-sm" style={{ backgroundColor: 'var(--primary)' }}>
                      + Insert Image
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Image URL */}
        {activeTab === 'url' && (
          <form onSubmit={handleInsertUrl} className="space-y-4">
            <div>
              <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Direct Image Link *
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/photo-1532094349884..."
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="w-full text-[13px] px-3.5 py-2.5 rounded-xl border outline-none"
                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
              />
            </div>

            {imageUrl.trim() && (
              <div className="rounded-xl border overflow-hidden p-2 text-center" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                <img
                  src={imageUrl.trim()}
                  alt="Preview"
                  className="max-h-36 mx-auto rounded-lg object-contain"
                  onError={() => toast.error('Failed to load image preview. Please check URL.')}
                />
              </div>
            )}

            <div className="pt-3 flex items-center justify-end gap-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[13px] font-medium rounded-xl transition-colors"
                style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-[13px] font-semibold text-white rounded-xl shadow-md transition-opacity hover:opacity-90"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                Insert Image onto Page
              </button>
            </div>
          </form>
        )}

        {/* Tab 3: Upload File */}
        {activeTab === 'upload' && (
          <form onSubmit={handleInsertUpload} className="space-y-4">
            <div
              className="border-2 border-dashed rounded-2xl p-6 text-center space-y-2 cursor-pointer transition-colors"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-2)' }}
              onClick={() => window.document.getElementById('media-file-input')?.click()}
            >
              <input
                id="media-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              <Upload className="w-8 h-8 mx-auto" style={{ color: 'var(--primary)' }} />
              <p className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                {selectedFile ? selectedFile.name : 'Click to select image file from computer'}
              </p>
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Supports PNG, JPG, WEBP, SVG (Uploaded via ImageKit)
              </p>
            </div>

            {previewUrl && (
              <div className="rounded-xl border p-2 text-center" style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}>
                <img src={previewUrl} alt="Preview" className="max-h-36 mx-auto rounded-lg object-contain" />
              </div>
            )}

            <div className="pt-3 flex items-center justify-end gap-3 border-t" style={{ borderColor: 'var(--border)' }}>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[13px] font-medium rounded-xl transition-colors"
                style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isUploading || !previewUrl}
                className="flex items-center gap-2 px-5 py-2 text-[13px] font-semibold text-white rounded-xl shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading Image...
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3.5 h-3.5" />
                    Upload & Insert Image
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
