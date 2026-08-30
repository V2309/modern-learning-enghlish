import prisma from '@/lib/db';

export interface SaveSentencePracticeInput {
  userSentence: string;
  isCorrect: boolean;
  score: number;
  targetWordUsed: boolean;
  feedback: string;
  grammarErrors: string[];
  suggestedSentence: string;
  suggestedSentenceMeaning: string;
}

export async function saveUserSentencePractice(
  userId: string,
  vocabularyId: string,
  data: SaveSentencePracticeInput
) {
  return await prisma.userSentencePractice.upsert({
    where: {
      uniqueUserVocabSentencePractice: {
        userId,
        vocabularyId,
      },
    },
    create: {
      userId,
      vocabularyId,
      userSentence: data.userSentence,
      isCorrect: data.isCorrect,
      score: data.score,
      targetWordUsed: data.targetWordUsed,
      feedback: data.feedback,
      grammarErrors: data.grammarErrors,
      suggestedSentence: data.suggestedSentence,
      suggestedSentenceMeaning: data.suggestedSentenceMeaning,
    },
    update: {
      userSentence: data.userSentence,
      isCorrect: data.isCorrect,
      score: data.score,
      targetWordUsed: data.targetWordUsed,
      feedback: data.feedback,
      grammarErrors: data.grammarErrors,
      suggestedSentence: data.suggestedSentence,
      suggestedSentenceMeaning: data.suggestedSentenceMeaning,
      updatedAt: new Date(),
    },
  });
}

export async function getUserSentencePracticesByTopic(userId: string, topicId: string) {
  return await prisma.userSentencePractice.findMany({
    where: {
      userId,
      vocabulary: {
        topicId,
      },
    },
    include: {
      vocabulary: {
        select: {
          id: true,
          word: true,
          meaning: true,
        },
      },
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });
}

export async function getUserSentencePractice(userId: string, vocabularyId: string) {
  return await prisma.userSentencePractice.findUnique({
    where: {
      uniqueUserVocabSentencePractice: {
        userId,
        vocabularyId,
      },
    },
  });
}
