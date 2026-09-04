'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, PlayCircle, Clock, Star } from 'lucide-react';

export default function FeaturedCourses() {
  const featuredCourses = [
    {
      id: 'ielts-mastery',
      title: 'IELTS Band 7.5+ Intensive',
      description: 'Luyện nghe chép học thuật và nhại ngữ điệu bài thi Speaking Part 2-3 chuẩn band 7.5 - 8.5.',
      image: '/course_ielts.png',
      level: 'B2 - C1',
      lessons: 48,
      weeks: 12,
      price: '1.290.000đ',
      rating: '4.9',
      tag: 'IELTS Chuẩn',
    },
    {
      id: 'business-english',
      title: 'Tiếng Anh Doanh Nghiệp & Thuyết Trình',
      description: 'Đàm phán thương mại, thuyết trình dự án và viết email chuyên nghiệp với đối tác toàn cầu.',
      image: '/course_business.png',
      level: 'B1 - B2',
      lessons: 36,
      weeks: 8,
      price: '890.000đ',
      rating: '4.95',
      tag: 'Phổ Biến',
    },
    {
      id: 'daily-communication',
      title: 'Tiếng Anh Giao Tiếp Thực Chiến',
      description: 'Khắc phục triệt để tình trạng mất gốc, xây dựng phản xạ nghe nói tự nhiên trong 60 ngày.',
      image: '/course_comm.png',
      level: 'A2 - B1',
      lessons: 30,
      weeks: 6,
      price: '590.000đ',
      rating: '4.88',
      tag: 'Cho Người Mới',
    },
  ];

  return (
    <section className="w-full bg-background border-b border-border relative overflow-hidden">
      
      {/* Full-Width Centered Title Grid Bar */}
      <div className="w-full border-b border-border px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 bg-card/20 text-center relative">
        <div className="space-y-2 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-3.5 py-1 rounded-full border border-brand/20">
            Chương Trình Tiêu Biểu
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            Khám Phá <span className="text-brand">Khóa Học Nổi Bật</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Các lộ trình được biên soạn chuyên sâu theo chuẩn khung tham chiếu CEFR quốc tế.
          </p>
        </div>

        <Link
          href="/courses"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-foreground hover:text-brand transition-colors group mt-4 sm:absolute sm:right-8 sm:bottom-10 lg:right-12"
        >
          <span>Xem tất cả khóa học</span>
          <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform text-brand" />
        </Link>
      </div>

      {/* 3-Column Grid Container Dividing Columns with Hairline Borders */}
      <div className="w-full grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {featuredCourses.map((course, idx) => (
          <div key={idx} className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative bg-background/50">
            {/* Corner Crosshairs */}
            <span className="absolute -top-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>
            <span className="absolute -top-2 -right-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none hidden md:block">+</span>
            <span className="absolute -bottom-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>

            {/* Inner Course Card Preserving Rounded Corners and Card Styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-brand/40 transition-all duration-300 group h-full"
            >
              {/* Media preview */}
              <div className="aspect-video relative overflow-hidden bg-muted shrink-0">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
                
                {/* Level badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/70 backdrop-blur-md text-white border border-white/20">
                  {course.level}
                </div>

                {/* Rating badge */}
                <div className="absolute top-3 right-3 px-2 py-1 rounded-md text-[10px] font-bold bg-white/90 dark:bg-card/90 backdrop-blur-md text-foreground flex items-center gap-1 shadow-xs">
                  <Star size={11} className="fill-amber-400 text-amber-400" />
                  <span>{course.rating}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between space-y-5">
                <div className="space-y-2.5">
                  <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <PlayCircle size={13} className="text-brand" />
                      {course.lessons} bài giảng
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock size={13} className="text-brand" />
                      {course.weeks} tuần
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-brand transition-colors line-clamp-2">
                    {course.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
                    {course.description}
                  </p>
                </div>

                {/* Price and CTA */}
                <div className="pt-4 border-t border-border/50 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] text-muted-foreground font-semibold block">Học phí trọn gói</span>
                    <span className="text-lg font-black text-brand">{course.price}</span>
                  </div>

                  <Link
                    href="/courses"
                    className="px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        ))}
      </div>

    </section>
  );
}
