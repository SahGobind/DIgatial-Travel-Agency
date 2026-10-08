import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Reusable Button component supporting primary, secondary, outline, and danger variants.
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  to,
  href,
  onClick,
  disabled = false,
  isLoading = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 select-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed';

  const sizeStyles = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-sm px-5 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5',
  };

  const variantStyles = {
    primary:
      'bg-[#0B2A6F] text-white hover:bg-[#123D8D] active:bg-[#071c4d] focus:ring-[#0B2A6F] shadow-sm hover:shadow',
    secondary:
      'bg-[#123D8D] text-white hover:bg-[#0B2A6F] active:bg-[#071c4d] focus:ring-[#123D8D] shadow-sm hover:shadow',
    outline:
      'border-2 border-[#0B2A6F] text-[#0B2A6F] bg-transparent hover:bg-[#0B2A6F] hover:text-white focus:ring-[#0B2A6F]',
    danger:
      'bg-[#D71920] text-white hover:bg-[#b8141a] active:bg-[#960f14] focus:ring-[#D71920] shadow-sm hover:shadow',
  };

  const combinedClasses = `${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
    variantStyles[variant] || variantStyles.primary
  } ${className}`;

  const content = (
    <>
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {!isLoading && Icon && iconPosition === 'left' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
      <span>{children}</span>
      {!isLoading && Icon && iconPosition === 'right' && (
        <Icon className="w-4 h-4 shrink-0" />
      )}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={combinedClasses} {...props}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={combinedClasses} {...props}>
        {content}
      </a>
    );
  }

  return (
    <button
      type={type}
      className={combinedClasses}
      onClick={onClick}
      disabled={disabled || isLoading}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
