import React, { useEffect } from 'react';
import { Page } from '@/types/notion';
import { RotateCcw, X, AlertTriangle } from 'lucide-react';
import { IconRenderer } from '../common/IconRenderer';

interface TrashModalProps {
  isOpen: boolean;
  pages: Page[];
  onClose: () => void;
  onRestorePage: (id: string) => void;
  onPermanentlyDeletePage: (id: string) => void;
  onEmptyTrash: () => void;
}

export const TrashModal: React.FC<TrashModalProps> = ({
  isOpen,
  pages,
  onClose,
  onRestorePage,
  onPermanentlyDeletePage,
  onEmptyTrash,
}) => {
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const archivedPages = pages.filter((p) => p.isArchived);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div className="w-full max-w-lg rounded-xl border border-neutral-200 bg-white p-5 shadow-2xl dark:border-neutral-800 dark:bg-neutral-900">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <X className="w-4 h-4 text-neutral-400" />
            <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
              Trash ({archivedPages.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {archivedPages.length > 0 && (
              <button
                type="button"
                onClick={onEmptyTrash}
                className="text-xs text-rose-500 hover:text-rose-600 font-medium px-2 py-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                Empty Trash
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="mt-4 max-h-72 overflow-y-auto space-y-1">
          {archivedPages.length === 0 ? (
            <div className="py-12 text-center text-xs text-neutral-400">
              Trash is empty. Pages you delete will appear here.
            </div>
          ) : (
            archivedPages.map((page) => (
              <div
                key={page.id}
                className="flex items-center justify-between rounded-lg p-2.5 hover:bg-neutral-50 dark:hover:bg-neutral-800/50 transition-colors text-xs"
              >
                <div className="flex items-center gap-2 truncate">
                  <IconRenderer icon={page.icon} className="w-4 h-4 shrink-0 text-neutral-600 dark:text-neutral-300" />
                  <span className="font-medium text-neutral-800 dark:text-neutral-200 truncate">
                    {page.title || 'Untitled'}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => onRestorePage(page.id)}
                    className="flex items-center gap-1 rounded px-2 py-1 text-neutral-600 hover:bg-neutral-200/60 dark:text-neutral-300 dark:hover:bg-neutral-700"
                    title="Restore page"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Restore</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onPermanentlyDeletePage(page.id)}
                    className="rounded p-1.5 text-rose-500 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/40"
                    title="Delete permanently"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
