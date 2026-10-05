'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Page, Workspace } from '@/types/notion';
import { downloadFile } from '@/utils/exportImport';
import {
  fetchWorkspaceDataAction,
  createPageAction,
  updatePageAction,
  duplicatePageAction,
  setPageArchivedAction,
  permanentlyDeletePageAction,
  emptyTrashAction,
} from '@/actions/workspace.action';
import toast from 'react-hot-toast';

const THEME_KEY = 'notion_workspace_theme';

export interface WorkspaceInfo {
  id: string;
  userId?: string;
  name: string;
  icon: string;
  userName: string;
  userEmail: string;
  isGuest?: boolean;
}

interface WorkspaceContextValue {
  pages: Page[];
  workspaceInfo: WorkspaceInfo | null;
  isFirstTime: boolean;
  isLoading: boolean;
  theme: 'light' | 'dark';
  sidebarCollapsed: boolean;
  isSearchOpen: boolean;
  isTrashOpen: boolean;
  isSettingsOpen: boolean;
  setSidebarCollapsed: (v: boolean) => void;
  setIsSearchOpen: (v: boolean) => void;
  setIsTrashOpen: (v: boolean) => void;
  setIsSettingsOpen: (v: boolean) => void;
  toggleTheme: () => void;
  handleUpdatePage: (pageId: string, updates: Partial<Page>) => void;
  handleAddPage: (parentId?: string | null) => Page;
  handleDuplicatePage: (id: string) => Page;
  handleDeletePage: (id: string, currentPageId: string) => string | null;
  handleRestorePage: (id: string) => void;
  handlePermanentlyDeletePage: (id: string) => void;
  handleEmptyTrash: () => void;
  handleToggleFavorite: (id: string) => void;
  handleConvertToDatabase: (pageId: string) => void;
  handleResetWorkspace: () => string;
  handleExportWorkspaceJson: () => void;
  handleImportWorkspaceJson: (data: Workspace | { pages: Page[] }) => string | null;
  reloadWorkspaceData: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser?: { userId: string; userName: string; userEmail: string };
}) {
  const [pages, setPages] = useState<Page[]>([]);
  const [workspaceInfo, setWorkspaceInfo] = useState<WorkspaceInfo | null>(() => {
    if (initialUser) {
      return {
        id: '',
        userId: initialUser.userId,
        name: `Workspace của ${initialUser.userName}`,
        icon: 'Layers',
        userName: initialUser.userName,
        userEmail: initialUser.userEmail,
        isGuest: false,
      };
    }
    return null;
  });
  const [isFirstTime, setIsFirstTime] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const activeUserId = initialUser?.userId || workspaceInfo?.userId;
  const userCacheKey = activeUserId ? `notion_workspace_pages_${activeUserId}` : null;

  // Debounce map for DB page updates
  const pendingUpdatesRef = useRef<Map<string, { timer: NodeJS.Timeout; updates: Partial<Page> }>>(new Map());

  // Load from PostgreSQL DB on mount
  const reloadWorkspaceData = useCallback(async () => {
    try {
      const res = await fetchWorkspaceDataAction();
      if (res.success) {
        setPages(res.pages || []);
        if (res.workspace) {
          setWorkspaceInfo(res.workspace as WorkspaceInfo);
        }
        if (res.isNewUser) {
          setIsFirstTime(true);
          toast.success(
            `Chào mừng ${res.workspace?.userName || ''}! Không gian làm việc cá nhân đã sẵn sàng.`,
            { duration: 4500, icon: '🎉' }
          );
        }
      } else if (res.notAuthenticated) {
        window.location.href = '/auth/sign-in';
      }
    } catch (err) {
      console.error('Failed to load workspace data from DB:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize theme & cache on client mount
  useEffect(() => {
    // Purge any legacy shared cache
    try {
      localStorage.removeItem('notion_workspace_pages_cache_v3');
    } catch {}

    if (userCacheKey) {
      try {
        const cached = localStorage.getItem(userCacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setPages(parsed);
            setIsLoading(false);
          }
        }
      } catch {}
    }

    reloadWorkspaceData();

    try {
      const savedTheme = localStorage.getItem(THEME_KEY);
      if (savedTheme === 'dark') {
        setTheme('dark');
        document.documentElement.classList.add('dark');
      }
    } catch {}
  }, [userCacheKey, reloadWorkspaceData]);

  // Flush any pending updates before page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      pendingUpdatesRef.current.forEach(({ timer, updates }, pageId) => {
        clearTimeout(timer);
        updatePageAction(pageId, updates).catch(() => {});
      });
      pendingUpdatesRef.current.clear();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Cache pages locally per user for instantaneous reload experience
  useEffect(() => {
    if (userCacheKey && pages.length > 0) {
      try {
        localStorage.setItem(userCacheKey, JSON.stringify(pages));
      } catch {}
    }
  }, [userCacheKey, pages]);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isTrashOpen, setIsTrashOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Persist theme
  useEffect(() => {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {}
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(t => (t === 'dark' ? 'light' : 'dark'));
  }, []);

  // Update page: Optimistic update in UI + debounced DB persistence
  const handleUpdatePage = useCallback((pageId: string, updates: Partial<Page>) => {
    // 1. Optimistic update
    setPages(prev =>
      prev.map(p => (p.id === pageId ? { ...p, ...updates, updatedAt: Date.now() } : p))
    );

    // 2. Debounced save to PostgreSQL
    const existing = pendingUpdatesRef.current.get(pageId);
    if (existing) {
      clearTimeout(existing.timer);
    }

    const mergedUpdates = { ...(existing?.updates || {}), ...updates };
    const timer = setTimeout(async () => {
      try {
        await updatePageAction(pageId, mergedUpdates);
      } catch (err) {
        console.error('Error persisting page to database:', err);
      } finally {
        pendingUpdatesRef.current.delete(pageId);
      }
    }, 300);

    pendingUpdatesRef.current.set(pageId, { timer, updates: mergedUpdates });
  }, []);

  const handleAddPage = useCallback((parentId: string | null = null): Page => {
    const tempId = `page-${Date.now()}`;
    const newPage: Page = {
      id: tempId,
      parentId: parentId || null,
      title: 'Untitled',
      icon: 'FileText',
      cover: null,
      isFavorite: false,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      fontPreference: 'sans',
      isFullWidth: false,
      blocks: [{ id: `b-${Date.now()}`, type: 'paragraph', content: '' }],
    };

    // Optimistically add to UI
    setPages(prev => [...prev, newPage]);

    // Persist to DB with the EXACT SAME ID
    createPageAction({
      id: tempId,
      parentId: parentId || null,
      title: 'Untitled',
      icon: 'FileText',
      blocks: newPage.blocks,
    }).then(res => {
      if (res.success && res.page) {
        setPages(prev => prev.map(p => (p.id === tempId ? res.page! : p)));
      }
    }).catch(err => {
      console.error('Error creating page in DB:', err);
    });

    return newPage;
  }, []);

  const handleDuplicatePage = useCallback((id: string): Page => {
    const target = pages.find(p => p.id === id);
    const tempId = `page-${Date.now()}`;
    const duplicated: Page = {
      ...(target ? JSON.parse(JSON.stringify(target)) : {}),
      id: tempId,
      title: `${target?.title || 'Untitled'} (Copy)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Optimistically add
    setPages(prev => [...prev, duplicated]);

    // Persist to DB with exact same ID
    duplicatePageAction(id, tempId).then(res => {
      if (res.success && res.page) {
        setPages(prev => prev.map(p => (p.id === tempId ? res.page! : p)));
      }
    }).catch(err => {
      console.error('Error duplicating page in DB:', err);
    });

    return duplicated;
  }, [pages]);

  const handleDeletePage = useCallback((id: string, currentPageId: string): string | null => {
    setPages(prev =>
      prev.map(p => (p.id === id ? { ...p, isArchived: true, updatedAt: Date.now() } : p))
    );

    // Persist archive to DB
    setPageArchivedAction(id, true).catch(err => {
      console.error('Error archiving page in DB:', err);
    });

    if (currentPageId === id) {
      const next = pages.find(p => p.id !== id && !p.isArchived);
      return next?.id ?? null;
    }
    return null;
  }, [pages]);

  const handleRestorePage = useCallback((id: string) => {
    setPages(prev =>
      prev.map(p => (p.id === id ? { ...p, isArchived: false, updatedAt: Date.now() } : p))
    );

    setPageArchivedAction(id, false).catch(err => {
      console.error('Error restoring page in DB:', err);
    });
  }, []);

  const handlePermanentlyDeletePage = useCallback((id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));

    permanentlyDeletePageAction(id).catch(err => {
      console.error('Error permanently deleting page in DB:', err);
    });
  }, []);

  const handleEmptyTrash = useCallback(() => {
    if (confirm('Bạn có chắc chắn muốn xóa vĩnh viễn tất cả các trang trong Thùng rác không?')) {
      setPages(prev => prev.filter(p => !p.isArchived));
      emptyTrashAction().catch(err => {
        console.error('Error emptying trash in DB:', err);
      });
    }
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    setPages(prev => {
      const target = prev.find(p => p.id === id);
      const newStatus = !target?.isFavorite;
      handleUpdatePage(id, { isFavorite: newStatus });
      return prev.map(p => (p.id === id ? { ...p, isFavorite: newStatus } : p));
    });
  }, [handleUpdatePage]);

  const handleConvertToDatabase = useCallback((pageId: string) => {
    const activePage = pages.find(p => p.id === pageId);
    if (!activePage) return;
    const newDb = {
      id: `db-${Date.now()}`,
      title: activePage.title || 'Untitled Database',
      activeViewId: 'view-board',
      views: [
        { id: 'view-board', name: 'Board View', type: 'board' as const },
        { id: 'view-table', name: 'Table View', type: 'table' as const },
        { id: 'view-list', name: 'List View', type: 'list' as const },
      ],
      properties: [
        {
          id: 'status', name: 'Status', type: 'status' as const,
          options: [
            { id: 'To Do', label: 'To Do', color: 'bg-neutral-100 text-neutral-700' },
            { id: 'In Progress', label: 'In Progress', color: 'bg-blue-100 text-blue-700' },
            { id: 'Done', label: 'Done', color: 'bg-emerald-100 text-emerald-700' },
          ],
        },
        { id: 'assignee', name: 'Assignee', type: 'text' as const },
        { id: 'dueDate', name: 'Due Date', type: 'date' as const },
      ],
      items: [
        {
          id: `item-${Date.now()}-1`, title: 'Nhiệm vụ đầu tiên', icon: 'Sparkles',
          properties: { status: 'In Progress', assignee: 'Me', dueDate: new Date().toISOString().split('T')[0] },
          createdAt: Date.now(), updatedAt: Date.now(),
        },
      ],
    };
    handleUpdatePage(pageId, { isDatabase: true, database: newDb });
  }, [pages, handleUpdatePage]);

  const handleResetWorkspace = useCallback((): string => {
    reloadWorkspaceData();
    return pages[0]?.id || '';
  }, [reloadWorkspaceData, pages]);

  const handleExportWorkspaceJson = useCallback(() => {
    downloadFile(
      'workspace-backup.json',
      JSON.stringify({ workspaceName: workspaceInfo?.name || 'Workspace', exportedAt: new Date().toISOString(), pages }, null, 2),
      'application/json'
    );
  }, [pages, workspaceInfo]);

  const handleImportWorkspaceJson = useCallback((data: Workspace | { pages: Page[] }): string | null => {
    if (Array.isArray(data.pages)) {
      setPages(data.pages);
      return data.pages[0]?.id ?? null;
    }
    return null;
  }, []);

  return (
    <WorkspaceContext.Provider value={{
      pages, workspaceInfo, isFirstTime, isLoading, theme, sidebarCollapsed, isSearchOpen, isTrashOpen, isSettingsOpen,
      setSidebarCollapsed, setIsSearchOpen, setIsTrashOpen, setIsSettingsOpen,
      toggleTheme,
      handleUpdatePage, handleAddPage, handleDuplicatePage, handleDeletePage,
      handleRestorePage, handlePermanentlyDeletePage, handleEmptyTrash, handleToggleFavorite,
      handleConvertToDatabase, handleResetWorkspace,
      handleExportWorkspaceJson, handleImportWorkspaceJson, reloadWorkspaceData,
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}
