"use server";

import { redeemCourseAccess, autoGrantFreeAccess } from "@/services/course.service";
import { getCurrentUser } from "@/services/user.service";
import { revalidatePath } from "next/cache";

export async function redeemAccessCodeAction(courseId: string, code: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Vui lòng đăng nhập để tiếp tục." };

    const result = await redeemCourseAccess(user.uid, courseId, code);
    if (result.success) {
      revalidatePath("/courses");
      revalidatePath(`/courses/${courseId}`);
      revalidatePath("/my-courses");
    }
    return result;
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function autoGrantFreeAccessAction(courseId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Vui lòng đăng nhập để tiếp tục." };

    await autoGrantFreeAccess(user.uid, courseId);
    revalidatePath("/courses");
    revalidatePath(`/courses/${courseId}`);
    revalidatePath("/my-courses");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
