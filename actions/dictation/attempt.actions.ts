"use server";

import prisma from "@/lib/db";
import { getCurrentUser } from "@/services/user.service";
import { calculateAccuracy } from "@/lib/dictation/calculate-accuracy";
import { revalidatePath } from "next/cache";

export async function submitDictationAnswer(sentenceId: string, answer: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const sentence = await prisma.dictationSentence.findUnique({
      where: { id: sentenceId },
      include: {
        topic: true
      }
    });

    if (!sentence) {
      return { success: false, error: "Sentence not found" };
    }

    // Run comparison and accuracy calculation on server
    const comparison = calculateAccuracy(sentence.transcript, answer);

    // Save attempt
    const attempt = await prisma.dictationAttempt.create({
      data: {
        userId: user.uid,
        sentenceId: sentence.id,
        answer: answer,
        accuracy: comparison.accuracy,
        correctWords: comparison.correctWords,
        wrongWords: comparison.wrongWords,
        missingWords: comparison.missingWords,
        extraWords: comparison.extraWords,
      },
    });

    revalidatePath(`/dictation/${sentence.topicId}`);
    revalidatePath("/dictation");
    
    return {
      success: true,
      attempt,
      comparison: {
        ...comparison,
        transcript: sentence.transcript // Return correct transcript now that it's submitted
      }
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to submit answer" };
  }
}

export async function getTopicAttempts(topicId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: "Unauthorized" };
    }

    const attempts = await prisma.dictationAttempt.findMany({
      where: {
        userId: user.uid,
        sentence: {
          topicId: topicId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        sentence: true,
      },
    });

    return { success: true, attempts };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load attempts" };
  }
}
