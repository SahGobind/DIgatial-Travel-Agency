import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import Container from './Container';

/**
 * PageHeader component for inner pages with breadcrumbs and gradient backdrop.
 */
export const PageHeader = ({
  title,
  subtitle,
  badge,
  breadcrumbs = [],
}) => {
  return (
    <div className="relative bg-gradient-to-r from-[#0B2A6F] via-[#123D8D] to-[#0B2A6F] text-white py-12 md:py-16 overflow-hidden">
      {/* Subtle decorative background shapes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full border-8 border-white"></div>
        <div className="absolute left-1/4 -bottom-20 w-96 h-96 rounded-full border-4 border-white/50"></div>
      </div>

      <Container className="relative z-10">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-blue-200 mb-4">
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-white transition-colors duration-150"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>

          {breadcrumbs.map((crumb, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={crumb.label || idx}>
                <ChevronRight className="w-3.5 h-3.5 text-blue-300/60 shrink-0" />
                {isLast || !crumb.to ? (
                  <span className="text-white font-medium truncate">
                    {crumb.label}
                  </span>
                ) : (
                  <Link
                    to={crumb.to}
                    className="hover:text-white transition-colors duration-150 truncate"
                  >
                    {crumb.label}
                  </Link>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {badge && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-[#D71920] text-white mb-3">
            {badge}
          </span>
        )}

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-3 text-base sm:text-lg text-blue-100 max-w-2xl leading-relaxed">
            {subtitle}
          </p>
        )}
      </Container>
    </div>
  );
};

export default PageHeader;
