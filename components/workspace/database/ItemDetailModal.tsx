import React, { useEffect } from 'react';
import { DatabaseItem, DatabaseProperty } from '@/types/notion';
import { X, Calendar, User, Tag, CheckCircle2, Hash, AlignLeft, Sparkles } from 'lucide-react';
import { BlockEditor } from '../editor/BlockEditor';
import { IconRenderer } from '../common/IconRenderer';

interface ItemDetailModalProps {
  item: DatabaseItem;
  properties: DatabaseProperty[];
  onUpdateItem: (item: DatabaseItem) => void;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  properties,
  onUpdateItem,
  onClose,
}) => {
  useEffect(() => {
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
  }, [onClose]);

  const handlePropChange = (propId: string, value: any) => {
    onUpdateItem({
      ...item,
      properties: {
        ...item.properties,
        [propId]: value,
      },
      updatedAt: Date.now(),
    });
  };

  const getPropIcon = (type: DatabaseProperty['type']) => {
    switch (type) {
      case 'status':
        return <CheckCircle2 className="w-3.5 h-3.5 text-neutral-400" />;
      case 'priority':
        return <Sparkles className="w-3.5 h-3.5 text-neutral-400" />;
      case 'date':
        return <Calendar className="w-3.5 h-3.5 text-neutral-400" />;
      case 'number':
        return <Hash className="w-3.5 h-3.5 text-neutral-400" />;
      case 'select':
      case 'multi_select':
        return <Tag className="w-3.5 h-3.5 text-neutral-400" />;
      case 'text':
      default:
        return <AlignLeft className="w-3.5 h-3.5 text-neutral-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative flex h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-neutral-200 bg-white shadow-2xl dark:border-neutral-800 dark:bg-neutral-900 overflow-hidden">
        {/* Cover Preview if exists */}
        {item.cover && (
          <div className="h-28 w-full" style={{ background: item.cover }} />
        )}

        {/* Header bar */}
        <div className="flex items-center justify-between border-b border-neutral-100 px-6 py-3 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <IconRenderer icon={item.icon} className="w-5 h-5 text-neutral-700 dark:text-neutral-300" />
            <span className="text-xs text-neutral-400">Database Record</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-neutral-400 hover:bg-neutral-100 hover:text-neutral-700 dark:hover:bg-neutral-800 dark:hover:text-neutral-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">
          {/* Title */}
          <input
            type="text"
            value={item.title}
            onChange={(e) => onUpdateItem({ ...item, title: e.target.value, updatedAt: Date.now() })}
            placeholder="Untitled Item"
            className="w-full text-2xl font-bold tracking-tight bg-transparent text-neutral-900 dark:text-neutral-100 outline-hidden"
          />

          {/* Properties Grid */}
          <div className="rounded-lg border border-neutral-100 bg-neutral-50/70 p-4 dark:border-neutral-800 dark:bg-neutral-800/40 space-y-2.5">
            {properties.map((prop) => {
              const val = item.properties[prop.id];
              return (
                <div key={prop.id} className="grid grid-cols-3 items-center text-xs">
                  <div className="flex items-center gap-2 text-neutral-500 dark:text-neutral-400">
                    {getPropIcon(prop.type)}
                    <span>{prop.name}</span>
                  </div>

                  <div className="col-span-2">
                    {prop.type === 'status' || prop.type === 'priority' || prop.type === 'select' ? (
                      <select
                        value={val || ''}
                        onChange={(e) => handlePropChange(prop.id, e.target.value)}
                        className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
                      >
                        <option value="">Select option...</option>
                        {prop.options?.map((opt) => (
                          <option key={opt.id} value={opt.label}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    ) : prop.type === 'date' ? (
                      <input
                        type="date"
                        value={val || ''}
                        onChange={(e) => handlePropChange(prop.id, e.target.value)}
                        className="rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
                      />
                    ) : prop.type === 'number' ? (
                      <input
                        type="number"
                        value={val ?? ''}
                        onChange={(e) => handlePropChange(prop.id, Number(e.target.value))}
                        className="w-32 rounded border border-neutral-200 bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 focus:outline-hidden"
                      />
                    ) : (
                      <input
                        type="text"
                        value={val || ''}
                        onChange={(e) => handlePropChange(prop.id, e.target.value)}
                        placeholder="Empty"
                        className="w-full rounded border border-transparent px-2 py-1 text-xs hover:border-neutral-200 focus:border-neutral-300 dark:hover:border-neutral-700 bg-transparent text-neutral-800 dark:text-neutral-200 outline-hidden"
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <hr className="border-t border-neutral-200 dark:border-neutral-800" />

          {/* Sub-page Block Editor */}
          <div>
            <div className="mb-2 text-xs font-semibold text-neutral-400 uppercase tracking-wider">
              Notes & Content
            </div>
            <BlockEditor
              blocks={item.pageContent || [{ id: `bc-${Date.now()}`, type: 'paragraph', content: '' }]}
              onChange={(blocks) => onUpdateItem({ ...item, pageContent: blocks, updatedAt: Date.now() })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
