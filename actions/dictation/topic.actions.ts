"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/services/user.service";
import { revalidatePath } from "next/cache";

export async function getDictationTopics() {
  try {
    const user = await getCurrentUser();
    const topics = await prisma.dictationTopic.findMany({
      orderBy: { order: "asc" },
      include: {
        sentences: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!user) {
      return {
        success: true,
        topics: topics.map((t) => ({
          ...t,
          totalSentences: t.sentences.length,
          progress: 0,
          averageAccuracy: 0,
        })),
      };
    }

    // Get attempts for this user
    const attempts = await prisma.dictationAttempt.findMany({
      where: { userId: user.uid },
      select: {
        sentenceId: true,
        accuracy: true,
      },
    });

    // Get explicit completions
    const completions = await prisma.dictationTopicProgress.findMany({
      where: { userId: user.uid },
      select: { topicId: true }
    });
    const completedTopicIds = new Set(completions.map(c => c.topicId));

    // Group attempts by sentenceId to get the highest accuracy for each sentence
    const bestAttemptsMap: Record<string, number> = {};
    attempts.forEach((att) => {
      if (
        bestAttemptsMap[att.sentenceId] === undefined ||
        att.accuracy > bestAttemptsMap[att.sentenceId]
      ) {
        bestAttemptsMap[att.sentenceId] = att.accuracy;
      }
    });

    const topicsWithProgress = topics.map((topic) => {
      const sentenceIds = topic.sentences.map((s) => s.id);
      const totalSentences = sentenceIds.length;
      
      const attemptedSentences = sentenceIds.filter(
        (id) => bestAttemptsMap[id] !== undefined
      );
      const completedSentencesCount = attemptedSentences.length;

      const progress = totalSentences > 0 
        ? Math.round((completedSentencesCount / totalSentences) * 100) 
        : 0;

      const isExplicitlyCompleted = completedTopicIds.has(topic.id);

      const totalAccuracy = attemptedSentences.reduce(
        (sum, id) => sum + bestAttemptsMap[id],
        0
      );
      const averageAccuracy = completedSentencesCount > 0 
        ? Math.round(totalAccuracy / completedSentencesCount) 
        : 0;

      return {
        ...topic,
        totalSentences,
        progress,
        averageAccuracy,
        isCompleted: isExplicitlyCompleted,
      };
    });

    return { success: true, topics: topicsWithProgress };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch topics" };
  }
}

export async function getDictationTopicForPractice(topicId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const topic = await prisma.dictationTopic.findUnique({
      where: { id: topicId },
      include: {
        sentences: {
          select: {
            id: true,
            audioUrl: true,
            duration: true,
            order: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    // Get attempts for this topic's sentences
    const sentenceIds = topic.sentences.map((s) => s.id);
    const attempts = await prisma.dictationAttempt.findMany({
      where: {
        userId: user.uid,
        sentenceId: { in: sentenceIds },
      },
      orderBy: { createdAt: "desc" },
    });

    // Find the last completed sentence index or the highest attempted sentence order
    // to suggest "Continue"
    const completedIds = new Set(attempts.map((a) => a.sentenceId));
    let lastAttemptedIndex = -1;
    for (let i = 0; i < topic.sentences.length; i++) {
      if (completedIds.has(topic.sentences[i].id)) {
        lastAttemptedIndex = i;
      }
    }

    const startFromIndex = lastAttemptedIndex + 1 < topic.sentences.length 
      ? lastAttemptedIndex + 1 
      : 0;

    const completion = await prisma.dictationTopicProgress.findFirst({
      where: {
        userId: user.uid,
        topicId: topicId,
      },
    });

    return {
      success: true,
      topic: {
        ...topic,
        sentences: topic.sentences,
        isCompleted: !!completion,
      },
      startFromIndex,
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load topic" };
  }
}

export async function getDictationTopicForAdmin(topicId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const topic = await prisma.dictationTopic.findUnique({
      where: { id: topicId },
      include: {
        sentences: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!topic) {
      return { success: false, error: "Topic not found" };
    }

    return { success: true, topic };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load topic" };
  }
}

export async function createDictationTopic(data: {
  title: string;
  description?: string;
  thumbnail?: string;
  level: string;
  order?: number;
}) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const topic = await prisma.dictationTopic.create({
      data: {
        title: data.title,
        description: data.description,
        thumbnail: data.thumbnail,
        level: data.level,
        order: data.order ?? 0,
      },
    });

    revalidatePath("/dictation");
    revalidatePath("/admin/dictation");
    return { success: true, topic };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create topic" };
  }
}

export async function updateDictationTopic(
  topicId: string,
  data: {
    title?: string;
    description?: string;
    thumbnail?: string;
    level?: string;
    order?: number;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    const topic = await prisma.dictationTopic.update({
      where: { id: topicId },
      data,
    });

    revalidatePath("/dictation");
    revalidatePath(`/dictation/${topicId}`);
    revalidatePath("/admin/dictation");
    revalidatePath(`/admin/dictation/${topicId}`);
    return { success: true, topic };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update topic" };
  }
}

export async function deleteDictationTopic(topicId: string) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return { success: false, error: "Unauthorized" };
    }

    await prisma.dictationTopic.delete({
      where: { id: topicId },
    });

    revalidatePath("/dictation");
    revalidatePath("/admin/dictation");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete topic" };
  }
}

export async function toggleDictationTopicCompletionAction(topicId: string, complete: boolean) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    if (complete) {
      await prisma.dictationTopicProgress.upsert({
        where: {
          uniqueUserDictationTopicProgress: {
            userId: user.uid,
            topicId,
          },
        },
        update: {},
        create: {
          userId: user.uid,
          topicId,
        },
      });
    } else {
      await prisma.dictationTopicProgress.deleteMany({
        where: {
          userId: user.uid,
          topicId,
        },
      });
    }

    revalidatePath("/dictation");
    revalidatePath(`/dictation/${topicId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle completion status" };
  }
}

