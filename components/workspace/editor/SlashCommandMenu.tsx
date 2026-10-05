import React, { useEffect, useRef } from 'react';
import {
  Type,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  ListOrdered,
  ChevronRight,
  Quote,
  Minus,
  AlertCircle,
  Code2,
  Table as TableIcon,
  Bookmark,
  LayoutGrid,
} from 'lucide-react';
import { BlockType } from '@/types/notion';

export interface CommandItem {
  id: string;
  type: BlockType | 'database';
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'Basic' | 'Lists' | 'Advanced';
}

const COMMAND_ITEMS: CommandItem[] = [
  {
    id: 'text',
    type: 'paragraph',
    title: 'Text',
    description: 'Just start writing with plain text.',
    icon: <Type className="w-4 h-4 text-neutral-600" />,
    category: 'Basic',
  },
  {
    id: 'h1',
    type: 'heading_1',
    title: 'Heading 1',
    description: 'Big section heading.',
    icon: <Heading1 className="w-4 h-4 text-neutral-600" />,
    category: 'Basic',
  },
  {
    id: 'h2',
    type: 'heading_2',
    title: 'Heading 2',
    description: 'Medium section heading.',
    icon: <Heading2 className="w-4 h-4 text-neutral-600" />,
    category: 'Basic',
  },
  {
    id: 'h3',
    type: 'heading_3',
    title: 'Heading 3',
    description: 'Small section heading.',
    icon: <Heading3 className="w-4 h-4 text-neutral-600" />,
    category: 'Basic',
  },
  {
    id: 'todo',
    type: 'todo',
    title: 'To-do list',
    description: 'Track tasks with a to-do list.',
    icon: <CheckSquare className="w-4 h-4 text-neutral-600" />,
    category: 'Lists',
  },
  {
    id: 'bullet',
    type: 'bulleted_list',
    title: 'Bulleted list',
    description: 'Create a simple bulleted list.',
    icon: <List className="w-4 h-4 text-neutral-600" />,
    category: 'Lists',
  },
  {
    id: 'number',
    type: 'numbered_list',
    title: 'Numbered list',
    description: 'Create a list with numbering.',
    icon: <ListOrdered className="w-4 h-4 text-neutral-600" />,
    category: 'Lists',
  },
  {
    id: 'toggle',
    type: 'toggle',
    title: 'Toggle list',
    description: 'Toggles can show and hide content.',
    icon: <ChevronRight className="w-4 h-4 text-neutral-600" />,
    category: 'Lists',
  },
  {
    id: 'quote',
    type: 'quote',
    title: 'Quote',
    description: 'Capture a quote or emphasis.',
    icon: <Quote className="w-4 h-4 text-neutral-600" />,
    category: 'Basic',
  },
  {
    id: 'divider',
    type: 'divider',
    title: 'Divider',
    description: 'Visually divide blocks with a line.',
    icon: <Minus className="w-4 h-4 text-neutral-600" />,
    category: 'Basic',
  },
  {
    id: 'callout',
    type: 'callout',
    title: 'Callout',
    description: 'Make writing stand out with an icon.',
    icon: <AlertCircle className="w-4 h-4 text-neutral-600" />,
    category: 'Basic',
  },
  {
    id: 'code',
    type: 'code',
    title: 'Code block',
    description: 'Capture a code snippet with syntax styling.',
    icon: <Code2 className="w-4 h-4 text-neutral-600" />,
    category: 'Advanced',
  },
  {
    id: 'table',
    type: 'table',
    title: 'Table',
    description: 'Add a simple structured matrix of rows & cols.',
    icon: <TableIcon className="w-4 h-4 text-neutral-600" />,
    category: 'Advanced',
  },
  {
    id: 'bookmark',
    type: 'bookmark',
    title: 'Web Bookmark',
    description: 'Add a visual web link card.',
    icon: <Bookmark className="w-4 h-4 text-neutral-600" />,
    category: 'Advanced',
  },
  {
    id: 'database',
    type: 'database',
    title: 'Database / Kanban Board',
    description: 'Turn this page or embed an interactive database.',
    icon: <LayoutGrid className="w-4 h-4 text-neutral-600" />,
    category: 'Advanced',
  },
];

interface SlashCommandMenuProps {
  filterText: string;
  onSelect: (type: BlockType | 'database') => void;
  onClose: () => void;
  position?: { top: number; left: number };
}

export const SlashCommandMenu: React.FC<SlashCommandMenuProps> = ({
  filterText,
  onSelect,
  onClose,
  position,
}) => {
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const menuRef = useRef<HTMLDivElement>(null);

  const cleanFilter = filterText.replace('/', '').toLowerCase().trim();

  const filteredItems = COMMAND_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(cleanFilter) ||
      item.description.toLowerCase().includes(cleanFilter) ||
      item.id.toLowerCase().includes(cleanFilter)
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [cleanFilter]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelect(filteredItems[selectedIndex].type);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filteredItems, selectedIndex, onSelect, onClose]);

  // Handle outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  if (filteredItems.length === 0) {
    return (
      <div
        ref={menuRef}
        className="z-50 w-72 rounded-lg border border-neutral-200 bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-800 text-xs text-neutral-500"
      >
        No matching blocks found for &quot;{cleanFilter}&quot;
      </div>
    );
  }

  return (
    <div
      ref={menuRef}
      className="z-[9999] w-76 max-h-[calc(100vh-32px)] overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1.5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 animate-in fade-in zoom-in-95 duration-100"
      style={
        position
          ? {
              position: 'fixed',
              top: `${Math.max(16, Math.min(position.top, window.innerHeight - 340))}px`,
              left: `${Math.max(16, Math.min(position.left, window.innerWidth - 320))}px`,
            }
          : undefined
      }
    >
      <div className="px-3 py-1 text-[11px] font-medium text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">
        Basic blocks
      </div>
      {filteredItems.map((item, index) => {
        const isSelected = index === selectedIndex;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.type)}
            onMouseEnter={() => setSelectedIndex(index)}
            className={`flex w-full items-center gap-3 px-3 py-1.5 text-left transition-colors ${
              isSelected
                ? 'bg-neutral-100 text-neutral-900 dark:bg-neutral-700 dark:text-neutral-100'
                : 'text-neutral-700 hover:bg-neutral-50 dark:text-neutral-300 dark:hover:bg-neutral-700/50'
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded border border-neutral-200 bg-white shadow-xs dark:border-neutral-600 dark:bg-neutral-700">
              {item.icon}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium truncate">{item.title}</span>
              <span className="text-[11px] text-neutral-400 dark:text-neutral-400 truncate">
                {item.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
