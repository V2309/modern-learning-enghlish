import React, { useState } from 'react';
import { Block } from '@/types/notion';
import { Check, Copy } from 'lucide-react';

interface CodeBlockProps {
  block: Block;
  onUpdate: (updatedBlock: Block) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

const CODE_LANGUAGES = [
  'typescript',
  'javascript',
  'python',
  'html',
  'css',
  'sql',
  'json',
  'bash',
  'markdown',
];

export const CodeBlock: React.FC<CodeBlockProps> = ({
  block,
  onUpdate,
  onKeyDown,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(block.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdate({ ...block, content: e.target.value });
  };

  return (
    <div className="rounded-lg border border-neutral-200 bg-neutral-900 text-neutral-100 dark:border-neutral-700 overflow-hidden font-mono text-xs">
      <div className="flex items-center justify-between border-b border-neutral-800 bg-neutral-950/70 px-3 py-1.5 text-neutral-400">
        <select
          value={block.meta?.language || 'typescript'}
          onChange={(e) =>
            onUpdate({
              ...block,
              meta: { ...block.meta, language: e.target.value },
            })
          }
          className="bg-transparent border-none text-neutral-300 text-xs focus:outline-hidden cursor-pointer"
        >
          {CODE_LANGUAGES.map((lang) => (
            <option key={lang} value={lang} className="bg-neutral-900 text-neutral-200">
              {lang}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleCopyCode}
          className="flex items-center gap-1 text-[11px] hover:text-neutral-200 transition-colors cursor-pointer"
        >
          {copied ? (
            <Check className="w-3 h-3 text-emerald-400" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <textarea
        rows={3}
        value={block.content}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder="// Write code here..."
        className="w-full resize-none overflow-hidden notion-editor-input border-none bg-transparent p-3 font-mono text-xs leading-relaxed text-emerald-300 outline-hidden"
        spellCheck={false}
      />
    </div>
  );
};
