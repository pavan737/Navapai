import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({
  message = 'Loading content...',
  fullPage = false,
  className = '',
}) => {
  return (
    <div
      className={`loading-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: fullPage ? 'var(--spacing-12) var(--spacing-6)' : 'var(--spacing-8) var(--spacing-6)',
        textAlign: 'center',
        gap: 'var(--spacing-3)',
        minHeight: fullPage ? '300px' : 'auto',
      }}
    >
      <Loader2
        size={32}
        color="var(--color-primary)"
        style={{ animation: 'spin 1s linear infinite' }}
      />
      <p style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', fontWeight: 500 }}>
        {message}
      </p>
    </div>
  );
};
