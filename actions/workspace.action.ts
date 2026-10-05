"use server";

import {
  getOrCreateWorkspace,
  getPageWithBlocks,
  createPage,
  updatePageInDb,
  savePageBlocksInDb,
  duplicatePageInDb,
  setPageArchivedInDb,
  permanentlyDeletePageInDb,
  emptyTrashInDb,
} from "@/services/workspace.service";
import { Block, Page } from "@/types/notion";
import { revalidatePath } from "next/cache";

function safeRevalidate() {
  try {
    revalidatePath("/workspace");
  } catch {}
}

export async function fetchWorkspaceDataAction() {
  try {
    const { workspace, pages, isNewUser } = await getOrCreateWorkspace();
    return {
      success: true,
      workspace: {
        id: workspace.id,
        userId: workspace.userId,
        name: workspace.name,
        icon: workspace.icon,
        userName: workspace.user?.name || workspace.userName || workspace.name || 'User',
        userEmail: workspace.user?.email || workspace.userEmail || '',
      },
      pages,
      isNewUser,
    };
  } catch (error: any) {
    console.error("fetchWorkspaceDataAction error:", error);
    const isUnauthorized = error.message === 'UNAUTHORIZED';
    return {
      success: false,
      error: error.message || "Failed to load workspace data",
      notAuthenticated: isUnauthorized,
      pages: [],
    };
  }
}

export async function fetchPageAction(pageId: string) {
  try {
    const page = await getPageWithBlocks(pageId);
    return { success: true, page };
  } catch (error: any) {
    console.error("fetchPageAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function createPageAction(data: {
  id?: string;
  parentId?: string | null;
  title?: string;
  icon?: string;
  cover?: any;
  isDatabase?: boolean;
  databaseConfig?: any;
  blocks?: Block[];
}) {
  try {
    const newPage = await createPage(data);
    safeRevalidate();
    return { success: true, page: newPage };
  } catch (error: any) {
    console.error("createPageAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function updatePageAction(pageId: string, updates: Partial<Page>) {
  try {
    const updated = await updatePageInDb(pageId, updates);
    safeRevalidate();
    return { success: true, page: updated };
  } catch (error: any) {
    console.error("updatePageAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function savePageBlocksAction(pageId: string, blocks: Block[]) {
  try {
    await savePageBlocksInDb(pageId, blocks);
    return { success: true };
  } catch (error: any) {
    console.error("savePageBlocksAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function duplicatePageAction(sourcePageId: string, newId?: string) {
  try {
    const duplicated = await duplicatePageInDb(sourcePageId, newId);
    safeRevalidate();
    return { success: true, page: duplicated };
  } catch (error: any) {
    console.error("duplicatePageAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function setPageArchivedAction(pageId: string, isArchived: boolean) {
  try {
    await setPageArchivedInDb(pageId, isArchived);
    safeRevalidate();
    return { success: true };
  } catch (error: any) {
    console.error("setPageArchivedAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function permanentlyDeletePageAction(pageId: string) {
  try {
    await permanentlyDeletePageInDb(pageId);
    safeRevalidate();
    return { success: true };
  } catch (error: any) {
    console.error("permanentlyDeletePageAction error:", error);
    return { success: false, error: error.message };
  }
}

export async function emptyTrashAction() {
  try {
    await emptyTrashInDb();
    safeRevalidate();
    return { success: true };
  } catch (error: any) {
    console.error("emptyTrashAction error:", error);
    return { success: false, error: error.message };
  }
}
