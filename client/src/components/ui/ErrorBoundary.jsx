import React, { Component } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary] Uncaught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center px-6"
          style={{ backgroundColor: 'var(--bg-page)' }}
        >
          <div className="max-w-md text-center space-y-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: '#FEE2E2', color: 'var(--danger)' }}
            >
              <AlertTriangle className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h1 className="text-[22px] font-bold" style={{ color: 'var(--text-primary)' }}>
                Something went wrong
              </h1>
              <p className="text-[14px]" style={{ color: 'var(--text-secondary)' }}>
                An unexpected error occurred. You can try refreshing the page.
              </p>
              {this.state.error?.message && (
                <code
                  className="block text-[12px] px-4 py-2 rounded-xl mt-2"
                  style={{ backgroundColor: 'var(--surface-2)', color: 'var(--text-muted)' }}
                >
                  {this.state.error.message}
                </code>
              )}
            </div>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[14px] font-semibold text-white mx-auto"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              <RefreshCw className="w-4 h-4" />
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export function PageLoader({ label = 'Loading...' }) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-4"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      {/* Animated green ring */}
      <div className="relative">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin"
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
      <p className="text-[14px] font-medium" style={{ color: 'var(--text-muted)' }}>
        {label}
      </p>
    </div>
  );
}

export function SectionLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div
        className="w-8 h-8 rounded-full border-[3px] animate-spin"
        style={{
          borderColor: 'var(--accent-soft)',
          borderTopColor: 'var(--primary)',
        }}
      />
    </div>
  );
}
