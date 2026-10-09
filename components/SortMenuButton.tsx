'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUpDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SortOption<T extends string> {
  key: T;
  label: string;
}

interface SortMenuButtonProps<T extends string> {
  options: readonly SortOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  buttonLabel?: string;
  variant?: 'rounded' | 'sharp';
}

export default function SortMenuButton<T extends string>({
  options,
  value,
  onChange,
  className,
  buttonLabel = 'Sắp xếp',
  variant = 'rounded',
}: SortMenuButtonProps<T>) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isSharp = variant === 'sharp';

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-2 px-3.5 py-2 font-bold text-xs transition-all cursor-pointer border',
          isSharp ? 'rounded-none border-[#e5e7eb] dark:border-[#1f2937]' : 'rounded-4xl border-border',
          open
            ? 'bg-[#f28500]/10 border-[#f28500]/40 text-[#f28500]'
            : 'bg-white dark:bg-[#0f1115] text-muted-foreground hover:bg-[#f3f4f6] dark:hover:bg-[#1a1d21] hover:text-foreground',
          className
        )}
      >
        <ArrowUpDown className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{options.find((option) => option.key === value)?.label ?? buttonLabel}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute right-0 mt-1 w-52 bg-white dark:bg-[#14171b] border border-[#e5e7eb] dark:border-[#1f2937] shadow-2xl overflow-hidden z-50',
              isSharp ? 'rounded-none' : 'rounded-3xl'
            )}
          >
            <div className="p-1.5">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-1.5">
                Sắp xếp theo
              </p>
              {options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    onChange(option.key);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-xs font-semibold transition-colors cursor-pointer',
                    isSharp ? 'rounded-none' : 'rounded-2xl',
                    value === option.key
                      ? 'bg-[#f28500]/10 text-[#f28500]'
                      : 'text-foreground hover:bg-[#f3f4f6] dark:hover:bg-[#1a1d21]'
                  )}
                >
                  <span>{option.label}</span>
                  {value === option.key && <Check className="h-3.5 w-3.5 text-[#f28500]" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
