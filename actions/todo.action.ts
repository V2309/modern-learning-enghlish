"use server";

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

// ─── TodoList CRUD ────────────────────────────────────────────────────────────

export async function createTodoListAction(
  userId: string,
  title: string,
  frequency: "daily" | "weekly",
  courseId?: string
) {
  try {
    if (!userId || !title.trim()) {
      return { success: false, error: "Missing required fields" };
    }

    // Determine next order
    const maxOrder = await prisma.todoList.aggregate({
      where: { userId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const list = await prisma.todoList.create({
      data: {
        userId,
        title: title.trim(),
        frequency,
        order,
        ...(courseId ? { courseId } : {}),
      },
    });

    revalidatePath("/todo");
    revalidatePath("/dashboard");
    return { success: true, list };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTodoListAction(
  id: string,
  userId: string,
  title: string,
  frequency: "daily" | "weekly"
) {
  try {
    if (!title.trim()) return { success: false, error: "Title is required" };

    await prisma.todoList.updateMany({
      where: { id, userId },
      data: { title: title.trim(), frequency },
    });

    revalidatePath("/todo");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTodoListAction(id: string, userId: string) {
  try {
    await prisma.todoList.deleteMany({ where: { id, userId } });
    revalidatePath("/todo");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── TodoTask CRUD ────────────────────────────────────────────────────────────

export async function createTodoTaskAction(
  todoListId: string,
  userId: string,
  content: string
) {
  try {
    if (!content.trim()) return { success: false, error: "Content is required" };

    // Verify ownership
    const list = await prisma.todoList.findFirst({
      where: { id: todoListId, userId },
    });
    if (!list) return { success: false, error: "Todo list not found" };

    const maxOrder = await prisma.todoTask.aggregate({
      where: { todoListId },
      _max: { order: true },
    });
    const order = (maxOrder._max.order ?? -1) + 1;

    const task = await prisma.todoTask.create({
      data: { todoListId, content: content.trim(), order },
    });

    revalidatePath("/todo");
    revalidatePath("/dashboard");
    return { success: true, task };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Create multiple tasks at once from a newline-separated string.
 */
export async function createTodoTasksBulkAction(
  todoListId: string,
  userId: string,
  rawContent: string
) {
  try {
    // Verify ownership
    const list = await prisma.todoList.findFirst({
      where: { id: todoListId, userId },
    });
    if (!list) return { success: false, error: "Todo list not found" };

    const lines = rawContent
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (lines.length === 0) return { success: false, error: "Content is required" };

    const maxOrder = await prisma.todoTask.aggregate({
      where: { todoListId },
      _max: { order: true },
    });
    let nextOrder = (maxOrder._max.order ?? -1) + 1;

    const tasks = await prisma.$transaction(
      lines.map((content) =>
        prisma.todoTask.create({
          data: { todoListId, content, order: nextOrder++ },
        })
      )
    );

    revalidatePath("/todo");
    revalidatePath("/dashboard");
    return { success: true, tasks };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}


export async function updateTodoTaskAction(
  id: string,
  userId: string,
  content: string
) {
  try {
    if (!content.trim()) return { success: false, error: "Content is required" };

    // Verify ownership via join
    const task = await prisma.todoTask.findFirst({
      where: { id, todoList: { userId } },
    });
    if (!task) return { success: false, error: "Task not found" };

    await prisma.todoTask.update({
      where: { id },
      data: { content: content.trim() },
    });

    revalidatePath("/todo");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTodoTaskAction(id: string, userId: string) {
  try {
    const task = await prisma.todoTask.findFirst({
      where: { id, todoList: { userId } },
    });
    if (!task) return { success: false, error: "Task not found" };

    await prisma.todoTask.delete({ where: { id } });
    revalidatePath("/todo");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ─── Completion toggle ────────────────────────────────────────────────────────

export async function toggleTodoCompletionAction(
  userId: string,
  taskId: string,
  date: string, // "YYYY-MM-DD"
  completed: boolean
) {
  try {
    if (completed) {
      await prisma.todoCompletion.upsert({
        where: {
          uniqueUserTaskDate: { userId, taskId, date },
        },
        create: { userId, taskId, date },
        update: {},
      });
    } else {
      await prisma.todoCompletion.deleteMany({
        where: { userId, taskId, date },
      });
    }

    revalidatePath("/todo");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
