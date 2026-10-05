import prisma from '@/lib/db';
import { getCurrentUser } from '@/services/user.service';
import { Block, BlockType, Page, Workspace } from '@/types/notion';

/**
 * Helper to ensure an authenticated user exists for workspace operations
 */
async function getOrCreateWorkspaceUser() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    throw new Error('UNAUTHORIZED');
  }
  return currentUser;
}

/**
 * Convert Prisma Block to Notion Block
 */
function toClientBlock(b: any): Block {
  const rawContent = b.content;
  let text = '';
  let checked: boolean | undefined;
  let isOpen: boolean | undefined;
  let children: Block[] | undefined;
  let color: any;
  let bgColor: any;
  let meta: any;

  if (typeof rawContent === 'object' && rawContent !== null) {
    text = typeof rawContent.text === 'string' ? rawContent.text : '';
    checked = rawContent.checked;
    isOpen = rawContent.isOpen;
    children = rawContent.children;
    color = rawContent.color;
    bgColor = rawContent.bgColor;
    meta = rawContent.meta;
  } else if (typeof rawContent === 'string') {
    text = rawContent;
  }

  return {
    id: b.id,
    type: b.type as BlockType,
    content: text,
    checked,
    isOpen,
    children,
    color,
    bgColor,
    meta,
  };
}

/**
 * Convert Prisma Page to Notion Page
 */
function toClientPage(p: any): Page {
  return {
    id: p.id,
    parentId: p.parentId,
    title: p.title,
    icon: p.icon || undefined,
    cover: p.cover as any,
    isFavorite: p.isFavorite,
    isArchived: p.isArchived,
    isDatabase: p.isDatabase,
    database: (p.databaseConfig as any) || undefined,
    fontPreference: (p.fontPreference as any) || 'sans',
    isFullWidth: p.isFullWidth,
    createdAt: new Date(p.createdAt).getTime(),
    updatedAt: new Date(p.updatedAt).getTime(),
    blocks: p.blocks ? p.blocks.map(toClientBlock) : [],
  };
}

/**
 * Get or initialize workspace for user
 */
export async function getOrCreateWorkspace(): Promise<{ workspace: any; pages: Page[]; isNewUser: boolean }> {
  const user = await getOrCreateWorkspaceUser();
  let isNewUser = false;

  let workspace = await prisma.workspace.findFirst({
    where: { userId: user.uid },
    include: {
      user: {
        select: { name: true, email: true },
      },
      pages: {
        orderBy: { order: 'asc' },
        include: {
          blocks: {
            orderBy: { order: 'asc' },
          },
        },
      },
    },
  });

  if (!workspace) {
    isNewUser = true;
    const workspaceName = `Workspace của ${user.name || 'Bạn'}`;

    // Create new personal workspace in PostgreSQL for this specific user
    const created = await prisma.workspace.create({
      data: {
        userId: user.uid,
        name: workspaceName,
        icon: 'Layers',
      },
    });

    // Seed default starter workspace pages into database
    await seedDefaultWorkspacePages(created.id, user.name);

    // Re-fetch created workspace with pages and blocks
    workspace = await prisma.workspace.findUnique({
      where: { id: created.id },
      include: {
        user: {
          select: { name: true, email: true },
        },
        pages: {
          orderBy: { order: 'asc' },
          include: {
            blocks: {
              orderBy: { order: 'asc' },
            },
          },
        },
      },
    });
  }

  const clientPages = (workspace?.pages || []).map(toClientPage);
  return {
    workspace: {
      ...workspace,
      userId: user.uid,
      userName: user.name || 'User',
      userEmail: user.email || '',
    },
    pages: clientPages,
    isNewUser,
  };
}

/**
 * Seeds clean default starter pages into PostgreSQL for first-time user
 */
async function seedDefaultWorkspacePages(workspaceId: string, userName?: string) {
  const welcomeText = userName
    ? `Chào mừng ${userName} đến với Workspace cá nhân!`
    : 'Chào mừng bạn đến với Workspace cá nhân!';

  // 1. Parent Page: Getting Started
  const parentPage = await prisma.page.create({
    data: {
      workspaceId,
      parentId: null,
      title: 'Getting Started (Bắt đầu)',
      icon: 'Sparkles',
      cover: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #06b6d4 100%)',
      },
      isFavorite: true,
      isArchived: false,
      fontPreference: 'sans',
      isFullWidth: false,
      order: 0,
      blocks: {
        create: [
          {
            type: 'callout',
            order: 0,
            content: {
              text: `${welcomeText} Đây là không gian làm việc số cá nhân giúp bạn ghi chép, quản lý dự án và tài liệu thông minh.`,
              meta: { calloutIcon: 'Lightbulb' },
            } as any,
          },
          {
            type: 'heading_1',
            order: 1,
            content: { text: 'Thao tác cơ bản trong Workspace' } as any,
          },
          {
            type: 'paragraph',
            order: 2,
            content: { text: 'Gõ phím tắt / trên một dòng trống để hiển thị danh sách các khối nội dung (Heading, To-do list, Quote, Code, Callout, Table...).' } as any,
          },
          {
            type: 'heading_2',
            order: 3,
            content: { text: 'Những việc cần làm thử' } as any,
          },
          {
            type: 'todo',
            order: 4,
            content: { text: 'Tạo một trang mới bằng nút + New Page ở thanh bên trái', checked: true } as any,
          },
          {
            type: 'todo',
            order: 5,
            content: { text: 'Thử kéo thả hoặc thay đổi icon và ảnh bìa cho trang', checked: false } as any,
          },
          {
            type: 'todo',
            order: 6,
            content: { text: 'Khám phá trang Database mẫu Tasks & Projects', checked: false } as any,
          },
          {
            type: 'quote',
            order: 7,
            content: { text: '“Organize your thoughts, plan your projects, and capture ideas in one place.”' } as any,
          },
        ],
      },
    },
  });

  // 2. Sub-Page: Quick Notes
  await prisma.page.create({
    data: {
      workspaceId,
      parentId: parentPage.id,
      title: 'Quick Notes (Ghi chú nhanh)',
      icon: 'FileText',
      cover: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
      },
      isFavorite: false,
      isArchived: false,
      fontPreference: 'sans',
      order: 1,
      blocks: {
        create: [
          {
            type: 'callout',
            order: 0,
            content: {
              text: 'Nơi lưu lại các ghi chép nhanh, ý tưởng bất chợt và việc cần làm trong ngày.',
              meta: { calloutIcon: 'FileText' },
            } as any,
          },
          {
            type: 'heading_2',
            order: 1,
            content: { text: 'Ý tưởng hôm nay' } as any,
          },
          {
            type: 'bulleted_list',
            order: 2,
            content: { text: 'Lên kế hoạch phát triển các tính năng tiếp theo cho dự án' } as any,
          },
          {
            type: 'bulleted_list',
            order: 3,
            content: { text: 'Tối ưu hiệu năng và giao diện người dùng' } as any,
          },
        ],
      },
    },
  });

  // 3. Sub-Page: Tasks & Projects Database
  await prisma.page.create({
    data: {
      workspaceId,
      parentId: parentPage.id,
      title: 'Tasks & Projects (Nhiệm vụ & Dự án)',
      icon: 'Kanban',
      cover: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
      },
      isFavorite: true,
      isArchived: false,
      isDatabase: true,
      order: 2,
      databaseConfig: {
        id: `db-${workspaceId}`,
        title: 'Project Roadmap & Tasks',
        activeViewId: 'view-board',
        views: [
          { id: 'view-board', name: 'Board View (Kanban)', type: 'board' },
          { id: 'view-table', name: 'Table View (Bảng)', type: 'table' },
          { id: 'view-gallery', name: 'Gallery View (Thẻ)', type: 'gallery' },
        ],
        properties: [
          {
            id: 'status',
            name: 'Trạng thái',
            type: 'status',
            options: [
              { id: 'To Do', label: 'To Do', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
              { id: 'In Progress', label: 'In Progress', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
              { id: 'Done', label: 'Done', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
            ],
          },
          {
            id: 'priority',
            name: 'Độ ưu tiên',
            type: 'select',
            options: [
              { id: 'High', label: 'P1 - High', color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' },
              { id: 'Medium', label: 'P2 - Medium', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
              { id: 'Low', label: 'P3 - Low', color: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300' },
            ],
          },
          { id: 'assignee', name: 'Người thực hiện', type: 'text' },
          { id: 'dueDate', name: 'Hạn chót', type: 'date' },
        ],
        items: [
          {
            id: `task-item-1-${Date.now()}`,
            title: 'Khởi tạo cấu trúc Workspace và cơ sở dữ liệu',
            icon: 'Sparkles',
            properties: {
              status: 'Done',
              priority: 'High',
              assignee: 'Team',
              dueDate: new Date().toISOString().split('T')[0],
            },
            createdAt: Date.now() - 86400000 * 2,
            updatedAt: Date.now(),
          },
          {
            id: `task-item-2-${Date.now()}`,
            title: 'Thiết kế giao diện Notion phong cách hiện đại',
            icon: 'LayoutGrid',
            properties: {
              status: 'In Progress',
              priority: 'High',
              assignee: 'Design',
              dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
            },
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now(),
          },
          {
            id: `task-item-3-${Date.now()}`,
            title: 'Kiểm thử đồng bộ và trải nghiệm người dùng',
            icon: 'FileText',
            properties: {
              status: 'To Do',
              priority: 'Medium',
              assignee: 'QA',
              dueDate: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
            },
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      },
    },
  });
}

/**
 * Get single page with its blocks
 */
export async function getPageWithBlocks(pageId: string): Promise<Page | null> {
  const user = await getOrCreateWorkspaceUser();
  const p = await prisma.page.findFirst({
    where: {
      id: pageId,
      workspace: { userId: user.uid },
    },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  });
  if (!p) return null;
  return toClientPage(p);
}

/**
 * Create a new page
 */
export async function createPage(data: {
  id?: string;
  parentId?: string | null;
  title?: string;
  icon?: string;
  cover?: any;
  isDatabase?: boolean;
  databaseConfig?: any;
  blocks?: Block[];
}): Promise<Page> {
  const { workspace } = await getOrCreateWorkspace();
  const maxOrderPage = await prisma.page.findFirst({
    where: { workspaceId: workspace.id },
    orderBy: { order: 'desc' },
  });
  const nextOrder = (maxOrderPage?.order ?? -1) + 1;

  const newPage = await prisma.page.create({
    data: {
      id: data.id || undefined,
      workspaceId: workspace.id,
      parentId: data.parentId || null,
      title: data.title || 'Untitled',
      icon: data.icon || 'FileText',
      cover: data.cover || null,
      isDatabase: data.isDatabase ?? false,
      databaseConfig: data.databaseConfig || null,
      order: nextOrder,
      blocks: data.blocks && data.blocks.length > 0 ? {
        create: data.blocks.map((b, idx) => ({
          id: b.id,
          type: b.type,
          order: idx,
          content: {
            text: b.content,
            checked: b.checked,
            isOpen: b.isOpen,
            children: b.children,
            color: b.color,
            bgColor: b.bgColor,
            meta: b.meta,
          } as any,
        })),
      } : {
        create: [
          {
            type: 'paragraph',
            order: 0,
            content: { text: '' },
          },
        ],
      },
    },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return toClientPage(newPage);
}

/**
 * Update page metadata & settings
 */
export async function updatePageInDb(pageId: string, updates: Partial<Page>): Promise<Page> {
  const user = await getOrCreateWorkspaceUser();
  const existingPage = await prisma.page.findFirst({
    where: { id: pageId, workspace: { userId: user.uid } },
  });
  if (!existingPage) throw new Error('Page not found or unauthorized');

  const updateData: any = {};
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.icon !== undefined) updateData.icon = updates.icon;
  if (updates.cover !== undefined) updateData.cover = updates.cover;
  if (updates.isFavorite !== undefined) updateData.isFavorite = updates.isFavorite;
  if (updates.isArchived !== undefined) updateData.isArchived = updates.isArchived;
  if (updates.isDatabase !== undefined) updateData.isDatabase = updates.isDatabase;
  if (updates.database !== undefined) updateData.databaseConfig = updates.database;
  if (updates.fontPreference !== undefined) updateData.fontPreference = updates.fontPreference;
  if (updates.isFullWidth !== undefined) updateData.isFullWidth = updates.isFullWidth;
  if (updates.parentId !== undefined) updateData.parentId = updates.parentId;

  // If blocks are included in update
  if (updates.blocks && Array.isArray(updates.blocks)) {
    await prisma.$transaction(async (tx) => {
      await tx.block.deleteMany({ where: { pageId } });
      if (updates.blocks!.length > 0) {
        await tx.block.createMany({
          data: updates.blocks!.map((b, idx) => ({
            id: b.id,
            pageId,
            type: b.type,
            order: idx,
            content: {
              text: b.content,
              checked: b.checked,
              isOpen: b.isOpen,
              children: b.children,
              color: b.color,
              bgColor: b.bgColor,
              meta: b.meta,
            } as any,
          })),
        });
      }
    });
  }

  const updated = await prisma.page.update({
    where: { id: pageId },
    data: updateData,
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return toClientPage(updated);
}

/**
 * Save page blocks explicitly
 */
export async function savePageBlocksInDb(pageId: string, blocks: Block[]): Promise<void> {
  const user = await getOrCreateWorkspaceUser();
  const existingPage = await prisma.page.findFirst({
    where: { id: pageId, workspace: { userId: user.uid } },
  });
  if (!existingPage) throw new Error('Page not found or unauthorized');

  await prisma.$transaction(async (tx) => {
    await tx.block.deleteMany({ where: { pageId } });
    if (blocks.length > 0) {
      await tx.block.createMany({
        data: blocks.map((b, idx) => ({
          id: b.id,
          pageId,
          type: b.type,
          order: idx,
          content: {
            text: b.content,
            checked: b.checked,
            isOpen: b.isOpen,
            children: b.children,
            color: b.color,
            bgColor: b.bgColor,
            meta: b.meta,
          } as any,
        })),
      });
    }
  });
}

/**
 * Duplicate a page and its blocks
 */
export async function duplicatePageInDb(sourcePageId: string, newId?: string): Promise<Page> {
  const user = await getOrCreateWorkspaceUser();
  const source = await prisma.page.findFirst({
    where: { id: sourcePageId, workspace: { userId: user.uid } },
    include: { blocks: { orderBy: { order: 'asc' } } },
  });
  if (!source) throw new Error('Source page not found');

  const duplicated = await prisma.page.create({
    data: {
      id: newId || undefined,
      workspaceId: source.workspaceId,
      parentId: source.parentId,
      title: `${source.title} (Copy)`,
      icon: source.icon,
      cover: source.cover || undefined,
      isDatabase: source.isDatabase,
      databaseConfig: source.databaseConfig || undefined,
      fontPreference: source.fontPreference,
      isFullWidth: source.isFullWidth,
      order: source.order + 1,
      blocks: {
        create: source.blocks.map((b, idx) => ({
          type: b.type,
          order: idx,
          content: b.content as any,
        })),
      },
    },
    include: {
      blocks: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return toClientPage(duplicated);
}

/**
 * Archive / Unarchive page
 */
export async function setPageArchivedInDb(pageId: string, isArchived: boolean): Promise<void> {
  const user = await getOrCreateWorkspaceUser();
  const page = await prisma.page.findFirst({
    where: { id: pageId, workspace: { userId: user.uid } },
  });
  if (!page) throw new Error('Unauthorized');

  await prisma.page.update({
    where: { id: pageId },
    data: { isArchived },
  });
}

/**
 * Permanently delete page
 */
export async function permanentlyDeletePageInDb(pageId: string): Promise<void> {
  const user = await getOrCreateWorkspaceUser();
  const page = await prisma.page.findFirst({
    where: { id: pageId, workspace: { userId: user.uid } },
  });
  if (!page) throw new Error('Unauthorized');

  await prisma.page.delete({
    where: { id: pageId },
  });
}

/**
 * Empty trash
 */
export async function emptyTrashInDb(): Promise<void> {
  const { workspace } = await getOrCreateWorkspace();
  await prisma.page.deleteMany({
    where: {
      workspaceId: workspace.id,
      isArchived: true,
    },
  });
}

