'use client';

import React, { useRef, useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bold, Italic, List, ListOrdered, Table, Code, Heading1, Heading2,
  Minus, Quote, Eye, Edit3, Maximize2, Minimize2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minRows?: number;
  className?: string;
}

interface ToolbarAction {
  icon: React.ReactNode;
  title: string;
  action: (textarea: HTMLTextAreaElement) => void;
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string = prefix,
  placeholder = 'text'
) {
  const { selectionStart: s, selectionEnd: e, value } = textarea;
  const selected = value.slice(s, e) || placeholder;
  const before = value.slice(0, s);
  const after = value.slice(e);
  const newVal = `${before}${prefix}${selected}${suffix}${after}`;
  // Trigger React onChange via native input event
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!;
  nativeInputValueSetter.call(textarea, newVal);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  // Restore cursor
  const cursorStart = s + prefix.length;
  const cursorEnd = cursorStart + selected.length;
  textarea.focus();
  textarea.setSelectionRange(cursorStart, cursorEnd);
}

function insertLine(textarea: HTMLTextAreaElement, prefix: string, placeholder = '') {
  const { selectionStart: s, value } = textarea;
  const before = value.slice(0, s);
  const after = value.slice(s);
  const lineBreak = before.length > 0 && !before.endsWith('\n') ? '\n' : '';
  const text = `${before}${lineBreak}${prefix}${placeholder}`;
  const newVal = `${text}${after}`;
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!;
  nativeInputValueSetter.call(textarea, newVal);
  textarea.dispatchEvent(new Event('input', { bubbles: true }));
  const cursor = text.length;
  textarea.focus();
  textarea.setSelectionRange(cursor, cursor);
}

const TABLE_TEMPLATE = `
| Cột 1 | Cột 2 | Cột 3 |
|-------|-------|-------|
| A     | B     | C     |
| D     | E     | F     |
`;

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Nhập nội dung mô tả (hỗ trợ Markdown)...',
  minRows = 8,
  className,
}: MarkdownEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isExpanded, setIsExpanded] = useState(false);

  const exec = useCallback((fn: (ta: HTMLTextAreaElement) => void) => {
    if (textareaRef.current) fn(textareaRef.current);
  }, []);

  const toolbarActions: ToolbarAction[] = [
    { icon: <Heading1 className="h-3.5 w-3.5" />, title: 'Heading 1', action: (ta) => insertLine(ta, '# ', 'Tiêu đề 1') },
    { icon: <Heading2 className="h-3.5 w-3.5" />, title: 'Heading 2', action: (ta) => insertLine(ta, '## ', 'Tiêu đề 2') },
    { icon: <Bold className="h-3.5 w-3.5" />, title: 'In đậm (Ctrl+B)', action: (ta) => wrapSelection(ta, '**', '**', 'đậm') },
    { icon: <Italic className="h-3.5 w-3.5" />, title: 'In nghiêng (Ctrl+I)', action: (ta) => wrapSelection(ta, '_', '_', 'nghiêng') },
    { icon: <Code className="h-3.5 w-3.5" />, title: 'Code', action: (ta) => wrapSelection(ta, '`', '`', 'code') },
    { icon: <Quote className="h-3.5 w-3.5" />, title: 'Trích dẫn', action: (ta) => insertLine(ta, '> ', 'Nội dung trích dẫn') },
    { icon: <List className="h-3.5 w-3.5" />, title: 'Danh sách', action: (ta) => insertLine(ta, '- ', 'Mục danh sách') },
    { icon: <ListOrdered className="h-3.5 w-3.5" />, title: 'Danh sách số', action: (ta) => insertLine(ta, '1. ', 'Mục 1') },
    { icon: <Minus className="h-3.5 w-3.5" />, title: 'Đường kẻ ngang', action: (ta) => insertLine(ta, '---') },
    { icon: <Table className="h-3.5 w-3.5" />, title: 'Chèn bảng', action: (ta) => insertLine(ta, TABLE_TEMPLATE) },
  ];

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const ta = e.currentTarget;
    if (e.key === 'Tab') {
      e.preventDefault();
      insertLine(ta, '  ');
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'b') { e.preventDefault(); exec((t) => wrapSelection(t, '**', '**', 'đậm')); }
    if ((e.ctrlKey || e.metaKey) && e.key === 'i') { e.preventDefault(); exec((t) => wrapSelection(t, '_', '_', 'nghiêng')); }
    // Auto-continue lists on Enter
    if (e.key === 'Enter') {
      const { selectionStart, value: v } = ta;
      const lineStart = v.lastIndexOf('\n', selectionStart - 1) + 1;
      const line = v.slice(lineStart, selectionStart);
      const bulletMatch = line.match(/^(\s*)([-*+])\s/);
      const orderedMatch = line.match(/^(\s*)(\d+)\.\s/);
      if (bulletMatch && line.trim() !== `${bulletMatch[2]}`) {
        e.preventDefault();
        insertLine(ta, `${bulletMatch[1]}${bulletMatch[2]} `);
      } else if (orderedMatch && line.trim() !== `${orderedMatch[2]}.`) {
        e.preventDefault();
        insertLine(ta, `${orderedMatch[1]}${parseInt(orderedMatch[2]) + 1}. `);
      }
    }
  };

  const containerH = isExpanded ? 'max-h-[80vh]' : '';
  const editorRows = isExpanded ? 20 : minRows;

  return (
    <div className={cn('flex flex-col border border-border rounded-2xl overflow-hidden bg-muted/30', containerH, className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-3 py-2 border-b border-border bg-muted/50 flex-wrap">
        {/* Action buttons */}
        <div className="flex items-center gap-0.5 flex-wrap flex-1">
          {toolbarActions.map((action, i) => (
            <button
              key={i}
              type="button"
              title={action.title}
              onMouseDown={(e) => { e.preventDefault(); exec(action.action); }}
              className="p-1.5 rounded-lg hover:bg-primary/10 hover:text-primary text-muted-foreground transition-all"
            >
              {action.icon}
            </button>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-border mx-1" />

        {/* View mode */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title="Chỉ soạn thảo"
            onClick={() => setMode('edit')}
            className={cn('p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold',
              mode === 'edit' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground')}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>
          <button
            type="button"
            title="Split view"
            onClick={() => setMode('split')}
            className={cn('p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold',
              mode === 'split' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground')}
          >
            <span className="text-xs font-mono">⋮</span>
            <span className="hidden sm:inline text-xs">Split</span>
          </button>
          <button
            type="button"
            title="Chỉ xem preview"
            onClick={() => setMode('preview')}
            className={cn('p-1.5 rounded-lg transition-all flex items-center gap-1 text-xs font-bold',
              mode === 'preview' ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-muted-foreground')}
          >
            <Eye className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Preview</span>
          </button>

          {/* Expand */}
          <button
            type="button"
            title={isExpanded ? 'Thu nhỏ' : 'Mở rộng'}
            onClick={() => setIsExpanded((p) => !p)}
            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-all ml-1"
          >
            {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>

      {/* Editor area */}
      <div className={cn('flex', mode === 'split' ? 'divide-x divide-border' : '')}>
        {/* Textarea */}
        {(mode === 'edit' || mode === 'split') && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={editorRows}
            placeholder={placeholder}
            className={cn(
              'flex-1 bg-transparent px-4 py-3 text-sm text-foreground resize-none focus:outline-none font-mono leading-relaxed placeholder:text-muted-foreground/50',
              mode === 'split' && 'min-w-0 w-1/2'
            )}
            spellCheck={false}
          />
        )}

        {/* Preview */}
        {(mode === 'preview' || mode === 'split') && (
          <div
            className={cn(
              'flex-1 px-4 py-3 overflow-y-auto',
              mode === 'split' && 'min-w-0 w-1/2'
            )}
            style={{ minHeight: `${editorRows * 1.5}rem` }}
          >
            {value ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  h1: ({ children }) => <h1 className="text-xl font-extrabold text-foreground mt-4 mb-2 pb-1 border-b border-border">{children}</h1>,
                  h2: ({ children }) => <h2 className="text-lg font-bold text-foreground mt-3 mb-1.5">{children}</h2>,
                  h3: ({ children }) => <h3 className="text-base font-bold text-primary mt-2 mb-1">{children}</h3>,
                  p: ({ children }) => <p className="text-sm text-foreground/80 leading-relaxed mb-2">{children}</p>,
                  ul: ({ children }) => <ul className="list-disc pl-5 text-sm text-foreground/80 space-y-1 mb-2">{children}</ul>,
                  ol: ({ children }) => <ol className="list-decimal pl-5 text-sm text-foreground/80 space-y-1 mb-2">{children}</ol>,
                  li: ({ children }) => <li className="leading-relaxed">{children}</li>,
                  blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/50 pl-4 py-1 bg-primary/5 rounded-r-xl text-sm italic text-muted-foreground mb-2">{children}</blockquote>,
                  code: ({ children, className }) => {
                    const isBlock = className?.includes('language-');
                    return isBlock
                      ? <code className="block bg-muted border border-border rounded-xl px-4 py-3 text-xs font-mono text-foreground mb-2 overflow-x-auto">{children}</code>
                      : <code className="bg-muted border border-border/50 px-1.5 py-0.5 rounded-md text-xs font-mono text-primary">{children}</code>;
                  },
                  table: ({ children }) => (
                    <div className="overflow-x-auto mb-3 rounded-xl border border-border">
                      <table className="min-w-full text-sm">{children}</table>
                    </div>
                  ),
                  thead: ({ children }) => <thead className="bg-muted/60">{children}</thead>,
                  th: ({ children }) => <th className="px-4 py-2 text-left font-bold text-foreground text-xs uppercase tracking-widest border-b border-border">{children}</th>,
                  td: ({ children }) => <td className="px-4 py-2 text-foreground/80 border-b border-border/40 text-sm">{children}</td>,
                  hr: () => <hr className="border-border my-4" />,
                  strong: ({ children }) => <strong className="font-bold text-foreground">{children}</strong>,
                  em: ({ children }) => <em className="italic text-foreground/70">{children}</em>,
                }}
              >
                {value}
              </ReactMarkdown>
            ) : (
              <p className="text-muted-foreground/40 text-sm italic">Preview sẽ hiển thị ở đây...</p>
            )}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div className="px-4 py-1.5 border-t border-border bg-muted/30 flex items-center gap-3 flex-wrap">
        <span className="text-[10px] text-muted-foreground/50 font-medium">
          Markdown · **đậm** · _nghiêng_ · `code` · # Tiêu đề · - danh sách · | bảng |
        </span>
        <span className="text-[10px] text-muted-foreground/40 ml-auto">
          {value.length} ký tự
        </span>
      </div>
    </div>
  );
}
