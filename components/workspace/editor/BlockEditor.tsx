import React, { useState, useMemo } from 'react';
import { Block, BlockType, NotionColor } from '@/types/notion';
import { BlockItem } from './BlockItem';
import { SlashCommandMenu } from './SlashCommandMenu';
import { FloatingToolbar } from './FloatingToolbar';
import { Plus } from 'lucide-react';

interface BlockEditorProps {
  blocks: Block[];
  onChange: (blocks: Block[]) => void;
  onConvertToDatabase?: () => void;
}

export const BlockEditor: React.FC<BlockEditorProps> = ({
  blocks,
  onChange,
  onConvertToDatabase,
}) => {
  const [slashMenu, setSlashMenu] = useState<{
    isOpen: boolean;
    blockId: string;
    query: string;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    blockId: '',
    query: '',
    position: { top: 0, left: 0 },
  });

  const [floatingToolbar, setFloatingToolbar] = useState<{
    isOpen: boolean;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    position: { top: 0, left: 0 },
  });

  // Handle selection for floating toolbar
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setFloatingToolbar({
        isOpen: true,
        position: { top: rect.top, left: rect.left + rect.width / 2 - 100 },
      });
    } else {
      setFloatingToolbar((prev) => ({ ...prev, isOpen: false }));
    }
  };

  const handleUpdateBlock = (updatedBlock: Block) => {
    const newBlocks = blocks.map((b) => (b.id === updatedBlock.id ? updatedBlock : b));
    onChange(newBlocks);
  };

  const handleDeleteBlock = (id: string) => {
    if (blocks.length <= 1) {
      // Keep at least one empty block
      onChange([{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }]);
      return;
    }
    const newBlocks = blocks.filter((b) => b.id !== id);
    onChange(newBlocks);
  };

  const handleDuplicateBlock = (id: string) => {
    const index = blocks.findIndex((b) => b.id === id);
    if (index === -1) return;
    const target = blocks[index];
    const duplicated: Block = {
      ...JSON.parse(JSON.stringify(target)),
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    };
    const newBlocks = [...blocks];
    newBlocks.splice(index + 1, 0, duplicated);
    onChange(newBlocks);
  };

  const handleAddBelow = (id: string, type: BlockType = 'paragraph') => {
    const index = blocks.findIndex((b) => b.id === id);
    const newBlock: Block = {
      id: `b-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      content: '',
      meta:
        type === 'callout'
          ? { calloutIcon: '💡' }
          : type === 'code'
          ? { language: 'typescript' }
          : type === 'table'
          ? {
              tableData: [
                ['Column 1', 'Column 2', 'Column 3'],
                ['', '', ''],
                ['', '', ''],
              ],
            }
          : undefined,
    };

    if (index === -1) {
      onChange([...blocks, newBlock]);
    } else {
      const newBlocks = [...blocks];
      newBlocks.splice(index + 1, 0, newBlock);
      onChange(newBlocks);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index <= 0) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index - 1];
    newBlocks[index - 1] = newBlocks[index];
    newBlocks[index] = temp;
    onChange(newBlocks);
  };

  const handleMoveDown = (index: number) => {
    if (index >= blocks.length - 1) return;
    const newBlocks = [...blocks];
    const temp = newBlocks[index + 1];
    newBlocks[index + 1] = newBlocks[index];
    newBlocks[index] = temp;
    onChange(newBlocks);
  };

  const handleTriggerSlash = (blockId: string, query: string, position: { top: number; left: number }) => {
    setSlashMenu({
      isOpen: true,
      blockId,
      query,
      position,
    });
  };

  const handleSelectSlashCommand = (type: BlockType | 'database') => {
    if (type === 'database') {
      if (onConvertToDatabase) {
        onConvertToDatabase();
      }
      setSlashMenu((prev) => ({ ...prev, isOpen: false }));
      return;
    }

    const targetIndex = blocks.findIndex((b) => b.id === slashMenu.blockId);
    if (targetIndex !== -1) {
      const block = blocks[targetIndex];
      // Clean trailing slash
      const cleanContent = block.content.replace(/\/[a-zA-Z0-9]*$/, '').trim();

      const updated: Block = {
        ...block,
        type,
        content: cleanContent,
        meta:
          type === 'callout'
            ? { calloutIcon: '💡' }
            : type === 'code'
            ? { language: 'typescript' }
            : type === 'table'
            ? {
                tableData: [
                  ['Column 1', 'Column 2', 'Column 3'],
                  ['', '', ''],
                  ['', '', ''],
                ],
              }
            : undefined,
      };

      const newBlocks = [...blocks];
      newBlocks[targetIndex] = updated;
      onChange(newBlocks);
    }
    setSlashMenu((prev) => ({ ...prev, isOpen: false }));
  };

  const handleApplyFormat = (format: 'bold' | 'italic' | 'strike' | 'code' | 'link', value?: string) => {
    document.execCommand(
      format === 'bold'
        ? 'bold'
        : format === 'italic'
        ? 'italic'
        : format === 'strike'
        ? 'strikeThrough'
        : format === 'link'
        ? 'createLink'
        : 'insertHTML',
      false,
      value
    );
    setFloatingToolbar((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSetColor = (color: NotionColor, isBg = false) => {
    // Apply to current selection or active block
    setFloatingToolbar((prev) => ({ ...prev, isOpen: false }));
  };

  // Consecutive numbering for numbered_list blocks (resets to 1 after non-numbered blocks)
  const listNumbers = useMemo(() => {
    let count = 0;
    return blocks.map((block, idx) => {
      if (block.type === 'numbered_list') {
        const prev = idx > 0 ? blocks[idx - 1] : null;
        if (prev && prev.type === 'numbered_list') {
          count += 1;
        } else {
          count = 1;
        }
        return count;
      }
      count = 0;
      return 0;
    });
  }, [blocks]);

  return (
    <div className="relative min-h-[300px] w-full" onMouseUp={handleMouseUp}>
      {blocks.length === 0 ? (
        <button
          type="button"
          onClick={() => handleAddBelow('', 'paragraph')}
          className="flex items-center gap-2 text-sm text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 py-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Click to start writing or type &apos;/&apos; for commands...</span>
        </button>
      ) : (
        <div className="space-y-0.5">
          {blocks.map((block, idx) => (
            <BlockItem
              key={block.id}
              block={block}
              index={idx}
              listNumber={listNumbers[idx]}
              isFirst={idx === 0}
              isLast={idx === blocks.length - 1}
              onUpdate={handleUpdateBlock}
              onDelete={handleDeleteBlock}
              onDuplicate={handleDuplicateBlock}
              onAddBelow={handleAddBelow}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onTriggerSlash={handleTriggerSlash}
              onCloseSlash={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
            />
          ))}
        </div>
      )}

      {/* Quick Add at bottom */}
      <div className="mt-4 pt-2">
        <button
          type="button"
          onClick={() => handleAddBelow(blocks[blocks.length - 1]?.id || '', 'paragraph')}
          className="group flex items-center gap-1.5 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors"
        >
          <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span>New line</span>
        </button>
      </div>

      {/* Slash Command Overlay */}
      {slashMenu.isOpen && (
        <SlashCommandMenu
          filterText={slashMenu.query}
          position={slashMenu.position}
          onSelect={handleSelectSlashCommand}
          onClose={() => setSlashMenu((prev) => ({ ...prev, isOpen: false }))}
        />
      )}

      {/* Floating Toolbar */}
      {floatingToolbar.isOpen && (
        <FloatingToolbar
          position={floatingToolbar.position}
          onApplyFormat={handleApplyFormat}
          onSetColor={handleSetColor}
          onClose={() => setFloatingToolbar((prev) => ({ ...prev, isOpen: false }))}
        />
      )}
    </div>
  );
};
