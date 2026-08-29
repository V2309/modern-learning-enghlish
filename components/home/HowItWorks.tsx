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
    },
    {
      number: '02',
      badge: 'Giai đoạn 2',
      title: 'Nhại Giọng & Đồng Bộ Ngữ Điệu',
      description: 'Thực hành Shadowing theo phụ đề song ngữ từng giây. Tự động so sánh cao độ, nhịp điệu và ngữ âm để đạt độ khớp trên 95%.',
      icon: Mic,
    },
    {
      number: '03',
      badge: 'Giai đoạn 3',
      title: 'Kích Hoạt Trí Nhớ Dài Hạn',
      description: 'Thuật toán Spaced Repetition tự động nhắc bạn ôn luyện lại các từ vựng và cụm câu theo đường cong lãng quên Ebbinghaus.',
      icon: Sparkles,
    },
  ];

  return (
    <section className="py-10 md:py-14 bg-card/40 border-b border-border/40">
      <div className="container mx-auto px-4 md:px-8 space-y-8 md:space-y-10">
        
        {/* Header */}
        <div className="space-y-2 max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-3.5 py-1 rounded-full border border-brand/20">
            Quy Trình Khoa Học
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Cách Thức Hoạt Động <span className="text-brand">3 Bước</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Quy trình khép kín từ nhận diện âm thanh đến phát xạ ngôn ngữ chủ động.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="p-7 md:p-8 rounded-3xl bg-background border border-border/80 relative flex flex-col justify-between space-y-5 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group"
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

              <div className="space-y-2.5">
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

              <div className="pt-2 border-t border-border/40 flex items-center text-xs font-bold text-brand gap-1 group-hover:translate-x-1 transition-transform">
                <span>Trải nghiệm ngay</span>
                <ArrowRight size={14} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA bar inside section */}
        <div className="text-center pt-4">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-bold text-sm shadow-md shadow-black/10 hover:bg-primary/90 transition-all cursor-pointer"
          >
            <span>Bắt Đầu Hành Trình Ngay Hôm Nay</span>
            <ArrowRight size={16} />
          </Link>
        </div>

      </div>
    </section>
  );
}
