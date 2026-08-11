import { PrismaClient, CourseLevel } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL!;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Bắt đầu di chuyển dữ liệu khóa học TOEIC...');

  // 1. Tìm tất cả các course hiện tại (các Part của TOEIC)
  const allCourses = await prisma.course.findMany({
    include: {
      lessons: true,
    },
  });

  if (allCourses.length === 0) {
    console.log('Không tìm thấy khóa học nào trong database.');
    return;
  }

  // Lọc ra các course là một phần của TOEIC Complete
  // Các course có tiêu đề chứa "Part" hoặc "Ngữ Pháp Toeic" hoặc "Toeic"
  const toeicParts = allCourses.filter(c => 
    c.title.toLowerCase().includes('part') || 
    c.title.toLowerCase().includes('toeic')
  );

  if (toeicParts.length === 0) {
    console.log('Không tìm thấy khóa học TOEIC nào cần di chuyển.');
    return;
  }

  console.log(`Tìm thấy ${toeicParts.length} phần của khóa học TOEIC cần gộp.`);

  // 2. Tạo khóa học tổng "TOEIC Complete Course"
  const toeicCompleteId = 'toeic-complete-course';
  let toeicCourse = await prisma.course.findUnique({
    where: { id: toeicCompleteId }
  });

  if (!toeicCourse) {
    toeicCourse = await prisma.course.create({
      data: {
        id: toeicCompleteId,
        title: 'TOEIC Complete Course',
        description: 'Khóa học ôn luyện TOEIC toàn diện từ cơ bản đến nâng cao, bao gồm cả 7 phần nghe đọc và ngữ pháp trọng tâm.',
        thumbnail: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800&auto=format&fit=crop',
        level: CourseLevel.Intermediate,
        subject: 'Tiếng Anh Đi Làm',
        rating: 4.8,
        weeks: 10,
        price: 1850000,
        originalPrice: 2500000,
        isBestSeller: true,
      }
    });
    console.log('Đã tạo khóa học tổng: TOEIC Complete Course');
  } else {
    console.log('Khóa học tổng TOEIC Complete Course đã tồn tại.');
  }

  // 3. Với mỗi phần nhỏ (Part 1, Part 2, ...), tạo một Topic tương ứng
  for (const part of toeicParts) {
    // Bỏ qua khóa học tổng nếu nó có trong danh sách lọc
    if (part.id === toeicCompleteId) continue;

    console.log(`\nĐang di chuyển: "${part.title}" (${part.lessons.length} bài học)...`);

    // Tạo CourseTopic
    const topicId = `topic-${part.id}`;
    let topic = await prisma.courseTopic.findUnique({
      where: { id: topicId }
    });

    if (!topic) {
      topic = await prisma.courseTopic.create({
        data: {
          id: topicId,
          courseId: toeicCompleteId,
          title: part.title,
          description: part.description,
        }
      });
      console.log(`- Đã tạo chủ đề (CourseTopic): "${part.title}"`);
    }

    // Di chuyển các bài học (Lesson) sang Topic mới và liên kết với Course tổng
    for (const lesson of part.lessons) {
      await prisma.lesson.update({
        where: { id: lesson.id },
        data: {
          courseId: toeicCompleteId, // trỏ về khóa học tổng
          topicId: topicId,         // trỏ về chủ đề tương ứng
        }
      });
    }
    console.log(`- Đã di chuyển thành công ${part.lessons.length} bài học.`);

    // Xóa khóa học cũ
    await prisma.course.delete({
      where: { id: part.id }
    });
    console.log(`- Đã xóa khóa học cũ: "${part.title}"`);
  }

  console.log('\nQuá trình di chuyển dữ liệu hoàn tất thành công!');
}

main()
  .catch(e => {
    console.error('Lỗi khi chạy di chuyển dữ liệu:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
