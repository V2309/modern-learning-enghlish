'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const from = (currentPage - 1) * pageSize + 1;
  const to = Math.min(currentPage * pageSize, totalItems);

  // Build page number list with ellipsis
  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      {/* Info */}
      <p className="text-xs sm:text-sm text-muted-foreground font-medium">
        Hiển thị{' '}
        <span className="font-black text-foreground">{from}–{to}</span>
        {' '}trong{' '}
        <span className="font-black text-brand">{totalItems}</span>
        {' '}khóa học
      </p>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="flex items-center justify-center h-9 w-9 rounded-2xl border-2 border-border bg-card text-foreground shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4 stroke-[2.5]" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="h-9 w-9 flex items-center justify-center text-muted-foreground text-sm font-bold">
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'h-9 min-w-9 px-3 rounded-2xl text-xs font-black transition-all border-2 cursor-pointer',
                currentPage === page
                  ? 'btn-3d-duo'
                  : 'bg-card border-border shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              {page}
            </button>
          )
        )}

        {/* Next */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="flex items-center justify-center h-9 w-9 rounded-2xl border-2 border-border bg-card text-foreground shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          <ChevronRight className="h-4 w-4 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
