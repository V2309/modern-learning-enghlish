export type BlockType =
  | 'text'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'todo'
  | 'bullet'
  | 'number'
  | 'toggle'
  | 'callout'
  | 'quote'
  | 'divider'
  | 'code';

export interface WorkspaceBlock {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // for todo
  calloutIcon?: string; // emoji icon for callout
  codeLanguage?: string;
  isOpen?: boolean; // for toggle list
  toggleContent?: string;
}

export interface WorkspacePage {
  id: string;
  title: string;
  icon: string;
  coverUrl?: string | null;
  parentId: string | null; // null for top-level pages
  createdAt: string;
  updatedAt: string;
  isFavorite?: boolean;
  isLocked?: boolean;
  blocks: WorkspaceBlock[];
}

export interface WorkspaceState {
  pages: WorkspacePage[];
  activePageId: string;
  expandedPageIds: string[];
  sidebarCollapsed: boolean;
  searchQuery: string;
}
