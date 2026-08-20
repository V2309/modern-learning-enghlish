import 'dotenv/config';
import prisma from '../lib/db';

const questionsData = [
  {
    id: 1,
    question: "______ the weather was unfavorable, the outdoor event continued as scheduled.",
    category: "Liên từ",
    options: [
      { key: "A", text: "Because" },
      { key: "B", text: "Although" },
      { key: "C", text: "Therefore" },
      { key: "D", text: "Since" }
    ],
    correct: "B",
    explanation: "Although + mệnh đề mang nghĩa mặc dù. Câu có sự tương phản giữa thời tiết xấu và việc sự kiện vẫn tiếp tục."
  },
  {
    id: 2,
    question: "The meeting was postponed ______ the manager was unavailable.",
    category: "Liên từ",
    options: [
      { key: "A", text: "because" },
      { key: "B", text: "although" },
      { key: "C", text: "despite" },
      { key: "D", text: "however" }
    ],
    correct: "A",
    explanation: "Because + mệnh đề dùng để chỉ nguyên nhân. “The manager was unavailable” là một mệnh đề đầy đủ."
  },
  {
    id: 3,
    question: "______ the heavy traffic, Mr. Brown arrived at the office on time.",
    category: "Liên từ",
    options: [
      { key: "A", text: "Because" },
      { key: "B", text: "Although" },
      { key: "C", text: "Despite" },
      { key: "D", text: "Since" }
    ],
    correct: "C",
    explanation: "Despite + danh từ/cụm danh từ = mặc dù. “The heavy traffic” là cụm danh từ."
  },
  {
    id: 4,
    question: "Employees must submit their expense reports by Friday; ______, they may not be reimbursed.",
    category: "Liên từ",
    options: [
      { key: "A", text: "because" },
      { key: "B", text: "however" },
      { key: "C", text: "otherwise" },
      { key: "D", text: "although" }
    ],
    correct: "C",
    explanation: "Otherwise = nếu không thì. Nếu nhân viên không nộp báo cáo đúng hạn, họ có thể không được hoàn tiền."
  },
  {
    id: 5,
    question: "The company hired additional staff ______ it could handle the increased workload.",
    category: "Liên từ",
    options: [
      { key: "A", text: "so that" },
      { key: "B", text: "although" },
      { key: "C", text: "because of" },
      { key: "D", text: "despite" }
    ],
    correct: "A",
    explanation: "So that + mệnh đề dùng để diễn tả mục đích = để mà. Công ty tuyển thêm nhân viên để xử lý khối lượng công việc tăng lên."
  },
  {
    id: 6,
    question: "______ you have any questions, please contact the customer service department.",
    category: "Liên từ",
    options: [
      { key: "A", text: "Unless" },
      { key: "B", text: "If" },
      { key: "C", text: "Although" },
      { key: "D", text: "Because" }
    ],
    correct: "B",
    explanation: "If + mệnh đề = nếu. Đây là câu điều kiện: nếu bạn có bất kỳ câu hỏi nào, hãy liên hệ bộ phận chăm sóc khách hàng."
  },
  {
    id: 7,
    question: "The restaurant will remain closed ______ the kitchen renovation is completed.",
    category: "Liên từ",
    options: [
      { key: "A", text: "until" },
      { key: "B", text: "because" },
      { key: "C", text: "although" },
      { key: "D", text: "so" }
    ],
    correct: "A",
    explanation: "Until = cho đến khi. Nhà hàng sẽ đóng cửa cho đến khi việc cải tạo nhà bếp hoàn tất."
  },
  {
    id: 8,
    question: "______ the new software is more expensive, it offers several useful features.",
    category: "Liên từ",
    options: [
      { key: "A", text: "Because" },
      { key: "B", text: "Although" },
      { key: "C", text: "Therefore" },
      { key: "D", text: "Since" }
    ],
    correct: "B",
    explanation: "Although + mệnh đề dùng để thể hiện sự tương phản: phần mềm đắt hơn nhưng có nhiều tính năng hữu ích."
  },
  {
    id: 9,
    question: "The flight was delayed ______ a technical problem with the aircraft.",
    category: "Liên từ",
    options: [
      { key: "A", text: "because" },
      { key: "B", text: "because of" },
      { key: "C", text: "although" },
      { key: "D", text: "however" }
    ],
    correct: "B",
    explanation: "Because of + danh từ/cụm danh từ. “A technical problem” là cụm danh từ. Không dùng because vì sau because phải là một mệnh đề."
  },
  {
    id: 10,
    question: "Sarah works in the accounting department, ______ her brother works in sales.",
    category: "Liên từ",
    options: [
      { key: "A", text: "because" },
      { key: "B", text: "whereas" },
      { key: "C", text: "therefore" },
      { key: "D", text: "unless" }
    ],
    correct: "B",
    explanation: "Whereas dùng để so sánh/đối chiếu hai sự việc hoặc hai đối tượng. Sarah làm kế toán, trong khi anh/em trai cô ấy làm kinh doanh."
  },
  {
    id: 11,
    question: "You cannot access the company database ______ you have the proper authorization.",
    category: "Liên từ",
    options: [
      { key: "A", text: "unless" },
      { key: "B", text: "although" },
      { key: "C", text: "because" },
      { key: "D", text: "so that" }
    ],
    correct: "A",
    explanation: "Unless = trừ khi/nếu không. Bạn không thể truy cập cơ sở dữ liệu trừ khi bạn có quyền truy cập phù hợp."
  },
  {
    id: 12,
    question: "The manager was unable to attend the conference; ______, his assistant represented the company.",
    category: "Liên từ",
    options: [
      { key: "A", text: "because" },
      { key: "B", text: "although" },
      { key: "C", text: "therefore" },
      { key: "D", text: "unless" }
    ],
    correct: "C",
    explanation: "Therefore = do đó/vì vậy, dùng để nối kết quả với nguyên nhân ở câu trước."
  },
  {
    id: 13,
    question: "______ the store opens at 9 A.M., customers are already waiting outside.",
    category: "Liên từ",
    options: [
      { key: "A", text: "Because" },
      { key: "B", text: "Although" },
      { key: "C", text: "Even though" },
      { key: "D", text: "Before" }
    ],
    correct: "C",
    explanation: "Even though + mệnh đề = mặc dù. Có sự tương phản giữa thời điểm cửa hàng mở cửa và việc khách hàng đã chờ bên ngoài."
  },
  {
    id: 14,
    question: "Please complete the application form ______ you leave the office.",
    category: "Liên từ",
    options: [
      { key: "A", text: "before" },
      { key: "B", text: "because" },
      { key: "C", text: "although" },
      { key: "D", text: "unless" }
    ],
    correct: "A",
    explanation: "Before + mệnh đề = trước khi. Người nói yêu cầu hoàn thành đơn trước khi rời văn phòng."
  },
  {
    id: 15,
    question: "The company introduced flexible working hours ______ improve employee satisfaction.",
    category: "Liên từ",
    options: [
      { key: "A", text: "because" },
      { key: "B", text: "in order to" },
      { key: "C", text: "although" },
      { key: "D", text: "whereas" }
    ],
    correct: "B",
    explanation: "In order to + V nguyên mẫu dùng để chỉ mục đích. “Improve” là động từ nguyên mẫu."
  },
  {
    id: 16,
    question: "______ the product received many positive reviews, sales remained relatively low.",
    category: "Liên từ",
    options: [
      { key: "A", text: "Because" },
      { key: "B", text: "Since" },
      { key: "C", text: "Although" },
      { key: "D", text: "Therefore" }
    ],
    correct: "C",
    explanation: "Although diễn tả sự tương phản: sản phẩm nhận được nhiều đánh giá tích cực nhưng doanh số vẫn thấp."
  },
  {
    id: 17,
    question: "The employees received additional training ______ the new regulations could be implemented effectively.",
    category: "Liên từ",
    options: [
      { key: "A", text: "so that" },
      { key: "B", text: "because of" },
      { key: "C", text: "despite" },
      { key: "D", text: "whereas" }
    ],
    correct: "A",
    explanation: "So that + mệnh đề diễn tả mục đích. “The new regulations could be implemented effectively” là mệnh đề đầy đủ."
  },
  {
    id: 18,
    question: "The outdoor meeting was canceled ______ the heavy rain.",
    category: "Liên từ",
    options: [
      { key: "A", text: "because" },
      { key: "B", text: "because of" },
      { key: "C", text: "although" },
      { key: "D", text: "however" }
    ],
    correct: "B",
    explanation: "Because of + danh từ/cụm danh từ. “The heavy rain” là cụm danh từ. Vì vậy chọn because of."
  },
  {
    id: 19,
    question: "The company has increased its advertising budget; ______, it expects sales to rise next quarter.",
    category: "Liên từ",
    options: [
      { key: "A", text: "however" },
      { key: "B", text: "therefore" },
      { key: "C", text: "although" },
      { key: "D", text: "because" }
    ],
    correct: "B",
    explanation: "Therefore = do đó/vì vậy, dùng để chỉ kết quả. Công ty tăng ngân sách quảng cáo → vì vậy dự kiến doanh số sẽ tăng."
  },
  {
    id: 20,
    question: "______ the project is completed by the deadline, the client will approve the next phase.",
    category: "Liên từ",
    options: [
      { key: "A", text: "Unless" },
      { key: "B", text: "If" },
      { key: "C", text: "Despite" },
      { key: "D", text: "Whereas" }
    ],
    correct: "B",
    explanation: "If + mệnh đề tạo câu điều kiện. Nghĩa là nếu dự án được hoàn thành đúng hạn, khách hàng sẽ phê duyệt giai đoạn tiếp theo."
  }
];

async function run() {
  const allLessons = await prisma.lesson.findMany();
  
  // Target lessons with Giới từ and Liên từ
  const targetLessons = allLessons.filter(l => 
    l.title.toLowerCase().includes('giới từ') || 
    l.title.toLowerCase().includes('liên từ')
  );

  for (const targetLesson of targetLessons) {
    console.log(`=> Seeding 20 questions to lesson: [${targetLesson.id}] ${targetLesson.title}`);
    
    // 1. Update practiceContent JSON
    await prisma.lesson.update({
      where: { id: targetLesson.id },
      data: {
        practiceContent: JSON.stringify(questionsData, null, 2)
      }
    });

    // 2. Clear old questions in Question table for this lesson
    await prisma.question.deleteMany({
      where: { lessonId: targetLesson.id }
    });

    // 3. Create records in Question and QuestionOption tables
    for (let i = 0; i < questionsData.length; i++) {
      const q = questionsData[i];
      await prisma.question.create({
        data: {
          lessonId: targetLesson.id,
          content: q.question,
          explanation: q.explanation,
          questionType: "multiple_choice",
          difficulty: "medium",
          category: "Liên từ",
          orderIndex: i + 1,
          options: {
            create: q.options.map(opt => ({
              key: opt.key,
              content: opt.text,
              isCorrect: opt.key === q.correct
            }))
          }
        }
      });
    }

    console.log('✅ Done for:', targetLesson.title);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
