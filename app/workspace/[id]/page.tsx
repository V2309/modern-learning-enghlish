'use client';

import React, { useEffect, use } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { PageHeader } from '@/components/workspace/PageHeader';
import { BlockEditor } from '@/components/workspace/editor/BlockEditor';
import { DatabaseView } from '@/components/workspace/database/DatabaseView';
import { FileText } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }> | { id: string };
}

export default function WorkspacePage({ params }: PageProps) {
  const unwrappedParams = React.use(params as Promise<{ id: string }>);
  const router = useRouter();
  const pageId = unwrappedParams?.id || '';

  const {
    pages,
    isLoading,
    handleUpdatePage,
    handleConvertToDatabase,
    handleAddPage,
  } = useWorkspace();

  const activePage =
    pages.find((p) => p.id === pageId && !p.isArchived) ??
    pages.find((p) => !p.isArchived) ??
    null;

  // Redirect if current ID is invalid / archived
  useEffect(() => {
    if (isLoading) return;
    if (!activePage) {
      const first = pages.find((p) => !p.isArchived);
      if (first) router.replace(`/workspace/${first.id}`);
    } else if (activePage.id !== pageId) {
      router.replace(`/workspace/${activePage.id}`);
    }
  }, [isLoading, activePage, pageId, pages, router]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-neutral-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent mr-2.5" />
        <span className="text-sm font-medium">Đang tải không gian làm việc...</span>
      </div>
    );
  }

  if (!activePage) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-8 text-center text-neutral-400">
        <FileText className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mb-3" />
        <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300">
          Chưa chọn trang nào
        </h2>
        <p className="text-xs text-neutral-400 max-w-sm mt-1 mb-4">
          Chọn một trang từ thanh bên hoặc tạo trang mới để bắt đầu ghi chép.
        </p>
        <button
          type="button"
          onClick={() => {
            const newPage = handleAddPage(null);
            router.push(`/workspace/${newPage.id}`);
          }}
          className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer"
        >
          + Tạo trang mới
        </button>
      </div>
    );
  }

  const onUpdateActivePage = (updates: Partial<typeof activePage>) => {
    handleUpdatePage(activePage.id, updates);
  };

  const fontClass =
    activePage.fontPreference === 'mono'
      ? 'font-mono'
      : activePage.fontPreference === 'serif'
      ? 'font-serif'
      : 'font-sans';

  return (
    <>
      <PageHeader page={activePage} onUpdatePage={onUpdateActivePage} />

      <div
        className={`mx-auto px-6 md:px-12 transition-all ${fontClass} ${
          activePage.isFullWidth ? 'max-w-full' : 'max-w-4xl'
        }`}
      >
        {activePage.isDatabase && activePage.database ? (
          <DatabaseView
            database={activePage.database}
            onChange={(db) => onUpdateActivePage({ database: db })}
          />
        ) : (
          <BlockEditor
            blocks={activePage.blocks || []}
            onChange={(blocks) => onUpdateActivePage({ blocks })}
            onConvertToDatabase={() => handleConvertToDatabase(activePage.id)}
          />
        )}
      </div>
    </>
  );
}
