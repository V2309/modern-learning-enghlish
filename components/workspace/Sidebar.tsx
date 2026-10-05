import React, { useState } from 'react';
import { Page } from '@/types/notion';
import { Plus } from 'lucide-react';
import {
  SidebarHeader,
  SidebarNav,
  SidebarPageItem,
} from './navigation';

interface SidebarProps {
  pages: Page[];
  activePageId: string;
  isCollapsed: boolean;
  workspaceName?: string;
  workspaceInitial?: string;
  onToggleCollapse: () => void;
  onSelectPage: (id: string) => void;
  onAddPage: (parentId?: string | null) => void;
  onDuplicatePage: (id: string) => void;
  onDeletePage: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onOpenSearch: () => void;
  onOpenTrash: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  pages,
  activePageId,
  isCollapsed,
  workspaceName,
  workspaceInitial,
  onToggleCollapse,
  onSelectPage,
  onAddPage,
  onDuplicatePage,
  onDeletePage,
  onToggleFavorite,
  onOpenSearch,
  onOpenTrash,
  onOpenSettings,
}) => {
  const [expandedPages, setExpandedPages] = useState<Record<string, boolean>>({
    'page-second-brain': true,
  });
  const [activeMenuPageId, setActiveMenuPageId] = useState<string | null>(null);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedPages((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activePages = pages.filter((p) => !p.isArchived);
  const favoritePages = activePages.filter((p) => p.isFavorite);
  const topLevelPages = activePages.filter((p) => !p.parentId);
  const archivedPagesCount = pages.filter((p) => p.isArchived).length;

  if (isCollapsed) return null;

  return (
    <aside className="relative flex h-full w-64 md:w-68 flex-col border-r border-neutral-200 bg-[#FBFBFA] p-3 select-none dark:border-neutral-800 dark:bg-[#191919] shrink-0">
      {/* Workspace Header */}
      <SidebarHeader
        workspaceName={workspaceName || 'Workspace'}
        workspaceInitial={workspaceInitial || 'W'}
        onToggleCollapse={onToggleCollapse}
      />

      {/* Quick Nav Tools */}
      <SidebarNav
        archivedPagesCount={archivedPagesCount}
        onOpenSearch={onOpenSearch}
        onOpenSettings={onOpenSettings}
        onOpenTrash={onOpenTrash}
      />

      <div className="my-1 border-t border-neutral-200 dark:border-neutral-800" />

      {/* Unified Pages Section */}
      <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
        {/* Favorites section (re-using the same SidebarPageItem component) */}
        {favoritePages.length > 0 && (
          <div className="flex flex-col">
            <div className="flex items-center justify-between px-2 py-1 sticky top-0 bg-[#FBFBFA] dark:bg-[#191919] z-10">
              <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                Favorites
              </span>
            </div>
            <div className="space-y-0.5">
              {favoritePages.map((page) => (
                <SidebarPageItem
                  key={`fav-${page.id}`}
                  page={page}
                  activePageId={activePageId}
                  expandedPages={expandedPages}
                  activeMenuPageId={activeMenuPageId}
                  allActivePages={activePages}
                  onSelectPage={onSelectPage}
                  onToggleExpand={toggleExpand}
                  onSetActiveMenuPageId={setActiveMenuPageId}
                  onAddPage={onAddPage}
                  onDuplicatePage={onDuplicatePage}
                  onDeletePage={onDeletePage}
                  onToggleFavorite={onToggleFavorite}
                />
              ))}
            </div>
          </div>
        )}

        {/* Workspace Pages Tree */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-2 py-1 sticky top-0 bg-[#FBFBFA] dark:bg-[#191919] z-10">
            <span className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              Workspace
            </span>
            <button
              type="button"
              onClick={() => onAddPage(null)}
              className="rounded p-0.5 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-800 cursor-pointer"
              title="Add page"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {topLevelPages.map((page) => (
              <SidebarPageItem
                key={page.id}
                page={page}
                activePageId={activePageId}
                expandedPages={expandedPages}
                activeMenuPageId={activeMenuPageId}
                allActivePages={activePages}
                onSelectPage={onSelectPage}
                onToggleExpand={toggleExpand}
                onSetActiveMenuPageId={setActiveMenuPageId}
                onAddPage={onAddPage}
                onDuplicatePage={onDuplicatePage}
                onDeletePage={onDeletePage}
                onToggleFavorite={onToggleFavorite}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Action: + New Page */}
      <div className="pt-2 border-t border-neutral-200 dark:border-neutral-800">
        <button
          type="button"
          onClick={() => onAddPage(null)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100 transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New page</span>
        </button>
      </div>
    </aside>
  );
};
