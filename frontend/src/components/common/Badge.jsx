import React from 'react';

export const Badge = ({
  children,
  variant = 'olive', // 'olive' | 'success' | 'blue' | 'warning' | 'error' | 'neutral'
  icon: Icon,
  className = '',
}) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {Icon && <Icon size={12} />}
      <span>{children}</span>
    </span>
  );
};
