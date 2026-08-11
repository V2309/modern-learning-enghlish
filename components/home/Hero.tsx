'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative py-4 bg-gradient-to-b from-white to-[#f8fafc] dark:from-background dark:to-background border-b border-border/40">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6 text-left"
          >
            <h1 className="text-xl md:text-xl lg:text-4xl font-extrabold text-slate-900 dark:text-foreground leading-tight tracking-tight">
              Chinh Phục Tiếng Anh,<br className="hidden md:inline" />
              <span className="text-primary mt-1 block">Mở Khóa Tương Lai</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 dark:text-muted-foreground leading-relaxed max-w-2xl">
              Nền tảng học tiếng Anh chuyên nghiệp giúp bạn giao tiếp tự tin và thăng tiến trong sự nghiệp. Học theo lộ trình cá nhân hóa cùng đội ngũ giáo viên xuất sắc.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row gap-4">
              <Link
                href="/courses"
                className="w-full sm:w-auto px-8 py-4 bg-primary text-white rounded-2xl font-bold shadow-lg shadow-primary/25 hover:bg-primary/95 transition-all text-center flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Bắt Đầu Ngay</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Right Image */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 flex justify-center"
          >
            <div className="relative w-full max-w-md aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white dark:border-border">
              <img
                src="/hero_student.png"
                alt="Student learning English"
                className="w-full h-full object-cover transform hover:scale-102 transition-transform duration-500"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
