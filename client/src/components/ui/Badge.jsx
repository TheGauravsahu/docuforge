import React from 'react';

const variantStyles = {
  green: { bg: 'var(--accent-soft)', color: 'var(--primary)', border: 'transparent' },
  default: { bg: 'var(--surface-2)', color: 'var(--text-secondary)', border: 'var(--border)' },
  danger: { bg: '#FEE2E2', color: 'var(--danger)', border: 'transparent' },
  warning: { bg: '#FEF3C7', color: 'var(--warning)', border: 'transparent' },
  muted: { bg: 'var(--surface-2)', color: 'var(--text-muted)', border: 'var(--border)' },
  admin: { bg: '#EFF4EC', color: 'var(--primary)', border: 'var(--border)' },
};

export default function Badge({ children, variant = 'default', className = '' }) {
  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wide px-2.5 py-0.5 rounded-full ${className}`}
      style={{
        backgroundColor: styles.bg,
        color: styles.color,
        border: `1px solid ${styles.border}`,
      }}
    >
      {children}
    </span>
  );
}
