'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function FeaturedCourses() {
  const featuredCourses = [
    {
      title: "IELTS Masterclass",
      description: "Luyện thi IELTS chuyên sâu với các chuyên gia, cam kết đạt điểm mục tiêu.",
      image: "/course_ielts.png",
    },
    {
      title: "Tiếng Anh Doanh Nghiệp",
      description: "Giao tiếp chuyên nghiệp, đàm phán và thuyết trình tự tin trong môi trường làm việc.",
      image: "/course_business.png",
    },
    {
      title: "Tiếng Anh Giao Tiếp",
      description: "Khóa học dành cho người mất gốc, xây dựng nền tảng vững chắc.",
      image: "/course_comm.png",
    },
  ];

  return (
    <section className="py-20 md:py-16 bg-[#f8fafc] dark:bg-background">
      <div className="container mx-auto px-4 md:px-8 space-y-12">
        <div className="space-y-4 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-foreground">
            Khóa Học Nổi Bật
          </h2>
          <p className="text-slate-500 dark:text-muted-foreground font-medium text-sm md:text-base">
            Khám phá các khóa học được yêu thích nhất của chúng tôi.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {featuredCourses.map((course, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="flex flex-col bg-white dark:bg-card border border-border/80 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className="aspect-video relative overflow-hidden bg-slate-100 shrink-0">
                <img
                  src={course.image}
                  alt={course.title}
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                />
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between space-y-6">
                <div className="space-y-3">
                  <h3 className="text-xl font-extrabold text-slate-800 dark:text-foreground group-hover:text-primary transition-colors">
                    {course.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed">
                    {course.description}
                  </p>
                </div>
                <Link
                  href="/courses"
                  className="inline-flex items-center justify-center w-full px-5 py-3 border border-border dark:border-border bg-white dark:bg-muted rounded-2xl text-xs font-bold text-primary hover:bg-primary hover:text-white dark:hover:bg-primary dark:hover:text-white transition-all cursor-pointer text-center"
                >
                  Tìm Hiểu Thêm
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
