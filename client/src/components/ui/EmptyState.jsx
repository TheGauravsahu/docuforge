import React from 'react';

export default function EmptyState({ icon: Icon, title, description, action, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
      {Icon && (
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--primary)' }}
        >
          <Icon className="w-6 h-6" />
        </div>
      )}
      <div className="space-y-1 max-w-xs">
        <h3
          className="text-[15px] font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {title}
        </h3>
        {description && (
          <p className="text-[13px]" style={{ color: 'var(--text-muted)' }}>
            {description}
          </p>
        )}
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          className="mt-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--primary)' }}
        >
          {action}
        </button>
      )}
    </div>
  );
}
