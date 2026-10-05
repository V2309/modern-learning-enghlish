import React, { useState } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Link as LinkIcon,
  Palette,
} from 'lucide-react';
import { NotionColor } from '@/types/notion';

interface FloatingToolbarProps {
  position: { top: number; left: number };
  onApplyFormat: (format: 'bold' | 'italic' | 'strike' | 'code' | 'link', value?: string) => void;
  onSetColor: (color: NotionColor, isBg?: boolean) => void;
  onClose: () => void;
}

const COLOR_OPTIONS: { id: NotionColor; label: string; textClass: string; bgClass: string }[] = [
  { id: 'default', label: 'Default', textClass: 'text-neutral-900', bgClass: 'bg-transparent' },
  { id: 'gray', label: 'Gray', textClass: 'text-neutral-500', bgClass: 'bg-neutral-100' },
  { id: 'brown', label: 'Brown', textClass: 'text-amber-800', bgClass: 'bg-amber-100' },
  { id: 'orange', label: 'Orange', textClass: 'text-orange-600', bgClass: 'bg-orange-100' },
  { id: 'yellow', label: 'Yellow', textClass: 'text-yellow-700', bgClass: 'bg-yellow-100' },
  { id: 'green', label: 'Green', textClass: 'text-emerald-600', bgClass: 'bg-emerald-100' },
  { id: 'blue', label: 'Blue', textClass: 'text-blue-600', bgClass: 'bg-blue-100' },
  { id: 'purple', label: 'Purple', textClass: 'text-purple-600', bgClass: 'bg-purple-100' },
  { id: 'pink', label: 'Pink', textClass: 'text-pink-600', bgClass: 'bg-pink-100' },
  { id: 'red', label: 'Red', textClass: 'text-rose-600', bgClass: 'bg-rose-100' },
];

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  position,
  onApplyFormat,
  onSetColor,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (linkUrl.trim()) {
      onApplyFormat('link', linkUrl.trim());
      setShowLinkInput(false);
      setLinkUrl('');
    }
  };

  return (
    <div
      className="fixed z-50 flex items-center rounded-lg border border-neutral-200 bg-white p-1 shadow-lg dark:border-neutral-700 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 animate-in fade-in zoom-in-95 duration-100"
      style={{
        top: `${Math.max(10, position.top - 46)}px`,
        left: `${Math.max(10, Math.min(position.left, window.innerWidth - 300))}px`,
      }}
    >
      {showLinkInput ? (
        <form onSubmit={handleLinkSubmit} className="flex items-center gap-1 px-1">
          <input
            type="url"
            placeholder="Paste link..."
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            className="w-48 rounded px-2 py-1 text-xs border border-neutral-200 dark:border-neutral-600 dark:bg-neutral-700 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
            autoFocus
          />
          <button
            type="submit"
            className="rounded bg-blue-600 px-2 py-1 text-xs font-medium text-white hover:bg-blue-700"
          >
            Apply
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(false)}
            className="rounded px-1.5 py-1 text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
          >
            ✕
          </button>
        </form>
      ) : (
        <>
          <button
            type="button"
            onClick={() => onApplyFormat('bold')}
            className="rounded p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title="Bold (Ctrl+B)"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onApplyFormat('italic')}
            className="rounded p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title="Italic (Ctrl+I)"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onApplyFormat('strike')}
            className="rounded p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onApplyFormat('code')}
            className="rounded p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title="Inline code"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => setShowLinkInput(true)}
            className="rounded p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
            title="Add link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>

          <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-700 mx-1" />

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowColorPicker(!showColorPicker)}
              className="flex items-center gap-1 rounded p-1.5 hover:bg-neutral-100 dark:hover:bg-neutral-700"
              title="Color & Background"
            >
              <Palette className="w-3.5 h-3.5" />
              <span className="text-[10px] text-neutral-400">Color</span>
            </button>

            {showColorPicker && (
              <div className="absolute top-full left-0 mt-1 w-44 rounded-lg border border-neutral-200 bg-white p-2 shadow-xl dark:border-neutral-700 dark:bg-neutral-800 z-50">
                <div className="text-[10px] font-semibold text-neutral-400 mb-1">Color</div>
                <div className="grid grid-cols-2 gap-1 mb-2">
                  {COLOR_OPTIONS.slice(0, 6).map((c) => (
                    <button
                      key={`t-${c.id}`}
                      type="button"
                      onClick={() => {
                        onSetColor(c.id, false);
                        setShowColorPicker(false);
                      }}
                      className="flex items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <span className={`w-3 h-3 rounded-full border border-neutral-300 ${c.bgClass}`} />
                      <span className={c.textClass}>{c.label}</span>
                    </button>
                  ))}
                </div>
                <div className="text-[10px] font-semibold text-neutral-400 mb-1">Background</div>
                <div className="grid grid-cols-2 gap-1">
                  {COLOR_OPTIONS.slice(1, 7).map((c) => (
                    <button
                      key={`bg-${c.id}`}
                      type="button"
                      onClick={() => {
                        onSetColor(c.id, true);
                        setShowColorPicker(false);
                      }}
                      className="flex items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs hover:bg-neutral-100 dark:hover:bg-neutral-700"
                    >
                      <span className={`w-3 h-3 rounded-full border border-neutral-300 ${c.bgClass}`} />
                      <span>{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
