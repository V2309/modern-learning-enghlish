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
  itemName?: string;
  variant?: 'rounded' | 'sharp';
}

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  itemName = 'mục',
  variant = 'rounded',
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const isSharp = variant === 'sharp';
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
    <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
      {/* Info */}
      <p className="text-xs text-muted-foreground font-medium">
        Hiển thị{' '}
        <span className="font-bold text-foreground">{from}–{to}</span>
        {' '}trong{' '}
        <span className="font-bold text-[#f28500]">{totalItems}</span>
        {' '}{itemName}
      </p>

      {/* Controls */}
      <div className={cn('flex items-center', isSharp ? 'gap-1' : 'gap-2')}>
        {/* Prev */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={cn(
            'flex items-center justify-center h-8 w-8 text-foreground transition-all cursor-pointer border',
            isSharp
              ? 'rounded-none border-[#e5e7eb] dark:border-[#1f2937] bg-white dark:bg-[#0f1115] hover:bg-[#f3f4f6] dark:hover:bg-[#1a1d21]'
              : 'rounded-2xl border-2 border-border bg-card shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          <ChevronLeft className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((page, idx) =>
          page === '...' ? (
            <span key={`ellipsis-${idx}`} className="h-8 w-8 flex items-center justify-center text-muted-foreground text-xs font-bold">
              ···
            </span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={cn(
                'h-8 min-w-8 px-2.5 text-xs font-bold transition-all border cursor-pointer',
                isSharp ? 'rounded-none' : 'rounded-2xl border-2',
                currentPage === page
                  ? isSharp
                    ? 'bg-[#f28500] text-white border-[#f28500]'
                    : 'btn-3d-duo'
                  : isSharp
                    ? 'bg-white dark:bg-[#0f1115] border-[#e5e7eb] dark:border-[#1f2937] text-muted-foreground hover:bg-[#f3f4f6] dark:hover:bg-[#1a1d21] hover:text-foreground'
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
          className={cn(
            'flex items-center justify-center h-8 w-8 text-foreground transition-all cursor-pointer border',
            isSharp
              ? 'rounded-none border-[#e5e7eb] dark:border-[#1f2937] bg-white dark:bg-[#0f1115] hover:bg-[#f3f4f6] dark:hover:bg-[#1a1d21]'
              : 'rounded-2xl border-2 border-border bg-card shadow-[0_2px_0_0_theme(colors.border)] active:translate-y-0.5 active:shadow-none hover:bg-muted',
            'disabled:opacity-30 disabled:cursor-not-allowed'
          )}
        >
          <ChevronRight className="h-3.5 w-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
