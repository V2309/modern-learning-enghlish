import React from 'react';
import { ChevronsLeft } from 'lucide-react';

interface SidebarHeaderProps {
  workspaceName?: string;
  workspaceInitial?: string;
  onToggleCollapse: () => void;
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  workspaceName = 'Workspace',
  workspaceInitial = 'W',
  onToggleCollapse,
}) => {
  return (
    <div className="flex items-center justify-between px-2 py-1.5 mb-2">
      <div className="flex items-center gap-2 truncate">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-neutral-900 text-white font-semibold text-xs shadow-xs dark:bg-neutral-100 dark:text-neutral-900">
          {workspaceInitial}
        </div>
        <span className="font-semibold text-xs text-neutral-800 dark:text-neutral-200 truncate">
          {workspaceName}
        </span>
      </div>

      <button
        type="button"
        onClick={onToggleCollapse}
        className="rounded p-1 text-neutral-400 hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200 cursor-pointer"
        title="Collapse sidebar"
      >
        <ChevronsLeft className="w-4 h-4" />
      </button>
    </div>
  );
};
