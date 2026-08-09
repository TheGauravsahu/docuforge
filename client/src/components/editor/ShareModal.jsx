import React, { useState, useEffect } from 'react';
import {
  X, Share2, Globe, Link2, Lock, KeyRound, Copy, Check, ShieldCheck, Loader2
} from 'lucide-react';
import api from '../../lib/api.js';
import { useEditorStore } from '../../store/useEditorStore.js';
import { toast } from 'sonner';

const VISIBILITY_OPTIONS = [
  {
    id: 'LINK',
    title: 'Anyone with the link',
    description: 'Anyone who has the URL can view this document',
    icon: Link2,
    color: '#2563EB',
  },
  {
    id: 'PUBLIC',
    title: 'Public',
    description: 'Discoverable and viewable by anyone on the web',
    icon: Globe,
    color: '#059669',
  },
  {
    id: 'PASSWORD',
    title: 'Password Protected',
    description: 'Requires a secret password to open and view',
    icon: KeyRound,
    color: '#D97706',
  },
  {
    id: 'PRIVATE',
    title: 'Private',
    description: 'Only you can view and edit this document',
    icon: Lock,
    color: '#DC2626',
  },
];

export default function ShareModal({ isOpen, onClose }) {
  const { document, updateDocumentState } = useEditorStore();

  const existingShare = document?.contentJson?.shareSettings || {};
  const [visibility, setVisibility] = useState(existingShare.visibility || 'LINK');
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (document) {
      const share = document.contentJson?.shareSettings || {};
      setVisibility(share.visibility || 'LINK');
      if (share.token) {
        const origin = window.location.origin;
        setShareUrl(`${origin}/p/${share.token}`);
      }
    }
  }, [document, isOpen]);

  if (!isOpen) return null;

  const handleSaveShare = async (e) => {
    e?.preventDefault();
    if (!document?.id) return;

    if (visibility === 'PASSWORD' && (!password || password.length < 4)) {
      return toast.error('Password must be at least 4 characters');
    }

    setIsSaving(true);
    try {
      const res = await api.put(`/documents/${document.id}/share`, {
        visibility,
        password: visibility === 'PASSWORD' ? password : undefined,
      });

      const updatedShareUrl = res.data.shareUrl;
      setShareUrl(updatedShareUrl);

      // Update Zustand document store with new share settings
      if (res.data.document) {
        useEditorStore.setState({ document: res.data.document });
      }

      toast.success('Share permissions updated!');
      setIsSaving(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update share settings');
      setIsSaving(false);
    }
  };

  const handleCopyLink = () => {
    if (!shareUrl) {
      handleSaveShare();
      return;
    }
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success('Link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg rounded-2xl shadow-2xl border p-6 space-y-5 animate-in fade-in zoom-in-95"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-sm"
              style={{ background: 'linear-gradient(135deg, #2563EB 0%, #059669 100%)' }}
            >
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-[16px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
                Share Document Project
              </h2>
              <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                Create shareable links for presentations, teachers, or public view
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

        {/* Form / Options */}
        <form onSubmit={handleSaveShare} className="space-y-4">
          <div>
            <label className="block text-[13px] font-semibold mb-2.5" style={{ color: 'var(--text-secondary)' }}>
              Link Permissions
            </label>
            <div className="space-y-2">
              {VISIBILITY_OPTIONS.map((option) => {
                const Icon = option.icon;
                const isSelected = visibility === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setVisibility(option.id)}
                    className="w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all"
                    style={{
                      backgroundColor: isSelected ? `${option.color}12` : 'var(--surface-2)',
                      borderColor: isSelected ? option.color : 'var(--border)',
                      borderWidth: isSelected ? '2px' : '1px',
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{
                          backgroundColor: isSelected ? option.color : 'var(--surface-1)',
                          color: isSelected ? '#FFFFFF' : option.color,
                        }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div
                          className="text-[13px] font-bold"
                          style={{ color: isSelected ? option.color : 'var(--text-primary)' }}
                        >
                          {option.title}
                        </div>
                        <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          {option.description}
                        </div>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="w-4 h-4 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: option.color }}>
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Password Input (shown only if PASSWORD visibility chosen) */}
          {visibility === 'PASSWORD' && (
            <div className="p-3.5 rounded-xl border space-y-2 animate-in fade-in" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
              <label className="block text-[12px] font-semibold flex items-center gap-1.5" style={{ color: 'var(--text-secondary)' }}>
                <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                Set Password Protection *
              </label>
              <input
                type="password"
                required
                placeholder="Enter document access password..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full text-[13px] px-3 py-2 rounded-lg border outline-none font-medium"
                style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
              <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                Viewers will be prompted to enter this password to view the document.
              </p>
            </div>
          )}

          {/* Shareable Link Box */}
          {visibility !== 'PRIVATE' && (
            <div className="pt-2">
              <label className="block text-[12px] font-semibold mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                Shareable Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={shareUrl || `${window.location.origin}/p/... (Save to generate link)`}
                  className="flex-1 text-[12px] px-3 py-2.5 rounded-xl border outline-none font-mono text-ellipsis overflow-hidden"
                  style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="flex items-center gap-1.5 px-4 py-2.5 text-[12px] font-semibold text-white rounded-xl shadow-sm transition-opacity hover:opacity-90 flex-shrink-0"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy Link
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-between border-t" style={{ borderColor: 'var(--border)' }}>
            <div className="flex items-center gap-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Permissions apply instantly</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-[13px] font-medium rounded-xl transition-colors"
                style={{ color: 'var(--text-secondary)', backgroundColor: 'var(--surface-2)' }}
              >
                Done
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2 text-[13px] font-semibold text-white rounded-xl shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
