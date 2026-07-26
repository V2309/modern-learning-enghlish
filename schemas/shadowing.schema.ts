import { z } from "zod";

export const shadowingSchema = z.object({
  title: z.string().min(1, "Tiêu đề không được để trống").max(255),
  description: z.string().optional(),
  videoUrl: z.string().url("Đường dẫn video không hợp lệ"),
  transcript: z.string().min(1, "Nội dung phụ đề không được để trống"),
});

export const updateShadowingSchema = shadowingSchema.partial();

export type ShadowingInput = z.infer<typeof shadowingSchema>;
export type UpdateShadowingInput = z.infer<typeof updateShadowingSchema>;
