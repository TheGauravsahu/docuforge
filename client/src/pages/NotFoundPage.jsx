import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <div className="max-w-md text-center space-y-6">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }}
        >
          <FileQuestion className="w-9 h-9" />
        </div>

        <div className="space-y-2">
          <h1
            className="text-[60px] font-extrabold leading-none"
            style={{ color: 'var(--primary)' }}
          >
            404
          </h1>
          <h2
            className="text-[22px] font-bold tracking-tight"
            style={{ color: 'var(--text-primary)' }}
          >
            Page not found
          </h2>
          <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-medium border transition-colors"
            style={{ borderColor: 'var(--border)', color: 'var(--text-secondary)', backgroundColor: 'var(--surface-1)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--surface-1)'}
          >
            <ArrowLeft className="w-4 h-4" />
            Go back
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white transition-opacity hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
