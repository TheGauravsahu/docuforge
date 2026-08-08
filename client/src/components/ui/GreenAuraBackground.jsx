/**
 * GreenAuraBackground
 * Fixed, z-index 0, sits behind all content.
 * Two soft radial green blobs positioned at bottom-left and top-right.
 * Visibility adapts to light/dark theme.
 */
import React from 'react';

export default function GreenAuraBackground() {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
    >
      {/* Top-right blob */}
      <div
        style={{
          position: 'absolute',
          top: '-15%',
          right: '-10%',
          width: '55vw',
          height: '55vw',
          maxWidth: '700px',
          maxHeight: '700px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,91,63,0.18) 0%, rgba(30,91,63,0.06) 50%, transparent 75%)',
          filter: 'blur(48px)',
          transform: 'translate(10%, -10%)',
        }}
      />

      {/* Bottom-left blob */}
      <div
        style={{
          position: 'absolute',
          bottom: '-20%',
          left: '-10%',
          width: '50vw',
          height: '50vw',
          maxWidth: '600px',
          maxHeight: '600px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(30,91,63,0.14) 0%, rgba(30,91,63,0.04) 55%, transparent 75%)',
          filter: 'blur(56px)',
          transform: 'translate(-10%, 10%)',
        }}
      />
    </div>
  );
}
