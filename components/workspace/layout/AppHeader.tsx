'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { TopNav } from '@/components/workspace/TopNav';

export const AppHeader: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const pageId = typeof params?.id === 'string' ? params.id : '';

  const {
    pages,
    theme,
    sidebarCollapsed,
    setSidebarCollapsed,
    toggleTheme,
    handleUpdatePage,
    handleDeletePage,
    handleResetWorkspace,
    handleExportWorkspaceJson,
  } = useWorkspace();

  const activePage =
    pages.find((p) => p.id === pageId && !p.isArchived) ??
    pages.find((p) => !p.isArchived) ??
    null;

  if (!activePage) return null;

  const navigateTo = (id: string) => {
    router.push(`/workspace/${id}`);
  };

  const onDeletePage = (id: string) => {
    const nextId = handleDeletePage(id, pageId);
    if (nextId) router.push(`/workspace/${nextId}`);
  };

  const onResetWorkspace = () => {
    const firstId = handleResetWorkspace();
    router.replace(`/workspace/${firstId}`);
  };

  return (
    <TopNav
      activePage={activePage}
      pages={pages}
      sidebarCollapsed={sidebarCollapsed}
      theme={theme}
      onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
      onSelectPage={navigateTo}
      onUpdatePage={(updates) => handleUpdatePage(activePage.id, updates)}
      onDeletePage={onDeletePage}
      onResetWorkspace={onResetWorkspace}
      onToggleTheme={toggleTheme}
      onExportWorkspaceJson={handleExportWorkspaceJson}
    />
  );
};
