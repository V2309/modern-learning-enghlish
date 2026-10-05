import React from 'react';
import { Search, Settings, X } from 'lucide-react';

interface SidebarNavProps {
  archivedPagesCount: number;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  onOpenTrash: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  archivedPagesCount,
  onOpenSearch,
  onOpenSettings,
  onOpenTrash,
}) => {
  return (
    <div className="space-y-0.5 pb-2">
      <button
        type="button"
        onClick={onOpenSearch}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200/50 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <Search className="w-3.5 h-3.5" />
          <span>Search</span>
        </div>
        <span className="text-[10px] text-neutral-400 border border-neutral-200 dark:border-neutral-700 rounded px-1">
          ⌘K
        </span>
      </button>

      <button
        type="button"
        onClick={onOpenSettings}
        className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200/50 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
      >
        <Settings className="w-3.5 h-3.5" />
        <span>Settings</span>
      </button>

      <button
        type="button"
        onClick={onOpenTrash}
        className="flex w-full items-center justify-between rounded-md px-2 py-1.5 text-xs text-neutral-600 hover:bg-neutral-200/50 dark:text-neutral-400 dark:hover:bg-neutral-800 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <X className="w-3.5 h-3.5" />
          <span>Trash</span>
        </div>
        {archivedPagesCount > 0 && (
          <span className="text-[10px] bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 rounded-full px-1.5 py-0.2">
            {archivedPagesCount}
          </span>
        )}
      </button>
    </div>
  );
};
