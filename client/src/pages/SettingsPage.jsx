import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  User, Shield, Sliders, CreditCard, ChevronRight, Camera,
  CheckCircle2, AlertTriangle, Trash2, Sun, Moon, Monitor
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../lib/api.js';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
  { id: 'billing', label: 'Billing', icon: CreditCard },
];

function InlineEditRow({ label, value, placeholder, type = 'text', readOnly = false, badge }) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(value);

  return (
    <div
      className="flex items-center justify-between py-4 gap-4"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-medium mb-0.5" style={{ color: 'var(--text-muted)' }}>{label}</p>
        {editing ? (
          <input
            type={type}
            value={val}
            autoFocus
            onChange={e => setVal(e.target.value)}
            onBlur={() => setEditing(false)}
            className="text-[14px] font-medium bg-transparent border-b outline-none w-full"
            style={{ borderColor: 'var(--primary)', color: 'var(--text-primary)' }}
          />
        ) : (
          <div className="flex items-center gap-2">
            <p className="text-[14px] font-medium truncate" style={{ color: val ? 'var(--text-primary)' : 'var(--text-muted)' }}>
              {val || placeholder}
            </p>
            {badge}
          </div>
        )}
      </div>
      {!readOnly && (
        <button
          onClick={() => setEditing(!editing)}
          className="text-[13px] font-semibold flex-shrink-0 transition-colors"
          style={{ color: editing ? 'var(--text-muted)' : 'var(--primary)' }}
        >
          {editing ? 'Done' : 'Edit'}
        </button>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'personal';
  const setTab = (id) => setSearchParams({ tab: id });

  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--text-muted)' }}>
          <span>Dashboard</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span style={{ color: 'var(--text-primary)' }}>Settings</span>
        </div>

        <h1 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
          Settings
        </h1>

        <div className="flex gap-6">

          {/* Sidebar tab nav */}
          <div className="w-52 flex-shrink-0 space-y-0.5">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all text-left"
                style={{
                  backgroundColor: activeTab === id ? 'var(--accent-soft)' : 'transparent',
                  color: activeTab === id ? 'var(--primary)' : 'var(--text-secondary)',
                  fontWeight: activeTab === id ? '600' : '500',
                }}
                onMouseEnter={e => { if (activeTab !== id) { e.currentTarget.style.backgroundColor = 'var(--surface-2)'; } }}
                onMouseLeave={e => { if (activeTab !== id) { e.currentTarget.style.backgroundColor = 'transparent'; } }}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 min-w-0">

            {/* ── PERSONAL INFO ── */}
            {activeTab === 'personal' && (
              <div
                className="rounded-2xl border overflow-hidden"
                style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
              >
                {/* Avatar header */}
                <div className="px-6 py-5 flex items-center gap-5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div className="relative">
                    <img
                      src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full border-2"
                      style={{ borderColor: 'var(--border)' }}
                    />
                    <button
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 shadow-sm"
                      style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                    >
                      <Camera className="w-3 h-3" />
                    </button>
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                    <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                  </div>
                </div>

                {/* Inline-edit rows */}
                <div className="px-6">
                  <InlineEditRow label="Full name" value={user?.name} placeholder="Your name" />
                  <InlineEditRow
                    label="Email address"
                    value={user?.email}
                    placeholder="you@school.edu"
                    type="email"
                    readOnly
                    badge={
                      <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--primary)' }}>
                        <CheckCircle2 className="w-3 h-3" /> Verified
                      </span>
                    }
                  />
                  <InlineEditRow label="School" value={user?.school} placeholder="Your school name" />
                  <InlineEditRow label="Class / Grade" value={user?.grade} placeholder="Class XII" />
                  <InlineEditRow label="Roll number" value={user?.rollNumber} placeholder="12345" />
                </div>

                <div className="px-6 py-4">
                  <button
                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
                    style={{ backgroundColor: 'var(--primary)' }}
                    onClick={() => toast.success('Profile updated!')}
                  >
                    Save changes
                  </button>
                </div>
              </div>
            )}

            {/* ── SECURITY ── */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                {/* Password change */}
                <div
                  className="rounded-2xl border p-6 space-y-4"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Password</h2>
                  {[
                    { label: 'Current password', placeholder: '••••••••' },
                    { label: 'New password', placeholder: 'Min. 8 characters' },
                    { label: 'Confirm new password', placeholder: '••••••••' },
                  ].map(({ label, placeholder }) => (
                    <div key={label}>
                      <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>{label}</label>
                      <input
                        type="password"
                        placeholder={placeholder}
                        className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border outline-none"
                        style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                        onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                        onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                      />
                    </div>
                  ))}
                  <button
                    onClick={() => toast.success('Password updated!')}
                    className="px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    Update password
                  </button>
                </div>

                {/* Active sessions */}
                <div
                  className="rounded-2xl border p-6 space-y-3"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Active sessions</h2>
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Current session</p>
                      <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Chrome on Windows · {new Date().toLocaleDateString()}</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }}>
                      Active
                    </span>
                  </div>
                </div>

                {/* Danger zone */}
                <div
                  className="rounded-2xl border p-6 space-y-3"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: '#FECACA' }}
                >
                  <h2 className="text-[15px] font-semibold" style={{ color: 'var(--danger)' }}>Danger zone</h2>
                  <p className="text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                    Once you delete your account, there is no going back. All your documents and data will be permanently deleted.
                  </p>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you absolutely sure? This cannot be undone.')) {
                        toast.error('Account deletion is not yet available. Contact support.');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold"
                    style={{ color: 'var(--danger)', backgroundColor: '#FEE2E2' }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete account
                  </button>
                </div>
              </div>
            )}

            {/* ── PREFERENCES ── */}
            {activeTab === 'preferences' && (
              <div className="space-y-4">
                <div
                  className="rounded-2xl border p-6 space-y-6"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Appearance</h2>

                  {/* Theme selector */}
                  <div>
                    <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Theme</p>
                    <div className="flex gap-3">
                      {[
                        { val: 'light', label: 'Light', icon: Sun },
                        { val: 'dark', label: 'Dark', icon: Moon },
                        { val: 'system', label: 'System', icon: Monitor },
                      ].map(({ val, label, icon: Icon }) => (
                        <button
                          key={val}
                          onClick={() => setTheme(val)}
                          className="flex-1 flex flex-col items-center gap-2 py-4 rounded-xl border transition-all"
                          style={{
                            borderColor: theme === val ? 'var(--primary)' : 'var(--border)',
                            backgroundColor: theme === val ? 'var(--accent-soft)' : 'var(--surface-2)',
                          }}
                        >
                          <Icon className="w-5 h-5" style={{ color: theme === val ? 'var(--primary)' : 'var(--text-muted)' }} />
                          <span className="text-[13px] font-medium" style={{ color: theme === val ? 'var(--primary)' : 'var(--text-secondary)' }}>{label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Document defaults */}
                <div
                  className="rounded-2xl border p-6 space-y-4"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Document defaults</h2>
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Default border style</label>
                    <select className="px-3.5 py-2.5 rounded-xl text-[14px] border outline-none" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}>
                      <option>Double border</option>
                      <option>Single border</option>
                      <option>Ornamental</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ── BILLING ── */}
            {activeTab === 'billing' && (
              <div className="space-y-4">
                {/* Dark hero card */}
                <div
                  className="rounded-2xl p-6 space-y-4"
                  style={{ backgroundColor: 'var(--accent-dark-card)' }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[12px] font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Current plan</p>
                      <p className="text-[22px] font-bold text-white mt-0.5">Free</p>
                    </div>
                    <span className="px-3 py-1 rounded-full text-[12px] font-semibold" style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.6)' }}>
                      Active
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-[13px] mb-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      <span>AI Generations used</span>
                      <span>5 / 10</span>
                    </div>
                    <div className="w-full h-2 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                      <div className="h-2 rounded-full w-1/2" style={{ backgroundColor: '#4ADE80' }} />
                    </div>
                  </div>
                  <button
                    onClick={() => toast.info('Pro plan coming soon! Stay tuned.')}
                    className="w-full py-2.5 rounded-xl text-[14px] font-semibold transition-opacity hover:opacity-90"
                    style={{ backgroundColor: '#4ADE80', color: '#0B1F17' }}
                  >
                    Upgrade to Pro
                  </button>
                </div>

                {/* Invoice history */}
                <div
                  className="rounded-2xl border p-6 space-y-3"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Invoice history</h2>
                  <div className="py-10 text-center" style={{ color: 'var(--text-muted)' }}>
                    <p className="text-[13px]">No invoices yet — you're on the free plan.</p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
