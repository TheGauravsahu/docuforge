import React from 'react';
import AppSidebar from './AppSidebar.jsx';

export default function DashboardLayout({ children, folders = [], onOpenFolderModal }) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: 'var(--bg-page)' }}
    >
      <AppSidebar folders={folders} onOpenFolderModal={onOpenFolderModal} />
      <div className="flex-1 h-screen overflow-y-auto" style={{ backgroundColor: 'var(--bg-page)' }}>
        {children}
      </div>
    </div>
  );
}
