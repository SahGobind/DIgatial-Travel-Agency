import React from 'react';

/**
 * Responsive Container component for page margins and constrained layouts.
 */
export const Container = ({
  children,
  className = '',
  size = 'default',
  ...props
}) => {
  const sizeClasses = {
    narrow: 'max-w-4xl',
    default: 'max-w-7xl',
    wide: 'max-w-[1440px]',
    full: 'max-w-full',
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 ${sizeClasses[size] || sizeClasses.default} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
