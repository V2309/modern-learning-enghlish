import { describe, expect, it, vi, beforeEach } from "vitest";
import { mockDeep, mockReset, DeepMockProxy } from "vitest-mock-extended";
import { PrismaClient } from "@prisma/client";
import prisma from "@/lib/db";
import { getCourses, getCourseById, createCourse } from "@/services/course.service";

// Mock the global prisma client
vi.mock("@/lib/db", () => ({
  __esModule: true,
  default: mockDeep<PrismaClient>(),
}));

const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;

describe("Course Service", () => {
  beforeEach(() => {
    mockReset(prismaMock);
  });

  describe("getCourses", () => {
    it("should return all courses", async () => {
      const mockCourses = [
        {
          id: "course_1",
          title: "Beginner English",
          description: "Basic English course",
          thumbnail: "https://example.com/image.jpg",
          level: "Beginner" as const,
          createdAt: new Date(),
        },
      ];

      prismaMock.course.findMany.mockResolvedValue(mockCourses as any);

      const result = await getCourses();

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe("Beginner English");
      expect(prismaMock.course.findMany).toHaveBeenCalledWith({
        orderBy: { createdAt: "desc" },
        include: { lessons: true },
      });
    });
  });

  describe("getCourseById", () => {
    it("should return a course by ID", async () => {
      const mockCourse = {
        id: "course_1",
        title: "Beginner English",
        description: "Basic English course",
        thumbnail: "https://example.com/image.jpg",
        level: "Beginner" as const,
        createdAt: new Date(),
        lessons: [],
      };

      prismaMock.course.findUnique.mockResolvedValue(mockCourse as any);

      const result = await getCourseById("course_1");

      expect(result).not.toBeNull();
      expect(result?.title).toBe("Beginner English");
      expect(prismaMock.course.findUnique).toHaveBeenCalledWith({
        where: { id: "course_1" },
        include: {
          lessons: {
            orderBy: { createdAt: "asc" },
          },
        },
      });
    });

    it("should return null if course is not found", async () => {
      prismaMock.course.findUnique.mockResolvedValue(null);

      const result = await getCourseById("invalid_id");

      expect(result).toBeNull();
    });
  });

  describe("createCourse", () => {
    it("should create a course and return it", async () => {
      const courseData = {
        title: "Advanced English",
        description: "Advanced English course",
        thumbnail: "https://example.com/image.jpg",
        level: "Advanced" as const,
        lessons: [
          {
            title: "Lesson 1",
            duration: "10m",
            videoUrl: "https://example.com/video1.mp4",
            description: "First lesson",
          },
        ],
      };

      const mockCreatedCourse = {
        id: "course-12345",
        title: courseData.title,
        description: courseData.description,
        thumbnail: courseData.thumbnail,
        level: courseData.level,
        createdAt: new Date(),
        lessons: [
          {
            id: "lesson-12345-0",
            title: "Lesson 1",
            duration: "10m",
            videoUrl: "https://example.com/video1.mp4",
            description: "First lesson",
            courseId: "course-12345",
            createdAt: new Date(),
          },
        ],
      };

      prismaMock.course.create.mockResolvedValue(mockCreatedCourse as any);

      const result = await createCourse(courseData);

      expect(result).not.toBeNull();
      expect(result.title).toBe("Advanced English");
      expect(result.lessons).toHaveLength(1);
      expect(prismaMock.course.create).toHaveBeenCalled();
    });
  });
});
