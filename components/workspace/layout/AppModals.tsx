'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useWorkspace } from '@/context/WorkspaceContext';
import { CommandPalette } from '@/components/workspace/modals/CommandPalette';
import { TrashModal } from '@/components/workspace/modals/TrashModal';
import { SettingsModal } from '@/components/workspace/modals/SettingsModal';

export const AppModals: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const pageId = typeof params?.id === 'string' ? params.id : '';

  const {
    pages,
    workspaceInfo,
    theme,
    sidebarCollapsed,
    isSearchOpen,
    isTrashOpen,
    isSettingsOpen,
    setSidebarCollapsed,
    setIsSearchOpen,
    setIsTrashOpen,
    setIsSettingsOpen,
    toggleTheme,
    handleAddPage,
    handleRestorePage,
    handlePermanentlyDeletePage,
    handleEmptyTrash,
    handleResetWorkspace,
    handleExportWorkspaceJson,
    handleImportWorkspaceJson,
  } = useWorkspace();

  const activePage =
    pages.find((p) => p.id === pageId && !p.isArchived) ??
    pages.find((p) => !p.isArchived) ??
    null;

  // Global keyboard shortcuts (⌘K for search, ⌘\ for sidebar)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(!isSearchOpen);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault();
        setSidebarCollapsed(!sidebarCollapsed);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isSearchOpen, sidebarCollapsed, setIsSearchOpen, setSidebarCollapsed]);

  const navigateTo = (id: string) => {
    router.push(`/workspace/${id}`);
  };

  const onAddPage = (parentId?: string | null) => {
    const newPage = handleAddPage(parentId);
    router.push(`/workspace/${newPage.id}`);
  };

  const onResetWorkspace = () => {
    const firstId = handleResetWorkspace();
    router.replace(`/workspace/${firstId}`);
  };

  const onImportJson = (data: Parameters<typeof handleImportWorkspaceJson>[0]) => {
    const firstId = handleImportWorkspaceJson(data);
    if (firstId) router.replace(`/workspace/${firstId}`);
  };

  return (
    <>
      <CommandPalette
        isOpen={isSearchOpen}
        pages={pages}
        theme={theme}
        onClose={() => setIsSearchOpen(false)}
        onSelectPage={navigateTo}
        onAddPage={() => onAddPage(null)}
        onToggleTheme={toggleTheme}
      />

      <TrashModal
        isOpen={isTrashOpen}
        pages={pages}
        onClose={() => setIsTrashOpen(false)}
        onRestorePage={handleRestorePage}
        onPermanentlyDeletePage={handlePermanentlyDeletePage}
        onEmptyTrash={handleEmptyTrash}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        theme={theme}
        workspace={{
          id: workspaceInfo?.id || 'ws-main',
          name: workspaceInfo?.name || 'English Learning Workspace',
          icon: workspaceInfo?.icon || 'BookOpen',
          ownerEmail: workspaceInfo?.userEmail || 'learner@modern-english.com',
          pages,
          activePageId: activePage?.id || '',
          sidebarCollapsed,
          theme,
        }}
        onClose={() => setIsSettingsOpen(false)}
        onToggleTheme={toggleTheme}
        onExportJson={handleExportWorkspaceJson}
        onImportJson={onImportJson}
        onResetWorkspace={onResetWorkspace}
      />
    </>
  );
};
