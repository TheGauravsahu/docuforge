import React from 'react';

export default function StatCard({ label, value, icon: Icon, variant = 'default', trend }) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`rounded-xl border p-5 flex flex-col justify-between min-h-[112px] transition-all ${
        isDark
          ? 'bg-accent-dark text-white border-transparent shadow-lg'
          : 'bg-surface border-bdr shadow-sm hover:shadow-md'
      }`}
      style={isDark ? { backgroundColor: 'var(--accent-dark-card)', borderColor: 'transparent' } : {}}
    >
      <div className="flex items-start justify-between">
        <span
          className="text-[13px] font-medium"
          style={{ color: isDark ? 'rgba(255,255,255,0.65)' : 'var(--text-muted)' }}
        >
          {label}
        </span>
        {Icon && (
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'var(--accent-soft)',
              color: isDark ? 'white' : 'var(--primary)',
            }}
          >
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="mt-3">
        <div
          className="text-[28px] font-semibold leading-none tracking-tight"
          style={{ color: isDark ? 'white' : 'var(--text-primary)' }}
        >
          {value}
        </div>
        {trend && (
          <div
            className="text-[12px] font-medium mt-1.5"
            style={{ color: isDark ? 'rgba(255,255,255,0.5)' : 'var(--text-muted)' }}
          >
            {trend}
          </div>
        )}
      </div>
    </div>
  );
}
