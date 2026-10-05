import React from 'react';
import { createPortal } from 'react-dom';
import { Page } from '@/types/notion';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Star,
  Copy,
  X,
} from 'lucide-react';
import { IconRenderer } from '../common/IconRenderer';

interface SidebarPageItemProps {
  page: Page;
  level?: number;
  activePageId: string;
  expandedPages: Record<string, boolean>;
  activeMenuPageId: string | null;
  allActivePages: Page[];
  onSelectPage: (id: string) => void;
  onToggleExpand: (id: string, e: React.MouseEvent) => void;
  onSetActiveMenuPageId: (id: string | null) => void;
  onAddPage: (parentId?: string | null) => void;
  onDuplicatePage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onToggleFavorite: (id: string) => void;
}

export const SidebarPageItem: React.FC<SidebarPageItemProps> = ({
  page,
  level = 0,
  activePageId,
  expandedPages,
  activeMenuPageId,
  allActivePages,
  onSelectPage,
  onToggleExpand,
  onSetActiveMenuPageId,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onToggleFavorite,
}) => {
  const subPages = allActivePages.filter((p) => p.parentId === page.id);
  const hasSubPages = subPages.length > 0;
  const isExpanded = !!expandedPages[page.id];
  const isActive = page.id === activePageId;
  const isMenuOpen = activeMenuPageId === page.id;

  const buttonRef = React.useRef<HTMLButtonElement>(null);
  const menuRef = React.useRef<HTMLDivElement>(null);
  const [menuPosition, setMenuPosition] = React.useState<{ top: number; left: number } | null>(null);

  const handleToggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();

    if (isMenuOpen) {
      onSetActiveMenuPageId(null);
      setMenuPosition(null);
    } else {
      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const menuHeight = 135;
        const willOverflowBottom = rect.bottom + menuHeight > window.innerHeight;
        const top = willOverflowBottom ? Math.max(10, rect.top - menuHeight - 4) : rect.bottom + 4;
        const left = Math.max(8, rect.right - 215);

        setMenuPosition({ top, left });
      }
      onSetActiveMenuPageId(page.id);
    }
  };

  React.useEffect(() => {
    if (!isMenuOpen) return;
    const handleClose = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(e.target as Node)
      ) {
        onSetActiveMenuPageId(null);
        setMenuPosition(null);
      }
    };
    const handleScrollOrResize = () => {
      onSetActiveMenuPageId(null);
      setMenuPosition(null);
    };

    document.addEventListener('mousedown', handleClose);
    window.addEventListener('scroll', handleScrollOrResize, true);
    window.addEventListener('resize', handleScrollOrResize);
    return () => {
      document.removeEventListener('mousedown', handleClose);
      window.removeEventListener('scroll', handleScrollOrResize, true);
      window.removeEventListener('resize', handleScrollOrResize);
    };
  }, [isMenuOpen, onSetActiveMenuPageId]);

  return (
    <div className="w-full">
      <div
        onClick={() => onSelectPage(page.id)}
        className={`group/item relative flex items-center justify-between rounded-md py-1.5 px-2 text-xs font-medium transition-colors cursor-pointer ${
          isMenuOpen ? 'bg-neutral-200/50 dark:bg-neutral-800/80' : ''
        } ${
          isActive
            ? 'bg-neutral-200/70 text-neutral-900 font-semibold dark:bg-neutral-800 dark:text-neutral-100'
            : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800/60 dark:hover:text-neutral-200'
        }`}
        style={{ paddingLeft: `${Math.max(8, level * 16 + 8)}px` }}
      >
        <div className="flex items-center gap-1.5 overflow-hidden">
          {/* Expand / Collapse arrow */}
          {hasSubPages ? (
            <button
              type="button"
              onClick={(e) => onToggleExpand(page.id, e)}
              className="rounded p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 cursor-pointer"
            >
              {isExpanded ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>
          ) : (
            <span className="w-3.5 h-3.5 shrink-0" />
          )}

          <IconRenderer
            icon={page.icon}
            className="w-4 h-4 shrink-0 text-neutral-600 dark:text-neutral-300"
          />
          <span className="truncate">{page.title || 'Untitled'}</span>
          {page.isFavorite && (
            <Star className="w-3 h-3 shrink-0 text-amber-400 fill-amber-400 ml-0.5 opacity-80" />
          )}
        </div>

        {/* Hover Action controls */}
        <div
          className={`flex items-center gap-0.5 opacity-0 group-hover/item:opacity-100 transition-opacity ${
            isMenuOpen ? 'opacity-100' : ''
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddPage(page.id);
            }}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 cursor-pointer"
            title="Add sub-page inside"
          >
            <Plus className="w-3 h-3" />
          </button>

          <div className="relative">
            <button
              ref={buttonRef}
              type="button"
              onClick={handleToggleMenu}
              className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 cursor-pointer"
              title="More options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Dropdown Menu Portaled to Body (Immune to scroll container clipping & z-index collisions) */}
      {isMenuOpen && menuPosition && typeof document !== 'undefined' && createPortal(
        <div
          ref={menuRef}
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
            zIndex: 99999,
            width: '215px',
          }}
          className="rounded-lg border border-neutral-200/90 bg-white p-1 shadow-2xl dark:border-neutral-700/80 dark:bg-[#202020] text-xs font-normal text-neutral-700 dark:text-neutral-200 select-none animate-in fade-in zoom-in-95 duration-100"
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(page.id);
              onSetActiveMenuPageId(null);
              setMenuPosition(null);
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700/70 cursor-pointer whitespace-nowrap transition-colors"
          >
            <Star className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>{page.isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}</span>
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDuplicatePage(page.id);
              onSetActiveMenuPageId(null);
              setMenuPosition(null);
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700/70 cursor-pointer whitespace-nowrap transition-colors"
          >
            <Copy className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span>Nhân bản trang (Duplicate)</span>
          </button>
          <div className="my-1 border-t border-neutral-100 dark:border-neutral-700/80" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeletePage(page.id);
              onSetActiveMenuPageId(null);
              setMenuPosition(null);
            }}
            className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer whitespace-nowrap transition-colors"
          >
            <X className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span>Xóa trang (Delete)</span>
          </button>
        </div>,
        document.body
      )}

      {/* Nested Sub-pages */}
      {hasSubPages && isExpanded && (
        <div className="space-y-0.5">
          {subPages.map((subPage) => (
            <SidebarPageItem
              key={subPage.id}
              page={subPage}
              level={level + 1}
              activePageId={activePageId}
              expandedPages={expandedPages}
              activeMenuPageId={activeMenuPageId}
              allActivePages={allActivePages}
              onSelectPage={onSelectPage}
              onToggleExpand={onToggleExpand}
              onSetActiveMenuPageId={onSetActiveMenuPageId}
              onAddPage={onAddPage}
              onDuplicatePage={onDuplicatePage}
              onDeletePage={onDeletePage}
              onToggleFavorite={onToggleFavorite}
            />
          ))}
        </div>
      )}
    </div>
  );
};
