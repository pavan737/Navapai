import React from 'react';

export const Card = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      onClick={onClick}
      className={`card ${hoverable ? 'card-hoverable' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
