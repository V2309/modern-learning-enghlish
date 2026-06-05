import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL;
  const pool = new pg.Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma;

/**
 * Seeds initial data if the database is empty.
 */
export async function seedIfEmpty() {
  try {
    const courseCount = await prisma.course.count();
    const topicCount = await prisma.topic.count();
    if (courseCount === 0 && topicCount === 0) {
      console.log("Database is empty. Seeding initial data...");
      const { COURSES_DATA, TOPICS_DATA } = await import("@/data/mockData");
      
      // Seed topics and vocabulary
      for (const topic of TOPICS_DATA) {
        await prisma.topic.create({
          data: {
            id: topic.id,
            name: topic.name,
            description: topic.description,
            vocabularies: {
              create: topic.words.map(w => ({
                id: w.id,
                word: w.word,
                meaning: w.meaning,
                example: w.examples && w.examples.length > 0 ? w.examples.join("\n") : w.example || "",
                category: w.category,
                partOfSpeech: w.partOfSpeech,
                pronunciation: w.pronunciation,
                imageUrl: w.imageUrl
              }))
            }
          }
        });
      }

      // Seed courses and lessons
      for (const course of COURSES_DATA) {
        await prisma.course.create({
          data: {
            id: course.id,
            title: course.title,
            description: course.description,
            thumbnail: course.thumbnail,
            level: course.level,
            lessons: {
              create: course.lessons.map(l => ({
                id: l.id,
                title: l.title,
                duration: l.duration,
                videoUrl: l.videoUrl,
                description: l.description || ""
              }))
            }
          }
        });
      }
      console.log("✅ Database seeding completed successfully.");
    }
  } catch (error) {
    console.error("❌ Database seeding failed:", error);
  }
}

/**
 * Validates the database connection.
 * If the connection fails, it throws an error to stop application startup.
 */
export async function validateConnection() {
  try {
    // Attempt to query the database to verify the connection
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connection established successfully.');
    await seedIfEmpty();
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw new Error('Database connection failed. Stopping application startup.');
  }
}
