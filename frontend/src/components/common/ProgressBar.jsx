import React from 'react';

export const ProgressBar = ({
  progress = 0,
  showLabel = true,
  color = 'var(--color-secondary)',
  height = '8px',
  className = '',
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={`progress-container ${className}`} style={{ width: '100%' }}>
      {showLabel && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)' }}>
          <span>Progress</span>
          <span>{clampedProgress}%</span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--color-border)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            width: `${clampedProgress}%`,
            height: '100%',
            backgroundColor: color,
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s ease-in-out',
          }}
        />
      </div>
    </div>
  );
};
