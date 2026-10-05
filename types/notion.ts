export type BlockType =
  | 'paragraph'
  | 'heading_1'
  | 'heading_2'
  | 'heading_3'
  | 'todo'
  | 'bulleted_list'
  | 'numbered_list'
  | 'toggle'
  | 'quote'
  | 'callout'
  | 'code'
  | 'divider'
  | 'table'
  | 'bookmark'
  | 'math';

export type NotionColor =
  | 'default'
  | 'gray'
  | 'brown'
  | 'orange'
  | 'yellow'
  | 'green'
  | 'blue'
  | 'purple'
  | 'pink'
  | 'red';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  checked?: boolean; // For todo
  isOpen?: boolean; // For toggle
  children?: Block[]; // For nested blocks in toggle or lists
  color?: NotionColor;
  bgColor?: NotionColor;
  meta?: {
    language?: string; // For code
    calloutIcon?: string; // For callout
    tableData?: string[][]; // For table: rows & columns
    bookmarkUrl?: string;
    bookmarkTitle?: string;
    bookmarkDesc?: string;
    toggleBody?: string;
  };
}

export type PropertyType =
  | 'text'
  | 'select'
  | 'multi_select'
  | 'status'
  | 'date'
  | 'checkbox'
  | 'priority'
  | 'number';

export interface SelectOption {
  id: string;
  label: string;
  color: string; // Tailwind color token or hex
}

export interface DatabaseProperty {
  id: string;
  name: string;
  type: PropertyType;
  options?: SelectOption[];
}

export interface DatabaseItem {
  id: string;
  title: string;
  icon?: string;
  cover?: string;
  properties: Record<string, any>;
  pageContent?: Block[];
  createdAt: number;
  updatedAt: number;
}

export type DatabaseViewType = 'table' | 'board' | 'calendar' | 'gallery' | 'list';

export interface DatabaseView {
  id: string;
  name: string;
  type: DatabaseViewType;
  filterStatus?: string;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface DatabaseConfig {
  id: string;
  title: string;
  properties: DatabaseProperty[];
  items: DatabaseItem[];
  views: DatabaseView[];
  activeViewId: string;
}

export interface PageCover {
  type: 'gradient' | 'color' | 'unsplash' | 'preset';
  value: string;
}

export type FontPreference = 'sans' | 'serif' | 'mono';

export interface Page {
  id: string;
  parentId: string | null;
  title: string;
  icon?: string;
  cover?: PageCover | null;
  isFavorite: boolean;
  isArchived: boolean;
  createdAt: number;
  updatedAt: number;
  blocks?: Block[];
  isDatabase?: boolean;
  database?: DatabaseConfig;
  fontPreference?: FontPreference;
  isFullWidth?: boolean;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  ownerEmail: string;
  pages: Page[];
  activePageId: string;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
}
