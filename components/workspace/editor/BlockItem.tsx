import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  ChevronRight,
  ChevronDown,
  Check,
  ExternalLink,
} from 'lucide-react';
import { Block, BlockType, NotionColor } from '@/types/notion';
import { IconRenderer } from '../common/IconRenderer';
import { BlockActionMenu } from './BlockActionMenu';
import { TableBlock } from './TableBlock';
import { CodeBlock } from './CodeBlock';

interface BlockItemProps {
  block: Block;
  index: number;
  listNumber?: number;
  isFirst: boolean;
  isLast: boolean;
  onUpdate: (updatedBlock: Block) => void;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onAddBelow: (id: string, type?: BlockType) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onTriggerSlash: (blockId: string, query: string, position: { top: number; left: number }) => void;
  onCloseSlash: () => void;
}

const COLOR_CLASSES: Record<NotionColor, { text: string; bg: string }> = {
  default: { text: 'text-neutral-800 dark:text-neutral-200', bg: 'bg-transparent' },
  gray: { text: 'text-neutral-500 dark:text-neutral-400', bg: 'bg-neutral-100 dark:bg-neutral-800' },
  brown: { text: 'text-amber-800 dark:text-amber-300', bg: 'bg-amber-50 dark:bg-amber-950/40' },
  orange: { text: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-950/40' },
  yellow: { text: 'text-yellow-700 dark:text-yellow-300', bg: 'bg-yellow-50 dark:bg-yellow-950/40' },
  green: { text: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-50 dark:bg-emerald-950/40' },
  blue: { text: 'text-blue-700 dark:text-blue-300', bg: 'bg-blue-50 dark:bg-blue-950/40' },
  purple: { text: 'text-purple-700 dark:text-purple-300', bg: 'bg-purple-50 dark:bg-purple-950/40' },
  pink: { text: 'text-pink-700 dark:text-pink-300', bg: 'bg-pink-50 dark:bg-pink-950/40' },
  red: { text: 'text-rose-700 dark:text-rose-300', bg: 'bg-rose-50 dark:bg-rose-950/40' },
};

export const BlockItem: React.FC<BlockItemProps> = ({
  block,
  index,
  listNumber = 1,
  isFirst,
  isLast,
  onUpdate,
  onDelete,
  onDuplicate,
  onAddBelow,
  onMoveUp,
  onMoveDown,
  onTriggerSlash,
  onCloseSlash,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea according to content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '0px';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.max(24, scrollHeight)}px`;
    }
  }, [block.content]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    onUpdate({ ...block, content: newContent });

    // Check for slash command
    if (newContent.endsWith('/')) {
      if (textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        onTriggerSlash(block.id, '', { top: rect.bottom + 4, left: rect.left });
      }
    } else if (newContent.includes('/')) {
      const parts = newContent.split('/');
      const lastPart = parts[parts.length - 1];
      if (!lastPart.includes(' ') && textareaRef.current) {
        const rect = textareaRef.current.getBoundingClientRect();
        onTriggerSlash(block.id, lastPart, { top: rect.bottom + 4, left: rect.left });
      }
    } else {
      onCloseSlash();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      if (block.type === 'code') return;
      e.preventDefault();
      onCloseSlash();
      onAddBelow(
        block.id,
        block.type === 'todo' || block.type === 'bulleted_list' || block.type === 'numbered_list'
          ? block.type
          : 'paragraph'
      );
    } else if (e.key === 'Backspace' && block.content === '') {
      if (block.type !== 'paragraph') {
        e.preventDefault();
        onUpdate({ ...block, type: 'paragraph' });
      } else if (!isFirst) {
        e.preventDefault();
        onDelete(block.id);
      }
    }
  };

  const handleTurnInto = (type: BlockType) => {
    onUpdate({ ...block, type });
  };

  const handleSetColor = (color: NotionColor, isBg = false) => {
    if (isBg) {
      onUpdate({ ...block, bgColor: color });
    } else {
      onUpdate({ ...block, color });
    }
  };

  const colorStyles = COLOR_CLASSES[block.color || 'default'];
  const bgStyles = block.bgColor && block.bgColor !== 'default' ? COLOR_CLASSES[block.bgColor].bg : '';

  return (
    <div
      className={`group relative flex items-start gap-1 py-1 rounded transition-colors ${
        bgStyles ? `${bgStyles} px-2.5 my-1` : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Action handle (Left hover controls) */}
      <div
        className={`absolute -left-12 top-1.5 flex items-center gap-0.5 transition-opacity ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={() => onAddBelow(block.id)}
          className="rounded p-1 text-neutral-400 hover:bg-neutral-200/70 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          title="Add block below"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>

        <BlockActionMenu
          block={block}
          index={index}
          isFirst={isFirst}
          isLast={isLast}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onMoveUp={onMoveUp}
          onMoveDown={onMoveDown}
          onTurnInto={handleTurnInto}
          onSetColor={handleSetColor}
        />
      </div>

      {/* Main Block Content */}
      <div className="flex-1 min-w-0">
        {block.type === 'paragraph' && (
          <textarea
            ref={textareaRef}
            rows={1}
            value={block.content}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder="Type '/' for commands..."
            className={`w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent text-sm md:text-base leading-relaxed outline-hidden focus:ring-0 ${colorStyles.text}`}
          />
        )}

        {block.type === 'heading_1' && (
          <h1 className={`text-2xl md:text-3xl font-bold tracking-tight font-heading ${colorStyles.text}`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Heading 1"
              className="w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent outline-hidden focus:ring-0"
            />
          </h1>
        )}

        {block.type === 'heading_2' && (
          <h2 className={`text-xl md:text-2xl font-semibold tracking-tight font-heading ${colorStyles.text}`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Heading 2"
              className="w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent outline-hidden focus:ring-0"
            />
          </h2>
        )}

        {block.type === 'heading_3' && (
          <h3 className={`text-base md:text-lg font-semibold tracking-tight font-heading ${colorStyles.text}`}>
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Heading 3"
              className="w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent outline-hidden focus:ring-0"
            />
          </h3>
        )}

        {block.type === 'todo' && (
          <div className="flex items-start gap-2.5">
            <button
              type="button"
              onClick={() => onUpdate({ ...block, checked: !block.checked })}
              className={`mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors cursor-pointer ${
                block.checked
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                  : 'border-neutral-300 hover:border-neutral-500 dark:border-neutral-600 dark:hover:border-neutral-400'
              }`}
            >
              {block.checked && <Check className="w-3 h-3 stroke-3" />}
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="To-do"
              className={`w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent text-sm md:text-base leading-relaxed outline-hidden focus:ring-0 ${
                block.checked ? 'line-through text-neutral-400 dark:text-neutral-500' : colorStyles.text
              }`}
            />
          </div>
        )}

        {block.type === 'bulleted_list' && (
          <div className="flex items-start gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-800 dark:bg-neutral-200" />
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="List item"
              className={`w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent text-sm md:text-base leading-relaxed outline-hidden focus:ring-0 ${colorStyles.text}`}
            />
          </div>
        )}

        {block.type === 'numbered_list' && (
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 text-sm font-medium text-neutral-500 tabular-nums">
              {listNumber}.
            </span>
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Numbered item"
              className={`w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent text-sm md:text-base leading-relaxed outline-hidden focus:ring-0 ${colorStyles.text}`}
            />
          </div>
        )}

        {block.type === 'toggle' && (
          <div>
            <div className="flex items-start gap-1">
              <button
                type="button"
                onClick={() => onUpdate({ ...block, isOpen: !block.isOpen })}
                className="mt-0.5 rounded p-0.5 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-800 dark:hover:bg-neutral-700 cursor-pointer"
              >
                {block.isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
              <textarea
                ref={textareaRef}
                rows={1}
                value={block.content}
                onChange={handleTextChange}
                onKeyDown={handleKeyDown}
                placeholder="Toggle header"
                className={`w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent font-medium text-sm md:text-base leading-relaxed outline-hidden focus:ring-0 ${colorStyles.text}`}
              />
            </div>
            {block.isOpen && (
              <div className="ml-6 mt-1 border-l-2 border-neutral-100 dark:border-neutral-800 pl-3 py-1">
                <textarea
                  rows={2}
                  value={block.meta?.toggleBody || ''}
                  onChange={(e) => {
                    e.target.style.height = '0px';
                    e.target.style.height = `${Math.max(32, e.target.scrollHeight)}px`;
                    onUpdate({
                      ...block,
                      meta: { ...block.meta, toggleBody: e.target.value },
                    });
                  }}
                  placeholder="Empty toggle. Write detailed notes here..."
                  className="w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 outline-hidden"
                />
              </div>
            )}
          </div>
        )}

        {block.type === 'quote' && (
          <div className="flex items-stretch gap-3 pl-3 border-l-3 border-neutral-800 dark:border-neutral-200">
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Empty quote"
              className={`w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent italic text-sm md:text-base leading-relaxed outline-hidden focus:ring-0 ${colorStyles.text}`}
            />
          </div>
        )}

        {block.type === 'callout' && (
          <div className="flex items-start gap-3 rounded-lg border border-neutral-200/80 bg-neutral-50/80 p-3 dark:border-neutral-700/80 dark:bg-neutral-800/60">
            <button
              type="button"
              onClick={() => {
                const newIcon = prompt(
                  'Enter a Lucide icon name (e.g. Lightbulb, Sparkles, Rocket, Zap, BookOpen):',
                  block.meta?.calloutIcon || 'Lightbulb'
                );
                if (newIcon) {
                  onUpdate({
                    ...block,
                    meta: { ...block.meta, calloutIcon: newIcon },
                  });
                }
              }}
              className="mt-0.5 hover:scale-110 transition-transform cursor-pointer"
              title="Click to change icon"
            >
              <IconRenderer
                icon={block.meta?.calloutIcon || 'Lightbulb'}
                className="w-5 h-5 text-amber-500"
              />
            </button>
            <textarea
              ref={textareaRef}
              rows={1}
              value={block.content}
              onChange={handleTextChange}
              onKeyDown={handleKeyDown}
              placeholder="Callout text..."
              className={`w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent text-sm leading-relaxed outline-hidden focus:ring-0 ${colorStyles.text}`}
            />
          </div>
        )}

        {block.type === 'code' && (
          <CodeBlock block={block} onUpdate={onUpdate} onKeyDown={handleKeyDown} />
        )}

        {block.type === 'divider' && (
          <div className="py-2">
            <hr className="border-t border-neutral-200 dark:border-neutral-700" />
          </div>
        )}

        {block.type === 'table' && (
          <TableBlock block={block} onUpdate={onUpdate} />
        )}

        {block.type === 'bookmark' && (
          <div className="group/bm flex items-center justify-between rounded-lg border border-neutral-200 p-3 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800/50 transition-colors">
            <div className="flex-1 pr-3">
              <input
                type="text"
                value={block.meta?.bookmarkTitle || 'Wikipedia: Modular Knowledge Systems'}
                onChange={(e) =>
                  onUpdate({
                    ...block,
                    meta: { ...block.meta, bookmarkTitle: e.target.value },
                  })
                }
                className="w-full bg-transparent font-medium text-xs text-neutral-800 dark:text-neutral-200 outline-hidden"
              />
              <input
                type="text"
                value={
                  block.meta?.bookmarkDesc ||
                  'The architectural philosophy of organizing personal thinking into modular software blocks.'
                }
                onChange={(e) =>
                  onUpdate({
                    ...block,
                    meta: { ...block.meta, bookmarkDesc: e.target.value },
                  })
                }
                className="w-full bg-transparent text-[11px] text-neutral-400 outline-hidden mt-0.5"
              />
              <div className="flex items-center gap-1 mt-1 text-[11px] text-blue-600 dark:text-blue-400">
                <input
                  type="text"
                  value={block.meta?.bookmarkUrl || 'https://en.wikipedia.org/wiki/Notion_(productivity_software)'}
                  onChange={(e) =>
                    onUpdate({
                      ...block,
                      meta: { ...block.meta, bookmarkUrl: e.target.value },
                    })
                  }
                  className="bg-transparent outline-hidden text-[11px] w-64"
                />
              </div>
            </div>
            <a
              href={block.meta?.bookmarkUrl || '#'}
              target="_blank"
              rel="noreferrer"
              className="rounded p-2 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
