import { z } from "zod";

export const userSchema = z.object({
  uid: z.string().min(1, "User ID is required"),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email address"),
});

export const updateUserSchema = userSchema.pick({
  name: true,
  email: true,
});

export type UserInput = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
