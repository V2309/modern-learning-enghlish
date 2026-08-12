"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/services/user.service";
import { revalidatePath } from "next/cache";

export async function createDictationSentence(data: {
  topicId: string;
  audioUrl: string;
  transcript: string;
  duration: number;
  order: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const sentence = await prisma.dictationSentence.create({
      data: {
        topicId: data.topicId,
        audioUrl: data.audioUrl,
        transcript: data.transcript,
        duration: data.duration,
        order: data.order,
      },
    });

    revalidatePath(`/dictation/${data.topicId}`);
    revalidatePath(`/admin/dictation/${data.topicId}`);
    return { success: true, sentence };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create sentence" };
  }
}

export async function updateDictationSentence(
  sentenceId: string,
  data: {
    audioUrl?: string;
    transcript?: string;
    duration?: number;
    order?: number;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const sentence = await prisma.dictationSentence.update({
      where: { id: sentenceId },
      data,
    });

    revalidatePath(`/dictation/${sentence.topicId}`);
    revalidatePath(`/admin/dictation/${sentence.topicId}`);
    return { success: true, sentence };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update sentence" };
  }
}

export async function deleteDictationSentence(sentenceId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const sentence = await prisma.dictationSentence.delete({
      where: { id: sentenceId },
    });

    revalidatePath(`/dictation/${sentence.topicId}`);
    revalidatePath(`/admin/dictation/${sentence.topicId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete sentence" };
  }
}

export async function reorderDictationSentences(
  topicId: string,
  sentences: { id: string; order: number }[]
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.$transaction(
      sentences.map((s) =>
        prisma.dictationSentence.update({
          where: { id: s.id },
          data: { order: s.order },
        })
      )
    );

    revalidatePath(`/dictation/${topicId}`);
    revalidatePath(`/admin/dictation/${topicId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reorder sentences" };
  }
}
