import React, { useState, useRef, useEffect } from 'react';
import { Page, FontPreference } from '@/types/notion';
import {
  Menu,
  Star,
  MoreHorizontal,
  Download,
  X,
  RotateCcw,
  Sun,
  Moon,
  ChevronRight,
  Maximize2,
  Minimize2,
  FileText,
  Type,
} from 'lucide-react';
import { pageToMarkdown, downloadFile } from '@/utils/exportImport';
import { IconRenderer } from './common/IconRenderer';

interface TopNavProps {
  activePage: Page;
  pages: Page[];
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
  onToggleSidebar: () => void;
  onSelectPage: (id: string) => void;
  onUpdatePage: (updates: Partial<Page>) => void;
  onDeletePage: (id: string) => void;
  onResetWorkspace: () => void;
  onToggleTheme: () => void;
  onExportWorkspaceJson: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  activePage,
  pages,
  sidebarCollapsed,
  theme,
  onToggleSidebar,
  onSelectPage,
  onUpdatePage,
  onDeletePage,
  onResetWorkspace,
  onToggleTheme,
  onExportWorkspaceJson,
}) => {
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const fontMenuRef = useRef<HTMLDivElement>(null);

  // Find parent page if exists
  const parentPage = activePage.parentId ? pages.find((p) => p.id === activePage.parentId) : null;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
      if (fontMenuRef.current && !fontMenuRef.current.contains(e.target as Node)) {
        setShowFontMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExportMarkdown = () => {
    const md = pageToMarkdown(activePage);
    const filename = `${(activePage.title || 'Untitled').toLowerCase().replace(/\s+/g, '-')}.md`;
    downloadFile(filename, md, 'text/markdown');
    setShowMoreMenu(false);
  };

  const setFont = (font: FontPreference) => {
    onUpdatePage({ fontPreference: font });
    setShowFontMenu(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-11 w-full items-center justify-between border-b border-neutral-200/80 bg-white/90 px-3 backdrop-blur-md dark:border-neutral-800/80 dark:bg-neutral-900/90 text-xs">
      {/* Zone 1: Sidebar expander + Breadcrumbs */}
      <div className="flex items-center gap-1.5 overflow-hidden">
        {sidebarCollapsed && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="mr-1 rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            title="Expand sidebar (Ctrl+\)"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <div className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 truncate">
          {parentPage && (
            <>
              <button
                type="button"
                onClick={() => onSelectPage(parentPage.id)}
                className="hover:text-neutral-900 dark:hover:text-neutral-200 truncate max-w-[120px]"
              >
                <span className="flex items-center gap-1">
                  <IconRenderer icon={parentPage.icon} className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{parentPage.title || 'Untitled'}</span>
                </span>
              </button>
              <ChevronRight className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
            </>
          )}
          <span className="flex items-center gap-1 font-medium text-neutral-900 dark:text-neutral-100 truncate max-w-[180px]">
            <IconRenderer icon={activePage.icon} className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{activePage.title || 'Untitled'}</span>
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Actions */}
      <div className="flex items-center gap-1">
        {/* Favorite toggle */}
        <button
          type="button"
          onClick={() => onUpdatePage({ isFavorite: !activePage.isFavorite })}
          className={`rounded p-1.5 transition-colors ${
            activePage.isFavorite
              ? 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              : 'text-neutral-400 hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-neutral-800'
          }`}
          title={activePage.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star className={`w-3.5 h-3.5 ${activePage.isFavorite ? 'fill-amber-500' : ''}`} />
        </button>

        {/* Font Switcher */}
        <div className="relative" ref={fontMenuRef}>
          <button
            type="button"
            onClick={() => setShowFontMenu(!showFontMenu)}
            className="flex items-center gap-1 rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            title="Style & font"
          >
            <Type className="w-3.5 h-3.5" />
          </button>

          {showFontMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 w-44 rounded-lg border border-neutral-200 bg-white p-1.5 shadow-xl dark:border-neutral-700 dark:bg-neutral-800 text-xs">
              <div className="px-2 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                Typography
              </div>
              <button
                type="button"
                onClick={() => setFont('sans')}
                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left font-sans ${
                  (activePage.fontPreference || 'sans') === 'sans'
                    ? 'bg-neutral-100 dark:bg-neutral-700 font-semibold'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                }`}
              >
                <span>Default (Sans)</span>
                <span className="text-[10px] text-neutral-400">Ag</span>
              </button>
              <button
                type="button"
                onClick={() => setFont('serif')}
                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left font-serif ${
                  activePage.fontPreference === 'serif'
                    ? 'bg-neutral-100 dark:bg-neutral-700 font-semibold'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                }`}
              >
                <span>Serif</span>
                <span className="text-[10px] text-neutral-400 font-serif">Ag</span>
              </button>
              <button
                type="button"
                onClick={() => setFont('mono')}
                className={`flex w-full items-center justify-between rounded px-2.5 py-1.5 text-left font-mono ${
                  activePage.fontPreference === 'mono'
                    ? 'bg-neutral-100 dark:bg-neutral-700 font-semibold'
                    : 'hover:bg-neutral-50 dark:hover:bg-neutral-700/50'
                }`}
              >
                <span>Mono</span>
                <span className="text-[10px] text-neutral-400 font-mono">Ag</span>
              </button>
            </div>
          )}
        </div>

        {/* Full width toggle */}
        <button
          type="button"
          onClick={() => onUpdatePage({ isFullWidth: !activePage.isFullWidth })}
          className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          title={activePage.isFullWidth ? 'Standard width' : 'Full width'}
        >
          {activePage.isFullWidth ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>

        {/* Dark/Light Theme toggle */}
        <button
          type="button"
          onClick={onToggleTheme}
          className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
        </button>

        {/* More Options menu */}
        <div className="relative" ref={moreMenuRef}>
          <button
            type="button"
            onClick={() => setShowMoreMenu(!showMoreMenu)}
            className="rounded p-1.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
            title="More page actions"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMoreMenu && (
            <div className="absolute right-0 top-full mt-1 z-50 w-52 rounded-lg border border-neutral-200 bg-white py-1.5 shadow-xl dark:border-neutral-700 dark:bg-neutral-800 text-xs">
              <button
                type="button"
                onClick={handleExportMarkdown}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <Download className="w-3.5 h-3.5 text-neutral-400" />
                <span>Export as Markdown (.md)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onExportWorkspaceJson();
                  setShowMoreMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <FileText className="w-3.5 h-3.5 text-neutral-400" />
                <span>Export Workspace (JSON)</span>
              </button>

              <div className="my-1 border-t border-neutral-100 dark:border-neutral-700" />

              <button
                type="button"
                onClick={() => {
                  onResetWorkspace();
                  setShowMoreMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
              >
                <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
                <span>Reset to Sample Workspace</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onDeletePage(activePage.id);
                  setShowMoreMenu(false);
                }}
                className="flex w-full items-center gap-2.5 px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              >
                <X className="w-3.5 h-3.5" />
                <span>Move to Trash</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
