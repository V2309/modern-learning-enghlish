import { z } from "zod";

export const topicSchema = z.object({
  name: z.string().min(1, "Topic name is required").max(255),
  description: z.string().optional(),
});

export const updateTopicSchema = topicSchema.partial();

export type TopicInput = z.infer<typeof topicSchema>;
export type UpdateTopicInput = z.infer<typeof updateTopicSchema>;
