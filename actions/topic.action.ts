"use server";

import { createTopic, updateTopic, deleteTopic } from "@/services/topic.service";
import { topicSchema, updateTopicSchema } from "@/schemas/topic.schema";
import { revalidatePath } from "next/cache";

export async function createTopicAction(data: { name: string; description?: string; createdByUserId?: string }) {
  try {
    const validation = topicSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const topic = await createTopic(validation.data);
    revalidatePath("/vocabulary");
    return { success: true, topic };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTopicAction(topicId: string, data: { name?: string; description?: string }) {
  try {
    const validation = updateTopicSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const topic = await updateTopic(topicId, validation.data);
    revalidatePath("/vocabulary");
    revalidatePath(`/vocabulary/topic/${topicId}`);
    return { success: true, topic };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTopicAction(topicId: string) {
  try {
    await deleteTopic(topicId);
    revalidatePath("/vocabulary");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
