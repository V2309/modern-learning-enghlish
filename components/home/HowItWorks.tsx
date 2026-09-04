'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Headphones, Mic, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      badge: 'Giai đoạn 1',
      title: 'Nghe Chép & Giải Mã Âm Thanh',
      description: 'Lắng nghe từng đoạn hội thoại thực tế của người bản xứ và ghi chép lại. AI chỉ ra chính xác từ ngữ, âm đuôi và liên từ bạn đã bỏ lỡ.',
      icon: Headphones,
      link: '/dictation',
    },
    {
      number: '02',
      badge: 'Giai đoạn 2',
      title: 'Nhại Giọng & Đồng Bộ Ngữ Điệu',
      description: 'Thực hành Shadowing theo phụ đề song ngữ từng giây. Tự động so sánh cao độ, nhịp điệu và ngữ âm để đạt độ khớp trên 95%.',
      icon: Mic,
      link: '/shadowing',
    },
    {
      number: '03',
      badge: 'Giai đoạn 3',
      title: 'Kích Hoạt Trí Nhớ Dài Hạn',
      description: 'Thuật toán Spaced Repetition tự động nhắc bạn ôn luyện lại các từ vựng và cụm câu theo đường cong lãng quên Ebbinghaus.',
      icon: Sparkles,
      link: '/vocabulary',
    },
  ];

  return (
    <section className="w-full bg-background border-b border-border relative overflow-hidden">
      
      {/* Full-Width Centered Title Grid Bar */}
      <div className="w-full border-b border-border px-4 sm:px-6 md:px-8 lg:px-12 py-8 md:py-10 bg-card/20 text-center">
        <div className="space-y-2 max-w-3xl mx-auto">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-3.5 py-1 rounded-full border border-brand/20">
            Quy Trình Khoa Học
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            Cách Thức Hoạt Động <span className="text-brand">3 Bước</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Quy trình khép kín từ nhận diện âm thanh đến phát xạ ngôn ngữ chủ động.
          </p>
        </div>
      </div>

      {/* 3-Column Grid Container Dividing Columns with Hairline Borders */}
      <div className="w-full grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
        {steps.map((step, idx) => (
          <div key={idx} className="p-6 sm:p-8 lg:p-10 flex flex-col justify-center relative bg-background/50">
            {/* Corner Crosshairs */}
            <span className="absolute -top-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>
            <span className="absolute -top-2 -right-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none hidden md:block">+</span>
            <span className="absolute -bottom-2 -left-1 font-mono text-xs text-muted-foreground/40 pointer-events-none select-none">+</span>

            {/* Inner Step Card Preserving Rounded Corners and Card Styling */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="p-7 md:p-8 rounded-3xl bg-card border border-border/80 relative flex flex-col justify-between space-y-6 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group h-full shadow-xs"
            >
              {/* Header inside step card */}
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-brand uppercase tracking-wider px-2.5 py-1 rounded-md bg-brand/10 border border-brand/20">
                  {step.badge}
                </span>
                <span className="text-2xl font-black text-muted-foreground/30 font-mono">
                  {step.number}
                </span>
              </div>

              <div className="space-y-3">
                <div className="h-11 w-11 rounded-2xl bg-muted text-foreground flex items-center justify-center group-hover:bg-brand group-hover:text-white transition-colors duration-300 shadow-xs">
                  <step.icon size={20} />
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-brand transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>

              <Link
                href={step.link}
                className="pt-3 border-t border-border/40 flex items-center text-xs font-bold text-brand gap-1 group-hover:translate-x-1 transition-transform"
              >
                <span>Trải nghiệm ngay</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Bottom Full-Width Strip */}
      <div className="w-full border-t border-border px-4 sm:px-6 md:px-8 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-card/20">
        <span className="text-xs font-medium text-muted-foreground">
          Bắt đầu hành trình phản xạ tiếng Anh tự nhiên ngay hôm nay
        </span>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 px-7 py-3.5 bg-primary text-primary-foreground rounded-2xl font-bold text-xs hover:bg-primary/90 transition-all cursor-pointer shadow-xs"
        >
          <span>Khám Phá Khóa Học</span>
          <ArrowRight size={15} />
        </Link>
      </div>

    </section>
  );
}
