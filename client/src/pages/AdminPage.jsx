import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Users, BarChart2, ScrollText, Search,
  ShieldAlert, ChevronRight, Trash2, ShieldCheck, ShieldOff, Sparkles
} from 'lucide-react';
import DashboardLayout from '../components/layout/DashboardLayout.jsx';
import Badge from '../components/ui/Badge.jsx';
import StatCard from '../components/ui/StatCard.jsx';
import api from '../lib/api.js';

const TABS = [
  { id: 'users', label: 'Users', icon: Users },
  { id: 'usage', label: 'Usage', icon: BarChart2 },
  { id: 'audit', label: 'Audit Log', icon: ScrollText },
];

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => (await api.get('/admin/users')).data.users || [],
    staleTime: 1000 * 60 * 2,
  });
  const users = usersData || [];

  const { data: statsData } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => (await api.get('/admin/stats')).data || {},
    staleTime: 1000 * 60 * 2,
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }) => api.patch(`/admin/users/${userId}/role`, { role }),
    onSuccess: () => {
      toast.success('User role updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('Failed to update role'),
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => api.delete(`/admin/users/${userId}`),
    onSuccess: () => {
      toast.success('User deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
    onError: () => toast.error('Failed to delete user'),
  });

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalUsersCount = statsData?.totalUsers ?? statsData?.metrics?.totalUsers ?? users.length;
  const totalDocsCount = statsData?.totalDocuments ?? statsData?.metrics?.totalDocuments ?? 0;
  const totalTemplatesCount = statsData?.totalTemplates ?? 3;
  const totalGenCount = statsData?.totalGenerations ?? statsData?.metrics?.totalGenerations ?? 0;

  return (
    <DashboardLayout>
      <div className="px-6 lg:px-8 py-8 max-w-[1200px] mx-auto space-y-8">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 text-[13px] mb-3" style={{ color: 'var(--text-muted)' }}>
            <span>Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span style={{ color: 'var(--text-primary)' }}>Admin Console</span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="text-[24px] font-bold tracking-tight" style={{ color: 'var(--text-primary)' }}>
              Admin Console
            </h1>
            <span
              className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase"
              style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--primary)', border: '1px solid var(--border)' }}
            >
              Admin
            </span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={totalUsersCount} icon={Users} />
          <StatCard label="Documents Generated" value={totalDocsCount} icon={ScrollText} />
          <StatCard label="Templates Available" value={totalTemplatesCount} icon={BarChart2} />
          <StatCard label="AI Generations This Month" value={totalGenCount} icon={Sparkles} variant="dark" />
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-1 p-1 rounded-xl w-fit" style={{ backgroundColor: 'var(--surface-2)' }}>
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-medium transition-all"
              style={{
                backgroundColor: activeTab === id ? 'var(--surface-1)' : 'transparent',
                color: activeTab === id ? 'var(--text-primary)' : 'var(--text-muted)',
                fontWeight: activeTab === id ? '600' : '500',
                boxShadow: activeTab === id ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* ── USERS TAB ── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            {/* Search */}
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-2 w-full rounded-xl text-[13px] border outline-none"
                style={{ backgroundColor: 'var(--surface-1)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
              />
            </div>

            {/* Table */}
            <div className="rounded-2xl border" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-1)' }}>
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--surface-2)' }}>
                  <tr>
                    {['User', 'Email', 'Role', 'Joined', 'Actions'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted)', borderBottom: '1px solid var(--border)' }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>Loading user directory...</td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-10 text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>No users found.</td></tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr
                        key={u.id}
                        style={{ borderBottom: '1px solid var(--border)' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--surface-2)'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={u.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${u.name}`}
                              alt="Avatar"
                              className="w-8 h-8 rounded-full border flex-shrink-0"
                              style={{ borderColor: 'var(--border)' }}
                            />
                            <span className="text-[14px] font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{u.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-[13px]" style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={u.role === 'ADMIN' ? 'admin' : 'default'}>{u.role}</Badge>
                        </td>
                        <td className="px-5 py-3.5 text-[13px]" style={{ color: 'var(--text-muted)' }}>
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            {/* Make / Remove Admin Toggle */}
                            {u.role !== 'ADMIN' ? (
                              <button
                                onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'ADMIN' })}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors border"
                                style={{ backgroundColor: 'var(--accent-soft)', borderColor: 'var(--border)', color: 'var(--primary)' }}
                                title="Promote to Admin"
                              >
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Make Admin
                              </button>
                            ) : (
                              <button
                                onClick={() => updateRoleMutation.mutate({ userId: u.id, role: 'USER' })}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors border"
                                style={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}
                                title="Demote to User"
                              >
                                <ShieldOff className="w-3.5 h-3.5" />
                                Remove Admin
                              </button>
                            )}

                            {/* Delete User */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete user ${u.name}?`)) {
                                  deleteUserMutation.mutate(u.id);
                                }
                              }}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[12px] font-semibold transition-colors"
                              style={{ backgroundColor: '#FEE2E2', color: 'var(--danger)' }}
                              title="Delete User"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── USAGE TAB ── */}
        {activeTab === 'usage' && (
          <div
            className="rounded-2xl border p-16 flex items-center justify-center"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-1)' }}
          >
            <div className="text-center space-y-2">
              <BarChart2 className="w-10 h-10 mx-auto" style={{ color: 'var(--text-muted)' }} />
              <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Usage Analytics & System Status</p>
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>Real-time usage logs & server metrics enabled.</p>
            </div>
          </div>
        )}

        {/* ── AUDIT LOG TAB ── */}
        {activeTab === 'audit' && (
          <div
            className="rounded-2xl border p-16 flex items-center justify-center"
            style={{ borderColor: 'var(--border)', backgroundColor: 'var(--surface-1)' }}
          >
            <div className="text-center space-y-2">
              <ScrollText className="w-10 h-10 mx-auto" style={{ color: 'var(--text-muted)' }} />
              <p className="text-[15px] font-semibold" style={{ color: 'var(--text-primary)' }}>Server Audit Log</p>
              <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>All administrative role changes & system events are logged.</p>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
