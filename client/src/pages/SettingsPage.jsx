import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  User, Shield, Sliders, ChevronRight, Camera,
  CheckCircle2, Trash2, Sun, Moon, Monitor, Loader2
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
import { useTheme } from '../context/ThemeContext.jsx';
import api from '../lib/api.js';

const TABS = [
  { id: 'personal', label: 'Personal Info', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'preferences', label: 'Preferences', icon: Sliders },
];

export default function SettingsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'personal';
  const setTab = (id) => setSearchParams({ tab: id });

  const { user, setUser } = useAuthStore();
  const { theme, setTheme } = useTheme();

  // Personal Info Form State
  const [name, setName] = useState(user?.name || '');
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

  // Security Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handleUpdateProfile = async (e) => {
    e?.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty');
    setIsUpdatingProfile(true);
    try {
      const res = await api.put('/auth/profile', { name: name.trim() });
      setUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e?.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }
    if (newPassword !== confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setIsUpdatingPassword(true);
    try {
      await api.put('/auth/profile', { password: newPassword });
      toast.success('Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

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
              <form
                onSubmit={handleUpdateProfile}
                className="rounded-2xl border overflow-hidden space-y-4 p-6"
                style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
              >
                {/* Avatar header */}
                <div className="flex items-center gap-5 pb-5 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div className="relative">
                    <img
                      src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
                      alt="Avatar"
                      className="w-16 h-16 rounded-full border-2"
                      style={{ borderColor: 'var(--border)' }}
                    />
                  </div>
                  <div>
                    <p className="text-[16px] font-semibold" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
                    <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>{user?.email}</p>
                  </div>
                </div>

                {/* Profile Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border outline-none"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                      Email Address
                    </label>
                    <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border" style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)' }}>
                      <span className="text-[14px]" style={{ color: 'var(--text-muted)' }}>{user?.email}</span>
                      <span className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: 'var(--primary)' }}>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified Account
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={isUpdatingProfile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {isUpdatingProfile ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving Changes...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* ── SECURITY ── */}
            {activeTab === 'security' && (
              <div className="space-y-4">
                {/* Password change */}
                <form
                  onSubmit={handleUpdatePassword}
                  className="rounded-2xl border p-6 space-y-4"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Password Security</h2>
                  
                  <div>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Min. 6 characters"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border outline-none"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  <div>
                    <label className="block text-[13px] font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Confirm New Password</label>
                    <input
                      type="password"
                      required
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl text-[14px] border outline-none"
                      style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                      onFocus={e => e.currentTarget.style.borderColor = 'var(--primary)'}
                      onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingPassword}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {isUpdatingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating Password...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </form>

                {/* Active sessions */}
                <div
                  className="rounded-2xl border p-6 space-y-3"
                  style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)' }}
                >
                  <h2 className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Active Session</h2>
                  <div className="flex items-center justify-between py-2 px-3 rounded-xl" style={{ backgroundColor: 'var(--surface-2)' }}>
                    <div>
                      <p className="text-[14px] font-medium" style={{ color: 'var(--text-primary)' }}>Current active browser session</p>
                      <p className="text-[12px]" style={{ color: 'var(--text-muted)' }}>Windows · Authenticated via JWT Token</p>
                    </div>
                    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }}>
                      Active
                    </span>
                  </div>
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
                    <p className="text-[13px] font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>Theme Mode</p>
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
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
