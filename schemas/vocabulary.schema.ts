import { z } from "zod";

export const partOfSpeechEnum = z.enum([
  "Noun",
  "Verb",
  "Adjective",
  "Adverb",
  "Phrase",
  "Other",
]);

export const vocabularySchema = z.object({
  topicId: z.string().min(1, "Topic is required"),
  word: z.string().min(1, "Word is required").max(255),
  meaning: z.string().min(1, "Meaning is required"),
  definition: z.string().optional(),
  example: z.string().optional(),
  category: z.string().min(1, "Category is required").max(255),
  partOfSpeech: partOfSpeechEnum,
  pronunciation: z.string().optional(),
  imageUrl: z.string().url("Invalid image URL").optional().or(z.literal("")),
});

export const updateVocabularySchema = vocabularySchema.partial();

export type VocabularyInput = z.infer<typeof vocabularySchema>;
export type UpdateVocabularyInput = z.infer<typeof updateVocabularySchema>;
