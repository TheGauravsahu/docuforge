import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import LandingPage from './pages/LandingPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import EditorPage from './pages/EditorPage.jsx';
import GeneratePage from './pages/GeneratePage.jsx';
import CreateManualPage from './pages/CreateManualPage.jsx';
import TemplatesPage from './pages/TemplatesPage.jsx';
import SettingsPage from './pages/SettingsPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import SharedViewPage from './pages/SharedViewPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';

import ProtectedRoute from './components/layout/ProtectedRoute.jsx';
import AdminRoute from './components/layout/AdminRoute.jsx';
import { useAuthStore } from './store/useAuthStore.js';

export default function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      {/* Sonner toast notifications */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        theme="system"
        toastOptions={{
          style: {
            fontFamily: 'Inter, Geist, sans-serif',
            fontSize: '14px',
            borderRadius: '12px',
          },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/p/:token" element={<SharedViewPage />} />

        {/* Protected User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/generate" element={<ProtectedRoute><GeneratePage /></ProtectedRoute>} />
        <Route path="/create-manual" element={<ProtectedRoute><CreateManualPage /></ProtectedRoute>} />
        <Route path="/editor/:docId" element={<ProtectedRoute><EditorPage /></ProtectedRoute>} />
        <Route path="/templates" element={<ProtectedRoute><TemplatesPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />

        {/* Redirect old /profile → /settings?tab=personal */}
        <Route path="/profile" element={<Navigate to="/settings?tab=personal" replace />} />

        {/* Protected Admin Only Route */}
        <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
