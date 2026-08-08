import React, { useState, Suspense, lazy } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ErrorBoundary, PageLoader } from './components/ui/ErrorBoundary.jsx';
import AppPreloader from './components/ui/AppPreloader.jsx';
import GreenAuraBackground from './components/ui/GreenAuraBackground.jsx';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30_000,
    },
  },
});

function Root() {
  const [preloaderDone, setPreloaderDone] = useState(false);

  return (
    <>
      {/* Splash preloader — shown only on first mount */}
      <AppPreloader onFinish={() => setPreloaderDone(true)} />

      {/* Green neon aura behind all content */}
      <GreenAuraBackground />

      {/* Main app tree */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        <ErrorBoundary>
          <Suspense fallback={<PageLoader label="Loading DocuForge..." />}>
            <App />
          </Suspense>
        </ErrorBoundary>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <Root />
    </ThemeProvider>
  </QueryClientProvider>
);
