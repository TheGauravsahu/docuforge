import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  FileText, Download, KeyRound, Lock, Eye, ArrowLeft, ChevronLeft, ChevronRight,
  ShieldCheck, Loader2, Sparkles
} from 'lucide-react';
import { toast } from 'sonner';
import { printDocumentPages } from '../lib/pdfPrint.js';

export default function SharedViewPage() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [doc, setDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activePageIndex, setActivePageIndex] = useState(0);
  const [isVerifyingPassword, setIsVerifyingPassword] = useState(false);

  const fetchSharedDoc = async (password = '') => {
    setLoading(true);
    setError(null);
    try {
      const url = `/documents/share/${token}${password ? `?password=${encodeURIComponent(password)}` : ''}`;
      const res = await api.get(url);
      setDoc(res.data.document);
      setPasswordRequired(false);
    } catch (err) {
      console.error(err);
      if (err.response?.data?.error === 'PASSWORD_REQUIRED' || err.response?.data?.error === 'WRONG_PASSWORD') {
        setPasswordRequired(true);
        if (err.response?.data?.error === 'WRONG_PASSWORD') {
          toast.error('Incorrect password. Please try again.');
        }
      } else {
        setError(err.response?.data?.error || 'Document not found or private');
      }
    } finally {
      setLoading(false);
      setIsVerifyingPassword(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchSharedDoc();
    }
  }, [token]);

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) return;
    setIsVerifyingPassword(true);
    fetchSharedDoc(passwordInput.trim());
  };

  const handlePrintPdf = () => {
    if (!doc?.contentJson) return;
    toast.info('Preparing all pages for PDF print...');
    printDocumentPages(doc.contentJson, doc.title || 'Document');
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
          Loading shared document presentation...
        </p>
      </div>
    );
  }

  if (passwordRequired && !doc) {
    return (
      <div className="h-screen flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6 space-y-5 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
              Password Protected Document
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              The owner of this document has restricted access with a password.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                autoFocus
                placeholder="Enter password..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm outline-none focus:border-emerald-500"
              />
            </div>
            <button
              type="submit"
              disabled={isVerifyingPassword}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-sm transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isVerifyingPassword ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Verifying...
                </>
              ) : (
                'Unlock Document'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 p-4 bg-gray-50 dark:bg-gray-900">
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
          Access Restricted
        </h2>
        <p className="text-xs text-gray-500 max-w-sm text-center">
          {error || 'This project link is private or no longer available.'}
        </p>
        <button
          onClick={() => navigate('/')}
          className="mt-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const pages = doc.contentJson?.pages || [];
  const theme = doc.contentJson?.theme || {};
  const activePage = pages[activePageIndex] || pages[0];

  return (
    <div className="h-screen flex flex-col bg-gray-100 dark:bg-gray-950 overflow-hidden select-none">
      {/* Top Navbar */}
      <header className="h-14 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 flex items-center justify-between z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white font-bold text-base flex items-center justify-center shadow-sm">
            D
          </div>
          <div>
            <h1 className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-xs sm:max-w-md">
              {doc.title}
            </h1>
            <p className="text-[11px] text-gray-400 flex items-center gap-1">
              <Eye className="w-3 h-3 text-emerald-500" /> Read-Only Shared View
            </p>
          </div>
        </div>

        {/* Navigation & Export */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePageIndex((prev) => Math.max(0, prev - 1))}
            disabled={activePageIndex === 0}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 text-gray-700 dark:text-gray-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium text-gray-600 dark:text-gray-400 min-w-[70px] text-center">
            Page {activePageIndex + 1} of {pages.length}
          </span>
          <button
            onClick={() => setActivePageIndex((prev) => Math.min(pages.length - 1, prev + 1))}
            disabled={activePageIndex === pages.length - 1}
            className="p-1.5 rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-30 text-gray-700 dark:text-gray-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-800 mx-1" />

          <button
            onClick={handlePrintPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Print / Save PDF
          </button>
        </div>
      </header>

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Page List Sidebar */}
        <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 p-3 overflow-y-auto hidden md:block flex-shrink-0 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 px-2 mb-2">
            Document Pages ({pages.length})
          </p>
          {pages.map((p, idx) => (
            <button
              key={p.id || idx}
              onClick={() => setActivePageIndex(idx)}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl text-left transition-all border ${
                activePageIndex === idx
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-500 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'border-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-800 text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              <span className="text-xs truncate">{p.title || `Page ${idx + 1}`}</span>
            </button>
          ))}
        </aside>

        {/* Center Canvas Presentation */}
        <main className="flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-gray-200 dark:bg-gray-950">
          {activePage && (
            <div
              className="bg-white shadow-2xl relative transition-all"
              style={{
                width: 700,
                minHeight: 990,
                backgroundColor: theme.backgroundColor || '#FAFAF8',
                border: theme.borderStyle === 'double' ? `4px double ${theme.borderColor || theme.primaryColor || '#1E5B3F'}` : `2px solid ${theme.borderColor || '#1E5B3F'}`,
                padding: '40px',
              }}
            >
              {activePage.elements?.map((el) => {
                if (el.type === 'text') {
                  return (
                    <div
                      key={el.id}
                      style={{
                        position: 'absolute',
                        left: `${el.x || 45}px`,
                        top: `${el.y || 50}px`,
                        width: `${el.width || 610}px`,
                        fontSize: `${el.fontSize || 14}px`,
                        fontFamily: el.fontFamily || theme.fontFamily || 'Georgia',
                        fontWeight: el.fontWeight || 'normal',
                        fontStyle: el.fontStyle || 'normal',
                        textDecoration: el.underline ? 'underline' : el.linethrough ? 'line-through' : 'none',
                        color: el.color || theme.primaryColor || '#1A1A1A',
                        textAlign: el.align || 'left',
                        whiteSpace: 'pre-wrap',
                        lineHeight: el.lineHeight || 1.3,
                        backgroundColor: el.textBackgroundColor || 'transparent',
                      }}
                    >
                      {el.content}
                    </div>
                  );
                } else if (el.type === 'image' && el.url) {
                  return (
                    <img
                      key={el.id}
                      src={el.url}
                      alt="Canvas Content"
                      style={{
                        position: 'absolute',
                        left: `${el.x || 50}px`,
                        top: `${el.y || 100}px`,
                        width: `${el.width || 320}px`,
                        height: `${el.height || 220}px`,
                        objectFit: 'contain',
                      }}
                    />
                  );
                }
                return null;
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
