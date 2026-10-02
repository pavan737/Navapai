import React, { forwardRef } from 'react';

export const Input = forwardRef(({
  label,
  error,
  helperText,
  icon: Icon,
  type = 'text',
  className = '',
  id,
  ...props
}, ref) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--font-size-sm)',
            fontWeight: 600,
            color: 'var(--color-text-main)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        {Icon && (
          <div
            style={{
              position: 'absolute',
              left: '12px',
              color: 'var(--color-text-muted)',
              display: 'flex',
              alignItems: 'center',
              pointerEvents: 'none',
            }}
          >
            <Icon size={18} />
          </div>
        )}
        <input
          ref={ref}
          id={inputId}
          type={type}
          className={`input-field ${error ? 'input-error' : ''} ${className}`}
          style={{
            width: '100%',
            padding: Icon ? '10px 14px 10px 38px' : '10px 14px',
            fontSize: 'var(--font-size-sm)',
            borderRadius: 'var(--radius-md)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
            backgroundColor: 'var(--color-surface-elevated)',
            color: 'var(--color-text-main)',
            outline: 'none',
            transition: 'border-color var(--transition-fast), box-shadow var(--transition-fast)',
          }}
          {...props}
        />
      </div>
      {error && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-error)', fontWeight: 500 }}>
          {error}
        </span>
      )}
      {helperText && !error && (
        <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
          {helperText}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
