import React, { useState, useEffect, useRef } from 'react';
import { Page } from '@/types/notion';
import { Search, Plus, Moon, Sun, Download, ArrowRight, X } from 'lucide-react';
import { IconRenderer } from '../common/IconRenderer';

interface CommandPaletteProps {
  isOpen: boolean;
  pages: Page[];
  theme: 'light' | 'dark';
  onClose: () => void;
  onSelectPage: (id: string) => void;
  onAddPage: () => void;
  onToggleTheme: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  pages,
  theme,
  onClose,
  onSelectPage,
  onAddPage,
  onToggleTheme,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);

      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const activePages = pages.filter((p) => !p.isArchived);

  // Filtered pages
  const filteredPages = activePages.filter((p) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const titleMatch = p.title.toLowerCase().includes(q);
    const contentMatch = p.blocks?.some((b) => b.content.toLowerCase().includes(q));
    return titleMatch || contentMatch;
  });

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredPages.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredPages.length) % (filteredPages.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredPages[selectedIndex]) {
          onSelectPage(filteredPages[selectedIndex].id);
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredPages, selectedIndex, onSelectPage, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-xs pt-20 p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-xl rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 border-b border-neutral-100 px-4 py-3 dark:border-neutral-800">
          <Search className="w-4 h-4 text-neutral-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search pages or type a command..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-neutral-800 dark:text-neutral-200 outline-hidden placeholder:text-neutral-400"
          />
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2">
          {/* Quick Actions if query is empty */}
          {!query && (
            <div className="mb-2">
              <div className="px-3 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Quick Actions
              </div>
              <button
                type="button"
                onClick={() => {
                  onAddPage();
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                <Plus className="w-4 h-4 text-neutral-500" />
                <span>Create new page</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  onClose();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-xs text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-500" />
                ) : (
                  <Moon className="w-4 h-4 text-neutral-500" />
                )}
                <span>Toggle {theme === 'dark' ? 'Light' : 'Dark'} Mode</span>
              </button>
            </div>
          )}

          {/* Matching Pages */}
          <div className="px-3 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
            Pages ({filteredPages.length})
          </div>
          {filteredPages.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-400">
              No matching pages found for &quot;{query}&quot;
            </div>
          ) : (
            filteredPages.map((page, index) => {
              const isSelected = index === selectedIndex;
              return (
                <button
                  key={page.id}
                  type="button"
                  onClick={() => {
                    onSelectPage(page.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs transition-colors ${
                    isSelected
                      ? 'bg-neutral-100 text-neutral-900 font-medium dark:bg-neutral-800 dark:text-neutral-100'
                      : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-neutral-800/50'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <IconRenderer icon={page.icon} className="w-4 h-4 shrink-0 text-neutral-600 dark:text-neutral-300" />
                    <span className="truncate">{page.title || 'Untitled'}</span>
                  </div>
                  {isSelected && <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
