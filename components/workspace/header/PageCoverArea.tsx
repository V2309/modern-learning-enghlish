import React from 'react';
import { PageCover } from '@/types/notion';
import { Image, Smile, X } from 'lucide-react';

interface PageCoverAreaProps {
  cover?: PageCover | null;
  hasIcon: boolean;
  isFullWidth?: boolean;
  onOpenCoverPicker: () => void;
  onRemoveCover: () => void;
  onAddDefaultIcon: () => void;
}

export const PageCoverArea: React.FC<PageCoverAreaProps> = ({
  cover,
  hasIcon,
  isFullWidth,
  onOpenCoverPicker,
  onRemoveCover,
  onAddDefaultIcon,
}) => {
  if (cover) {
    return (
      <div
        className="relative h-44 md:h-52 w-full transition-all group/cover"
        style={{ background: cover.value }}
      >
        <div className="absolute right-4 bottom-3 flex items-center gap-1.5 opacity-0 group-hover/cover:opacity-100 transition-opacity bg-black/40 backdrop-blur-xs p-1 rounded-md text-white">
          <button
            type="button"
            onClick={onOpenCoverPicker}
            className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-white/20 rounded cursor-pointer"
          >
            <Image className="w-3.5 h-3.5" />
            <span>Change cover</span>
          </button>
          <button
            type="button"
            onClick={onRemoveCover}
            className="flex items-center gap-1 px-2 py-1 text-xs hover:bg-white/20 rounded text-rose-300 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
            <span>Remove</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mx-auto px-6 md:px-12 transition-all ${
        isFullWidth ? 'max-w-full' : 'max-w-4xl'
      }`}
    >
      <div className="flex items-center gap-3 pt-6 pb-2 opacity-0 group-hover/header:opacity-100 transition-opacity">
        {!hasIcon && (
          <button
            type="button"
            onClick={onAddDefaultIcon}
            className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer"
          >
            <Smile className="w-3.5 h-3.5" />
            <span>Add icon</span>
          </button>
        )}
        <button
          type="button"
          onClick={onOpenCoverPicker}
          className="flex items-center gap-1 text-xs text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 cursor-pointer"
        >
          <Image className="w-3.5 h-3.5" />
          <span>Add cover</span>
        </button>
      </div>
    </div>
  );
};
