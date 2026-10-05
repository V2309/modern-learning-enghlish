import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  GripVertical,
  X,
  Copy,
  ChevronRight,
  Type,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare,
  List,
  ListOrdered,
  Quote,
  AlertCircle,
  Code2,
  ArrowUp,
  ArrowDown,
  Palette,
} from 'lucide-react';
import { Block, BlockType, NotionColor } from '@/types/notion';

interface BlockActionMenuProps {
  block: Block;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  onDelete: (id: string) => void;
  onDuplicate: (id: string) => void;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onTurnInto: (type: BlockType) => void;
  onSetColor: (color: NotionColor, isBg?: boolean) => void;
}

const NOTION_COLORS: NotionColor[] = [
  'default',
  'gray',
  'brown',
  'orange',
  'yellow',
  'green',
  'blue',
  'purple',
  'pink',
  'red',
];

export const BlockActionMenu: React.FC<BlockActionMenuProps> = ({
  block,
  index,
  isFirst,
  isLast,
  onDelete,
  onDuplicate,
  onMoveUp,
  onMoveDown,
  onTurnInto,
  onSetColor,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number; visible: boolean }>({
    top: 0,
    left: 0,
    visible: false,
  });
  const [showColorSubmenu, setShowColorSubmenu] = useState(false);
  const [colorSubmenuPos, setColorSubmenuPos] = useState<{ top: number; left: number } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const colorRowRef = useRef<HTMLDivElement>(null);
  const colorCloseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingRectRef = useRef<DOMRect | null>(null);

  // Esc key closes menu
  useEffect(() => {
    if (!showMenu) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowMenu(false);
        setShowColorSubmenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showMenu]);

  // Click outside to close menu
  useEffect(() => {
    if (!showMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setShowMenu(false);
        setShowColorSubmenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  const handleToggleMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (showMenu) {
      setShowMenu(false);
      setShowColorSubmenu(false);
      return;
    }

    // Store button rect and trigger measurement in useEffect
    pendingRectRef.current = e.currentTarget.getBoundingClientRect();
    setMenuPosition({ top: -9999, left: -9999, visible: false });
    setShowMenu(true);
  };

  // Measure real height & compute final clamped position
  useEffect(() => {
    if (!showMenu || !menuRef.current || !pendingRectRef.current) return;
    if (menuPosition.visible) return;

    const rect = pendingRectRef.current;
    const menuEl = menuRef.current;
    const menuWidth = menuEl.offsetWidth || 220;
    const menuHeight = menuEl.offsetHeight || 300;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const MARGIN = 8;

    let left = rect.right + 6;
    if (left + menuWidth > vw - MARGIN) {
      left = Math.max(MARGIN, rect.left - menuWidth - 6);
    }

    const spaceBelow = vh - rect.top - MARGIN;
    const spaceAbove = rect.bottom - MARGIN;
    let top: number;

    if (spaceBelow >= menuHeight) {
      top = Math.max(MARGIN, rect.top);
    } else if (spaceAbove >= menuHeight) {
      top = rect.bottom - menuHeight;
    } else {
      if (spaceBelow >= spaceAbove) {
        top = Math.max(MARGIN, rect.top);
      } else {
        top = Math.max(MARGIN, rect.bottom - menuHeight);
      }
    }

    top = Math.min(top, vh - menuHeight - MARGIN);
    top = Math.max(top, MARGIN);

    setMenuPosition({ top, left, visible: true });
  }, [showMenu, menuPosition.visible]);

  const handleTurnInto = (type: BlockType) => {
    onTurnInto(type);
    setShowMenu(false);
  };

  const handleSetColor = (color: NotionColor, isBg = false) => {
    onSetColor(color, isBg);
    setShowMenu(false);
    setShowColorSubmenu(false);
  };

  return (
    <div>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggleMenu}
        className="rounded p-1 text-neutral-400 hover:bg-neutral-200/70 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200 cursor-grab"
        title="Drag or click for block menu"
      >
        <GripVertical className="w-3.5 h-3.5" />
      </button>

      {showMenu && (
        <>
          {/* Transparent backdrop */}
          <div
            className="fixed inset-0 z-[9998] bg-black/10 dark:bg-black/30 backdrop-blur-[0.5px]"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              setShowColorSubmenu(false);
            }}
          />

          <div
            ref={menuRef}
            tabIndex={-1}
            className="fixed z-[9999] w-52 max-h-[calc(100vh-16px)] overflow-y-auto rounded-lg border border-neutral-200 bg-white py-1.5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 text-xs outline-none"
            style={{
              top: `${menuPosition.top}px`,
              left: `${menuPosition.left}px`,
              opacity: menuPosition.visible ? 1 : 0,
              transition: 'opacity 80ms ease',
              pointerEvents: menuPosition.visible ? 'auto' : 'none',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Actions Section */}
            <div className="px-2.5 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Actions
            </div>
            <button
              type="button"
              onClick={() => {
                onDelete(block.id);
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
            <button
              type="button"
              onClick={() => {
                onDuplicate(block.id);
                setShowMenu(false);
              }}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Duplicate</span>
            </button>

            <div className="my-1 border-t border-neutral-100 dark:border-neutral-700" />

            {!isFirst && (
              <button
                type="button"
                onClick={() => {
                  onMoveUp(index);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>Move up</span>
              </button>
            )}
            {!isLast && (
              <button
                type="button"
                onClick={() => {
                  onMoveDown(index);
                  setShowMenu(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Move down</span>
              </button>
            )}

            <div className="my-1 border-t border-neutral-100 dark:border-neutral-700" />

            {/* Turn Into Section */}
            <div className="px-2.5 py-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
              Turn into
            </div>
            <button
              type="button"
              onClick={() => handleTurnInto('paragraph')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <Type className="w-3.5 h-3.5" />
              <span>Text</span>
            </button>
            <button
              type="button"
              onClick={() => handleTurnInto('heading_1')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <Heading1 className="w-3.5 h-3.5" />
              <span>Heading 1</span>
            </button>
            <button
              type="button"
              onClick={() => handleTurnInto('heading_2')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <Heading2 className="w-3.5 h-3.5" />
              <span>Heading 2</span>
            </button>
            <button
              type="button"
              onClick={() => handleTurnInto('heading_3')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <Heading3 className="w-3.5 h-3.5" />
              <span>Heading 3</span>
            </button>
            <button
              type="button"
              onClick={() => handleTurnInto('todo')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <CheckSquare className="w-3.5 h-3.5" />
              <span>To-do list</span>
            </button>
            <button
              type="button"
              onClick={() => handleTurnInto('bulleted_list')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <List className="w-3.5 h-3.5" />
              <span>Bulleted list</span>
            </button>
            <button
              type="button"
              onClick={() => handleTurnInto('numbered_list')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <ListOrdered className="w-3.5 h-3.5" />
              <span>Numbered list</span>
            </button>
            <button
              type="button"
              onClick={() => handleTurnInto('toggle')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
              <span>Toggle list</span>
            </button>
            <button
              type="button"
              onClick={() => handleTurnInto('quote')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <Quote className="w-3.5 h-3.5" />
              <span>Quote</span>
            </button>
            <button
              type="button"
              onClick={() => handleTurnInto('callout')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Callout</span>
            </button>
            <button
              type="button"
              onClick={() => handleTurnInto('code')}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code</span>
            </button>

            <div className="my-1 border-t border-neutral-100 dark:border-neutral-700" />

            {/* Colors Section */}
            <div
              ref={colorRowRef}
              className="relative"
              onMouseEnter={() => {
                if (colorCloseTimerRef.current) clearTimeout(colorCloseTimerRef.current);
                if (colorRowRef.current) {
                  const r = colorRowRef.current.getBoundingClientRect();
                  const submenuW = 192;
                  const submenuH = 380;
                  const vw = window.innerWidth;
                  const vh = window.innerHeight;
                  const MARGIN = 8;
                  let left = r.right + 2;
                  if (left + submenuW > vw - MARGIN) left = r.left - submenuW - 2;
                  let top = r.top;
                  top = Math.min(top, vh - submenuH - MARGIN);
                  top = Math.max(top, MARGIN);
                  setColorSubmenuPos({ top, left });
                }
                setShowColorSubmenu(true);
              }}
              onMouseLeave={() => {
                colorCloseTimerRef.current = setTimeout(() => {
                  setShowColorSubmenu(false);
                  setColorSubmenuPos(null);
                }, 120);
              }}
            >
              <div
                className="flex w-full items-center justify-between px-3 py-1.5 text-neutral-700 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-700 cursor-pointer"
                onClick={() => setShowColorSubmenu(!showColorSubmenu)}
              >
                <div className="flex items-center gap-2">
                  <Palette className="w-3.5 h-3.5 text-neutral-400" />
                  <span>Color</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
              </div>

              {showColorSubmenu &&
                colorSubmenuPos &&
                createPortal(
                  <div
                    className="fixed z-[10001] w-48 max-h-80 overflow-y-auto rounded-lg border border-neutral-200 bg-white p-2 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 text-xs"
                    style={{ top: colorSubmenuPos.top, left: colorSubmenuPos.left }}
                    onMouseEnter={() => {
                      if (colorCloseTimerRef.current) clearTimeout(colorCloseTimerRef.current);
                      setShowColorSubmenu(true);
                    }}
                    onMouseLeave={() => {
                      colorCloseTimerRef.current = setTimeout(() => {
                        setShowColorSubmenu(false);
                        setColorSubmenuPos(null);
                      }, 80);
                    }}
                  >
                    <div className="px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Text Color
                    </div>
                    <div className="space-y-0.5 mb-2">
                      {NOTION_COLORS.map((c) => (
                        <button
                          key={`c-${c}`}
                          type="button"
                          onClick={() => handleSetColor(c, false)}
                          className="flex w-full items-center gap-2 rounded px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 capitalize cursor-pointer text-left"
                        >
                          <span
                            className={`h-3 w-3 rounded-full border border-neutral-300 ${
                              c === 'default'
                                ? 'bg-neutral-800 dark:bg-neutral-200'
                                : `bg-${c}-500`
                            }`}
                          />
                          <span>{c}</span>
                        </button>
                      ))}
                    </div>

                    <div className="px-1.5 py-0.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                      Background Color
                    </div>
                    <div className="space-y-0.5">
                      {NOTION_COLORS.map((c) => (
                        <button
                          key={`bg-${c}`}
                          type="button"
                          onClick={() => handleSetColor(c, true)}
                          className="flex w-full items-center gap-2 rounded px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-700 capitalize cursor-pointer text-left"
                        >
                          <span
                            className={`h-3 w-3 rounded border border-neutral-300 ${
                              c === 'default'
                                ? 'bg-transparent'
                                : `bg-${c}-100 dark:bg-${c}-950/60`
                            }`}
                          />
                          <span>{c} bg</span>
                        </button>
                      ))}
                    </div>
                  </div>,
                  document.body
                )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
