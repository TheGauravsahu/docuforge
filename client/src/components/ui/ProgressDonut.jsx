import React from 'react';

export default function ProgressDonut({ value = 0, max = 100, size = 80, strokeWidth = 8, label }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const offset = circumference * (1 - pct);
  const cx = size / 2;
  const cy = size / 2;
  const displayPct = Math.round(pct * 100);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Track */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={strokeWidth}
          />
          {/* Fill */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="var(--primary)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div
          className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold"
          style={{ color: 'var(--text-primary)' }}
        >
          {displayPct}%
        </div>
      </div>
      {label && (
        <span className="text-[12px] font-medium text-center" style={{ color: 'var(--text-muted)' }}>
          {label}
        </span>
      )}
    </div>
  );
}
