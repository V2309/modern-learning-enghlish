# Modern Learning English

Modern Learning English is a modern English learning platform designed to enhance language acquisition through interactive tools such as flashcard vocabulary builders, shadowing pronunciation practice, and contextual analysis. Featuring an intuitive interface and optimized user experience, the application leverages artificial intelligence to personalize learning paths, provide automated translation, and extract learning materials from videos, delivering a highly natural and engaging approach to mastering English.

## Tech Stack

The project is built using modern and optimized technologies:

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4, Framer Motion (smooth animations), Zustand (state management).
- **Backend & Database:** Prisma ORM, PostgreSQL (pg).
- **Authentication:** Clerk Auth.
- **AI Integration:** Google Gen AI SDK (`@google/genai`).
- **Testing:** Vitest, Testing Library.

---

## Getting Started

1. Cài đặt các thư viện phụ thuộc:
   ```bash
   npm install
   ```

2. Cài đặt biến môi trường bằng cách sao chép file cấu hình:
   ```bash
   # Sao chép và cấu hình biến môi trường của bạn (.env)
   ```

3. Khởi tạo cơ sở dữ liệu:
   ```bash
   npx prisma db push
   npm run seed
   ```

4. Chạy môi trường phát triển:
   ```bash
   npm run dev
   ```

Mở [http://localhost:3000](http://localhost:3000) trên trình duyệt để trải nghiệm ứng dụng.
