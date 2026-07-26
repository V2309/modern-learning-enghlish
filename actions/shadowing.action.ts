"use server";

import { createShadowingVideo, updateShadowingVideo, deleteShadowingVideo } from "@/services/shadowing.service";
import { shadowingSchema, updateShadowingSchema } from "@/schemas/shadowing.schema";
import { revalidatePath } from "next/cache";

export async function createShadowingVideoAction(data: {
  title: string;
  description?: string;
  videoUrl: string;
  transcript: string;
  createdByUserId: string;
}) {
  try {
    const validation = shadowingSchema.safeParse({
      title: data.title,
      description: data.description,
      videoUrl: data.videoUrl,
      transcript: data.transcript,
    });
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const shadowing = await createShadowingVideo(data);
    revalidatePath("/shadowing");
    return { success: true, shadowing };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateShadowingVideoAction(id: string, data: {
  title?: string;
  description?: string;
  videoUrl?: string;
  transcript?: string;
}) {
  try {
    const validation = updateShadowingSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, errors: validation.error.flatten().fieldErrors };
    }

    const shadowing = await updateShadowingVideo(id, data);
    revalidatePath("/shadowing");
    revalidatePath(`/shadowing/${id}`);
    return { success: true, shadowing };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteShadowingVideoAction(id: string) {
  try {
    await deleteShadowingVideo(id);
    revalidatePath("/shadowing");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
