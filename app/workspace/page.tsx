'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';

export default function WorkspaceIndexPage() {
  const router = useRouter();
  const { pages, isLoading, handleAddPage } = useWorkspace();

  useEffect(() => {
    if (isLoading) return;
    const parentPage = pages.find((p) => !p.parentId && !p.isArchived);
    const targetPage = parentPage || pages.find((p) => !p.isArchived);
    if (targetPage) {
      router.replace(`/workspace/${targetPage.id}`);
    }
  }, [isLoading, pages, router]);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-sm text-neutral-400">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-sky-400 border-t-transparent mr-2.5" />
        Đang khởi tạo không gian làm việc của bạn...
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center text-neutral-400">
      <h2 className="text-lg font-semibold text-neutral-700 dark:text-neutral-300 mb-1">
        Không gian làm việc đã sẵn sàng
      </h2>
      <p className="text-xs text-neutral-400 max-w-sm mb-4">
        Tạo trang đầu tiên để bắt đầu ghi chú và quản lý công việc.
      </p>
      <button
        type="button"
        onClick={() => {
          const newPage = handleAddPage(null);
          router.push(`/workspace/${newPage.id}`);
        }}
        className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 cursor-pointer shadow-xs"
      >
        + Tạo trang mới
      </button>
    </div>
  );
}
