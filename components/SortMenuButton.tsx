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
}

export default function SortMenuButton<T extends string>({
  options,
  value,
  onChange,
  className,
  buttonLabel = 'Sắp xếp',
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

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center gap-2 px-4 py-3 rounded-2xl border font-bold text-sm transition-all',
          open
            ? 'bg-primary/10 border-primary/40 text-primary'
            : 'bg-card border-border text-muted-foreground hover:bg-muted hover:text-foreground',
          className
        )}
      >
        <ArrowUpDown className="h-4 w-4" />
        <span className="hidden sm:inline">{options.find((option) => option.key === value)?.label ?? buttonLabel}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-56 bg-card border border-border rounded-2xl shadow-xl overflow-hidden z-50"
          >
            <div className="p-2">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-3 py-2">Sắp xếp theo</p>
              {options.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => {
                    onChange(option.key);
                    setOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                    value === option.key
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  )}
                >
                  {option.label}
                  {value === option.key && <Check className="h-3.5 w-3.5 text-primary" />}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
