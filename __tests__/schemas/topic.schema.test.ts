import { describe, expect, it } from "vitest";
import { topicSchema } from "@/schemas/topic.schema";

describe("topicSchema", () => {
  it("should validate a valid topic", () => {
    const validData = {
      name: "Conversational English",
      description: "Learn to speak fluently",
    };

    const result = topicSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should accept topic without description", () => {
    const validData = {
      name: "Conversational English",
    };

    const result = topicSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it("should reject an empty topic name", () => {
    const invalidData = {
      name: "",
      description: "Invalid",
    };

    const result = topicSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Topic name is required");
    }
  });

  it("should reject when name exceeds 255 characters", () => {
    const invalidData = {
      name: "a".repeat(256),
    };

    const result = topicSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});
