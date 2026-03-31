'use client';

import React from 'react';
import { animated, useSpring, config } from '@react-spring/web';

interface PaginationLinksProps {
  currentPage: number;
  totalPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * PaginationLinks
 * Premium, glassmorphism-style pagination navigation
 * Provides clear visual feedback and smooth hover states
 */
export function PaginationLinks({ 
  currentPage, 
  totalPage, 
  onPageChange, 
  className = '' 
}: PaginationLinksProps) {
  // Animation for the container
  const containerSpring = useSpring({
    from: { opacity: 0, y: 10 },
    to: { opacity: 1, y: 0 },
    config: config.gentle,
  });

  if (totalPage <= 1) return null;

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPage, start + maxVisible - 1);
    
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <animated.div 
      style={containerSpring}
      className={`flex items-center justify-center gap-2 py-8 ${className}`}
    >
      {/* Prev Button */}
      <PageButton 
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        label="&laquo;"
      />

      {/* First Page if not in range */}
      {getPageNumbers()[0] > 1 && (
        <>
          <PageButton onClick={() => onPageChange(1)} label="1" />
          <span className="text-muted/40 px-1 select-none">...</span>
        </>
      )}

      {/* Pages */}
      {getPageNumbers().map((page) => (
        <PageButton
          key={page}
          onClick={() => onPageChange(page)}
          active={page === currentPage}
          label={page.toString()}
        />
      ))}

      {/* Last Page if not in range */}
      {getPageNumbers()[getPageNumbers().length - 1] < totalPage && (
        <>
          <span className="text-muted/40 px-1 select-none">...</span>
          <PageButton onClick={() => onPageChange(totalPage)} label={totalPage.toString()} />
        </>
      )}

      {/* Next Button */}
      <PageButton 
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPage}
        label="&raquo;"
      />
    </animated.div>
  );
}

/**
 * PageButton Sub-component
 */
function PageButton({ 
  onClick, 
  active = false, 
  disabled = false, 
  label 
}: { 
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || active}
      className={`
        relative min-w-[40px] h-10 flex items-center justify-center rounded-xl transition-all duration-300 font-medium text-sm
        ${active 
          ? 'bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/25 ring-1 ring-white/20' 
          : disabled
            ? 'opacity-30 cursor-not-allowed text-muted'
            : 'glass-card-hover text-muted hover:text-foreground border border-white/5 hover:border-white/10'
        }
      `}
    >
      {label}
      {/* Active Glow Effect */}
      {active && (
        <div className="absolute inset-0 rounded-xl bg-white/20 animate-pulse" />
      )}
    </button>
  );
}
