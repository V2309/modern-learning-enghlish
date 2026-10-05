import React, { useEffect } from 'react';
import { Shuffle, X } from 'lucide-react';
import { POPULAR_LUCIDE_ICONS } from '../common/IconRenderer';

interface IconPickerPopoverProps {
  isOpen: boolean;
  currentIcon?: string;
  onClose: () => void;
  onSelectIcon: (iconName: string) => void;
  onRandomIcon: () => void;
  onRemoveIcon: () => void;
}

export const IconPickerPopover: React.FC<IconPickerPopoverProps> = ({
  isOpen,
  currentIcon,
  onClose,
  onSelectIcon,
  onRandomIcon,
  onRemoveIcon,
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
    <>
      <div
        className="fixed inset-0 z-40 bg-black/10 dark:bg-black/30 backdrop-blur-[0.5px]"
        onClick={onClose}
      />
      <div className="absolute top-full left-0 z-50 mt-2 w-80 rounded-xl border border-neutral-200 bg-white p-3 shadow-2xl dark:border-neutral-700 dark:bg-neutral-800 animate-in fade-in zoom-in-95 duration-100">
        <div className="flex items-center justify-between pb-2 border-b border-neutral-100 dark:border-neutral-700 mb-2">
          <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
            Choose Lucide Icon
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onRandomIcon}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
              title="Random icon"
            >
              <Shuffle className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onRemoveIcon}
              className="p-1 text-rose-500 hover:text-rose-700 cursor-pointer"
              title="Remove icon"
            >
              <X className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-1.5 max-h-56 overflow-y-auto p-1">
          {POPULAR_LUCIDE_ICONS.map((item) => {
            const IconComp = item.icon;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  onSelectIcon(item.name);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center gap-1 rounded-lg p-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors cursor-pointer ${
                  currentIcon === item.name
                    ? 'bg-neutral-100 dark:bg-neutral-700 text-blue-600 dark:text-blue-400'
                    : 'text-neutral-700 dark:text-neutral-300'
                }`}
                title={item.label}
              >
                <IconComp className="w-5 h-5" />
                <span className="text-[9px] truncate max-w-full text-neutral-400">
                  {item.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
};
