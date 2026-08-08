import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Wand2, LayoutTemplate, Settings, ShieldAlert,
  FolderPlus, Folder, FileText, LogOut, Sun, Moon,
  Sparkles, PanelLeftClose, PanelLeft, Menu, X
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore.js';
import { useTheme } from '../../context/ThemeContext.jsx';
import { useFolderStore } from '../../store/useFolderStore.js';

export default function AppSidebar({ folders = [], onOpenFolderModal }) {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const { activeFolderId, setActiveFolder } = useFolderStore();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'AI Generator', path: '/generate', icon: Wand2 },
    { label: 'Templates', path: '/templates', icon: LayoutTemplate },
    { label: 'Settings', path: '/settings', icon: Settings },
    ...(isAdmin ? [{ label: 'Admin Console', path: '/admin', icon: ShieldAlert, isAdmin: true }] : []),
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full select-none" style={{ backgroundColor: 'var(--surface-2)' }}>
      {/* Header */}
      <div
        className={`h-16 px-3 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} border-b flex-shrink-0`}
        style={{ borderColor: 'var(--border)' }}
      >
        {!isCollapsed && (
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center font-bold flex-shrink-0 shadow-sm"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div className="flex flex-col text-left truncate">
              <span className="font-bold text-[14px] tracking-tight" style={{ color: 'var(--text-primary)' }}>
                DocuForge
              </span>
              <span className="text-[9px] tracking-widest uppercase font-semibold" style={{ color: 'var(--text-muted)' }}>
                AI Studio
              </span>
            </div>
          </button>
        )}

        {/* Collapse toggle — desktop only */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden lg:flex p-2 rounded-xl transition-colors"
          style={{
            color: isCollapsed ? 'var(--primary)' : 'var(--text-muted)',
            backgroundColor: isCollapsed ? 'var(--surface-1)' : 'transparent',
          }}
          onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; }}
          onMouseLeave={e => {
            if (!isCollapsed) e.currentTarget.style.backgroundColor = 'transparent';
          }}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-4 h-4" />}
        </button>

        {/* Mobile close */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-1.5 rounded-lg"
          style={{ color: 'var(--text-muted)' }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto px-2 py-4 space-y-5">
        {/* Main nav */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
              Navigation
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setIsMobileOpen(false)}
              >
                {({ isActive }) => (
                  <div
                    className={`flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2.5'} rounded-xl cursor-pointer text-[13px] font-medium transition-all`}
                    style={{
                      backgroundColor: isActive ? 'var(--accent-soft)' : 'transparent',
                      color: isActive ? 'var(--primary)' : 'var(--text-secondary)',
                      fontWeight: isActive ? '600' : '500',
                    }}
                    onMouseEnter={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--surface-1)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="flex-1 truncate">{item.label}</span>
                    )}
                    {!isCollapsed && item.isAdmin && (
                      <span
                        className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }}
                      >
                        Admin
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Folders section */}
        <div className="space-y-1">
          {!isCollapsed && (
            <div className="px-3 pb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>
                Folders
              </span>
              <button
                onClick={onOpenFolderModal}
                className="p-1 rounded-md transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.backgroundColor = 'var(--accent-soft)'; }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                title="New Folder"
              >
                <FolderPlus className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            onClick={() => { setActiveFolder(null); setIsMobileOpen(false); }}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-xl transition-colors text-[13px]`}
            style={{
              backgroundColor: activeFolderId === null ? 'var(--accent-soft)' : 'transparent',
              color: activeFolderId === null ? 'var(--primary)' : 'var(--text-secondary)',
              fontWeight: activeFolderId === null ? '600' : '500',
            }}
            onMouseEnter={e => { if (activeFolderId !== null) e.currentTarget.style.backgroundColor = 'var(--surface-1)'; }}
            onMouseLeave={e => { if (activeFolderId !== null) e.currentTarget.style.backgroundColor = 'transparent'; }}
            title={isCollapsed ? 'All Documents' : undefined}
          >
            <FileText className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="truncate">All Documents</span>}
          </button>

          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => { setActiveFolder(folder.id); setIsMobileOpen(false); }}
              className={`w-full flex items-center ${isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3 py-2'} rounded-xl transition-colors text-[13px]`}
              style={{
                backgroundColor: activeFolderId === folder.id ? 'var(--accent-soft)' : 'transparent',
                color: activeFolderId === folder.id ? 'var(--primary)' : 'var(--text-secondary)',
                fontWeight: activeFolderId === folder.id ? '600' : '500',
              }}
              onMouseEnter={e => { if (activeFolderId !== folder.id) e.currentTarget.style.backgroundColor = 'var(--surface-1)'; }}
              onMouseLeave={e => { if (activeFolderId !== folder.id) e.currentTarget.style.backgroundColor = 'transparent'; }}
              title={isCollapsed ? folder.name : undefined}
            >
              <Folder className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }} />
              {!isCollapsed && <span className="truncate">{folder.name}</span>}
            </button>
          ))}

          {!isCollapsed && (
            <button
              onClick={onOpenFolderModal}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-[12px] font-medium transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ New folder</span>
            </button>
          )}
        </div>
      </div>

      {/* Footer: user profile + controls */}
      <div
        className="px-2 py-3 border-t flex-shrink-0"
        style={{ borderColor: 'var(--border)' }}
      >
        {isCollapsed ? (
          /* Collapsed Vertical Layout (No Overlap) */
          <div className="flex flex-col items-center gap-2.5 py-1">
            <button
              onClick={() => navigate('/settings')}
              title={user?.name || 'User Settings'}
              className="hover:scale-105 transition-transform"
            >
              <img
                src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full border shadow-sm"
                style={{ borderColor: 'var(--border)' }}
              />
            </button>

            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={logout}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--danger)'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Expanded Horizontal Layout */
          <div className="flex items-center justify-between px-1">
            <button
              onClick={() => navigate('/settings')}
              className="flex items-center gap-2.5 flex-1 min-w-0 group text-left"
            >
              <img
                src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                alt="Avatar"
                className="w-8 h-8 rounded-full border flex-shrink-0 group-hover:opacity-80 transition-opacity"
                style={{ borderColor: 'var(--border)' }}
              />
              <div className="flex flex-col min-w-0 truncate">
                <span className="text-[13px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                  {user?.name || 'User'}
                </span>
                <span className="text-[11px] truncate" style={{ color: 'var(--text-muted)' }}>
                  {user?.email}
                </span>
              </div>
            </button>

            <div className="flex items-center gap-0.5 ml-1">
              <button
                onClick={toggleTheme}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                title="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>
              <button
                onClick={logout}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = 'var(--surface-1)'; e.currentTarget.style.color = 'var(--danger)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col h-screen flex-shrink-0 border-r transition-all duration-200`}
        style={{
          width: isCollapsed ? '72px' : '220px',
          borderColor: 'var(--border)',
          backgroundColor: 'var(--surface-2)',
        }}
      >
        <SidebarContent />
      </aside>

      {/* Mobile hamburger trigger */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl shadow-lg border"
        style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay drawer */}
      {isMobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsMobileOpen(false)}
          />
          <aside
            className="lg:hidden fixed top-0 left-0 z-50 h-full w-[240px] flex flex-col border-r shadow-2xl"
            style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}
          >
            <SidebarContent />
          </aside>
        </>
      )}
    </>
  );
}
