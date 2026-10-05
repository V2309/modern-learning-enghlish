import React, { useEffect } from 'react';
import { PageCover } from '@/types/notion';
import { COVER_PRESETS } from '@/data/initialData';
import { X } from 'lucide-react';

interface CoverPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCover: (cover: PageCover) => void;
  onRemoveCover: () => void;
}

export const CoverPickerModal: React.FC<CoverPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectCover,
  onRemoveCover,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-700">
          <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Choose a page cover
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <span className="text-xs font-medium text-neutral-500">Notion Gradients</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-60 overflow-y-auto">
            {COVER_PRESETS.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => {
                  onSelectCover(preset);
                  onClose();
                }}
                className="group flex flex-col rounded-lg overflow-hidden border border-neutral-200 hover:border-neutral-400 dark:border-neutral-700 transition-all text-left cursor-pointer"
              >
                <div className="h-16 w-full" style={{ background: preset.value }} />
                <span className="p-1.5 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 truncate">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 dark:border-neutral-700 flex justify-between">
          <button
            type="button"
            onClick={() => {
              onRemoveCover();
              onClose();
            }}
            className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
          >
            Remove cover
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs rounded bg-neutral-100 dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
