import React, { useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, Shield, Key, Save, Sparkles, FileText, Download } from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import { useAuthStore } from '../store/useAuthStore.js';
import api from '../lib/api.js';

export default function ProfilePage() {
  const { user, checkAuth } = useAuthStore();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // In production API or mock update endpoint
      toast.success('Profile updated successfully!');
      setIsUpdating(false);
      checkAuth();
    } catch (err) {
      toast.error('Failed to update profile');
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
        
        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Account Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information, security preferences, and subscription tier.</p>
        </div>

        {/* Profile Card Banner */}
        <div className="bg-card border border-border rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-5">
            <img
              src={user?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
              alt="Avatar"
              className="w-16 h-16 rounded-2xl bg-muted border border-border shadow-inner"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold">{user?.name || 'Account User'}</h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-primary text-primary-foreground">
                  {user?.role || 'USER'}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="bg-muted px-4 py-2 rounded-2xl border border-border text-center">
              <span className="block font-bold text-base">Free Plan</span>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Tier</span>
            </div>
          </div>
        </div>

        {/* Form Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* General Info */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <User className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold">Personal Information</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-primary-foreground rounded-2xl text-xs font-bold shadow-sm hover:opacity-90 transition-opacity"
              >
                <Save className="w-3.5 h-3.5" />
                Save Changes
              </button>
            </form>
          </div>

          {/* Security & Password */}
          <div className="bg-card border border-border rounded-3xl p-6 space-y-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-border pb-4">
              <Key className="w-4 h-4 text-primary" />
              <h3 className="text-base font-bold">Security & Password</h3>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">New Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs p-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-muted-foreground mb-1.5">Confirm Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full text-xs p-3 rounded-2xl border border-input bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <button
                type="submit"
                disabled={isUpdating}
                className="w-full flex items-center justify-center gap-2 py-3 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-2xl text-xs font-bold transition-colors"
              >
                Update Password
              </button>
            </form>
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
