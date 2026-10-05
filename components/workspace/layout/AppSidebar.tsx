'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { Sidebar } from '@/components/workspace/Sidebar';

export const AppSidebar: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const pageId = typeof params?.id === 'string' ? params.id : '';

  const {
    pages,
    workspaceInfo,
    sidebarCollapsed,
    setSidebarCollapsed,
    setIsSearchOpen,
    setIsTrashOpen,
    setIsSettingsOpen,
    handleAddPage,
    handleDuplicatePage,
    handleDeletePage,
    handleToggleFavorite,
  } = useWorkspace();

  const activePage =
    pages.find((p) => p.id === pageId && !p.isArchived) ??
    pages.find((p) => !p.isArchived) ??
    null;

  const navigateTo = (id: string) => {
    router.push(`/workspace/${id}`);
  };

  const onAddPage = (parentId?: string | null) => {
    const newPage = handleAddPage(parentId);
    router.push(`/workspace/${newPage.id}`);
  };

  const onDuplicatePage = (id: string) => {
    const dup = handleDuplicatePage(id);
    router.push(`/workspace/${dup.id}`);
  };

  const onDeletePage = (id: string) => {
    const nextId = handleDeletePage(id, pageId);
    if (nextId) router.push(`/workspace/${nextId}`);
  };

  return (
    <Sidebar
      pages={pages}
      activePageId={activePage?.id || ''}
      isCollapsed={sidebarCollapsed}
      workspaceName={workspaceInfo?.name || 'Workspace'}
      workspaceInitial={(workspaceInfo?.userName || workspaceInfo?.name || 'W')[0].toUpperCase()}
      onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      onSelectPage={navigateTo}
      onAddPage={onAddPage}
      onDuplicatePage={onDuplicatePage}
      onDeletePage={onDeletePage}
      onToggleFavorite={handleToggleFavorite}
      onOpenSearch={() => setIsSearchOpen(true)}
      onOpenTrash={() => setIsTrashOpen(true)}
      onOpenSettings={() => setIsSettingsOpen(true)}
    />
  );
};
