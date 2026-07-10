"use server";

import { createVocabulary, updateVocabulary, deleteVocabulary } from "@/services/vocabulary.service";
import { vocabularySchema, updateVocabularySchema } from "@/schemas/vocabulary.schema";
import { PartOfSpeech } from "@prisma/client";
import { revalidatePath } from "next/cache";

export async function createVocabularyAction(data: {
  topicId: string;
  word: string;
  meaning: string;
  definition?: string;
  example?: string;
  examples?: string[];
  category: string;
  partOfSpeech: PartOfSpeech;
  pronunciation?: string;
  imageUrl?: string;
  createdByUserId?: string;
}) {
  try {
    const validation = vocabularySchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const vocab = await createVocabulary({
      ...validation.data,
      examples: data.examples, // Pass raw examples as they are handled manually in service
      createdByUserId: data.createdByUserId
    });
    revalidatePath(`/vocabulary/topic/${data.topicId}`);
    revalidatePath("/progress");
    revalidatePath("/dashboard");
    return { success: true, vocabulary: vocab };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateVocabularyAction(vocabularyId: string, topicId: string, data: {
  topicId?: string;
  word?: string;
  meaning?: string;
  definition?: string;
  example?: string;
  examples?: string[];
  category?: string;
  partOfSpeech?: PartOfSpeech;
  pronunciation?: string;
  imageUrl?: string;
}) {
  try {
    const validation = updateVocabularySchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const vocab = await updateVocabulary(vocabularyId, {
      ...validation.data,
      examples: data.examples // Pass raw examples as they are handled manually in service
    });
    revalidatePath(`/vocabulary/topic/${topicId}`);
    return { success: true, vocabulary: vocab };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteVocabularyAction(vocabularyId: string, topicId: string) {
  try {
    await deleteVocabulary(vocabularyId);
    revalidatePath(`/vocabulary/topic/${topicId}`);
    revalidatePath("/progress");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
