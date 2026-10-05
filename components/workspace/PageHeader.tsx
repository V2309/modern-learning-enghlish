import React, { useState } from 'react';
import { Page, PageCover } from '@/types/notion';
import { IconRenderer, POPULAR_LUCIDE_ICONS } from './common/IconRenderer';
import {
  PageCoverArea,
  IconPickerPopover,
  CoverPickerModal,
} from './header';

interface PageHeaderProps {
  page: Page;
  onUpdatePage: (updates: Partial<Page>) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ page, onUpdatePage }) => {
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  const handleSetCover = (cover: PageCover) => {
    onUpdatePage({ cover });
  };

  const handleRemoveCover = () => {
    onUpdatePage({ cover: null });
  };

  const handleSetIcon = (iconName: string) => {
    onUpdatePage({ icon: iconName });
  };

  const handleRandomIcon = () => {
    const random = POPULAR_LUCIDE_ICONS[Math.floor(Math.random() * POPULAR_LUCIDE_ICONS.length)];
    onUpdatePage({ icon: random.name });
  };

  const handleRemoveIcon = () => {
    onUpdatePage({ icon: undefined });
    setShowIconPicker(false);
  };

  return (
    <div className="group/header relative w-full mb-6">
      {/* Cover Image Area */}
      <PageCoverArea
        cover={page.cover}
        hasIcon={!!page.icon}
        isFullWidth={page.isFullWidth}
        onOpenCoverPicker={() => setShowCoverPicker(true)}
        onRemoveCover={handleRemoveCover}
        onAddDefaultIcon={() => onUpdatePage({ icon: 'FileText' })}
      />

      {/* Main Page Title & Icon Bar aligned with page content */}
      <div
        className={`mx-auto px-6 md:px-12 transition-all ${
          page.isFullWidth ? 'max-w-full' : 'max-w-4xl'
        }`}
      >
        <div className={`space-y-4 ${page.cover ? '-mt-10' : 'pt-8'}`}>
          {/* Page Icon */}
          {page.icon && (
            <div className="relative inline-block group/icon">
              <button
                type="button"
                onClick={() => setShowIconPicker(!showIconPicker)}
                className="flex h-18 w-18 items-center justify-center rounded-2xl bg-white shadow-md hover:bg-neutral-50 dark:bg-neutral-800 dark:hover:bg-neutral-700 transition-transform hover:scale-105 cursor-pointer border border-neutral-100 dark:border-neutral-700 mb-2"
                title="Change icon"
              >
                <IconRenderer
                  icon={page.icon}
                  className="w-10 h-10 text-neutral-800 dark:text-neutral-100"
                />
              </button>

              {/* Icon Picker Popover */}
              <IconPickerPopover
                isOpen={showIconPicker}
                currentIcon={page.icon}
                onClose={() => setShowIconPicker(false)}
                onSelectIcon={handleSetIcon}
                onRandomIcon={handleRandomIcon}
                onRemoveIcon={handleRemoveIcon}
              />
            </div>
          )}

          {/* Page Title */}
          <input
            type="text"
            value={page.title}
            onChange={(e) => onUpdatePage({ title: e.target.value, updatedAt: Date.now() })}
            placeholder="Untitled"
            className="w-full text-3xl md:text-4xl font-extrabold tracking-tight bg-transparent text-neutral-900 dark:text-neutral-100 outline-hidden placeholder:text-neutral-300 dark:placeholder:text-neutral-600 pb-2"
          />
        </div>
      </div>

      {/* Cover Picker Modal */}
      <CoverPickerModal
        isOpen={showCoverPicker}
        onClose={() => setShowCoverPicker(false)}
        onSelectCover={handleSetCover}
        onRemoveCover={handleRemoveCover}
      />
    </div>
  );
};
