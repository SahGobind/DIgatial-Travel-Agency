import React from 'react';

/**
 * SectionTitle component for section headers with badge, main title, and description.
 */
export const SectionTitle = ({
  badge,
  title,
  subtitle,
  description,
  align = 'center',
  light = false,
  className = '',
}) => {
  const alignClasses = {
    center: 'text-center items-center',
    left: 'text-left items-start',
    right: 'text-right items-end',
  };

  return (
    <div className={`flex flex-col ${alignClasses[align] || alignClasses.center} ${className}`}>
      {badge && (
        <span
          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase mb-2.5 ${
            light
              ? 'bg-white/15 text-white border border-white/20'
              : 'bg-[#0B2A6F]/10 text-[#0B2A6F] border border-[#0B2A6F]/20'
          }`}
        >
          {badge}
        </span>
      )}

      {title && (
        <h2
          className={`text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight leading-tight ${
            light ? 'text-white' : 'text-[#172033]'
          }`}
        >
          {title}
        </h2>
      )}

      {subtitle && (
        <p
          className={`mt-2 text-base sm:text-lg font-medium ${
            light ? 'text-blue-100' : 'text-[#123D8D]'
          }`}
        >
          {subtitle}
        </p>
      )}

      {description && (
        <p
          className={`mt-3 text-sm sm:text-base max-w-2xl leading-relaxed ${
            light ? 'text-slate-300' : 'text-slate-600'
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionTitle;
