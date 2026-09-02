import { describe, expect, it } from "vitest";
import { vocabularySchema } from "@/schemas/vocabulary.schema";

describe("vocabularySchema", () => {
  it("should validate a valid vocabulary with image URL", () => {
    const validData = {
      topicId: "topic-1",
      word: "Resilience",
      meaning: "Sự kiên cường",
      category: "Daily Life",
      partOfSpeech: "Noun",
      imageUrl: "https://ik.imagekit.io/demo/resilience.png",
    };

    const result = vocabularySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept vocabulary without imageUrl or with empty string", () => {
    const validData = {
      topicId: "topic-1",
      word: "Perseverance",
      meaning: "Sự bền bỉ",
      category: "Daily Life",
      partOfSpeech: "Noun",
      imageUrl: "",
    };

    const result = vocabularySchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject an invalid imageUrl format", () => {
    const invalidData = {
      topicId: "topic-1",
      word: "Perseverance",
      meaning: "Sự bền bỉ",
      category: "Daily Life",
      partOfSpeech: "Noun",
      imageUrl: "not-a-valid-url",
    };

    const result = vocabularySchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
