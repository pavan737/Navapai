import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '../common/Button';

export const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while fetching data. Please try again.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`error-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-10) var(--spacing-6)',
        textAlign: 'center',
        backgroundColor: 'var(--color-error-subtle)',
        border: '1px solid rgba(211, 47, 47, 0.2)',
        borderRadius: 'var(--radius-lg)',
        margin: 'var(--spacing-6) 0',
      }}
    >
      <div
        style={{
          width: '50px',
          height: '50px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(211, 47, 47, 0.1)',
          color: 'var(--color-error)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--spacing-3)',
        }}
      >
        <AlertCircle size={26} />
      </div>
      <h3 style={{ color: 'var(--color-error)', fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)' }}>
        {title}
      </h3>
      <p style={{ maxWidth: '440px', fontSize: 'var(--font-size-sm)', marginBottom: onRetry ? 'var(--spacing-6)' : 0 }}>
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" icon={RefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};
