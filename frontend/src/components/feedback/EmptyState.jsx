import React from 'react';
import { FolderOpen } from 'lucide-react';
import { Button } from '../common/Button';

export const EmptyState = ({
  title = 'No items found',
  description = 'There are no records matching your current filter or query.',
  icon: Icon = FolderOpen,
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`empty-state ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--spacing-10) var(--spacing-6)',
        textAlign: 'center',
        backgroundColor: 'var(--color-surface-card)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        margin: 'var(--spacing-6) 0',
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: 'var(--radius-full)',
          backgroundColor: 'rgba(102, 112, 74, 0.12)',
          color: 'var(--color-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--spacing-4)',
        }}
      >
        <Icon size={26} />
      </div>
      <h3 style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--spacing-2)' }}>{title}</h3>
      <p style={{ maxWidth: '420px', fontSize: 'var(--font-size-sm)', marginBottom: actionLabel ? 'var(--spacing-6)' : 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
