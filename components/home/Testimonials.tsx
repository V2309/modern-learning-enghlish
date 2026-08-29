'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Quote, CheckCircle2 } from 'lucide-react';

export default function Testimonials() {
  const testimonials = [
    {
      name: 'Nguyễn Minh Trang',
      role: 'Chuyên viên Phân tích Dữ liệu',
      achievement: 'IELTS 5.5 → 7.5',
      timeframe: 'Sau 3 tháng',
      quote: 'Phương pháp Dictation mỗi ngày 20 phút thực sự thay đổi khả năng nghe của mình. Mình đã vượt qua vòng phỏng vấn công ty công nghệ Singapore nhờ sự tự tin này.',
      initials: 'MT',
    },
    {
      name: 'Trần Hoàng Nam',
      role: 'Kỹ sư Phần mềm Senior',
      achievement: 'Từ mất gốc → Thuyết trình trôi chảy',
      timeframe: 'Sau 4 tháng',
      quote: 'Tính năng Shadowing đồng bộ ngữ điệu giúp mình sửa được tật nuốt âm đuôi và phát âm phẳng lì. Giờ mình có thể làm việc trực tiếp với đồng nghiệp Mỹ mỗi ngày.',
      initials: 'HN',
    },
    {
      name: 'Lê Lan Anh',
      role: 'Sinh viên Ngoại Thương',
      achievement: 'Thuộc 3,500 từ vựng cốt lõi',
      timeframe: 'Sau 60 ngày',
      quote: 'Nhờ thuật toán Spaced Repetition kết hợp Todo Pomodoro, việc học từ vựng không còn là gánh nặng. Mỗi ngày mình đều mong chờ hoàn thành chuỗi bài tập.',
      initials: 'LA',
    },
  ];

  return (
    <section className="py-10 md:py-14 bg-card/40 border-b border-border/40">
      <div className="container mx-auto px-4 md:px-8 space-y-8 md:space-y-10">
        
        {/* Header */}
        <div className="space-y-2 max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-3.5 py-1 rounded-full border border-brand/20">
            Kết Quả Thực Tế
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Câu Chuyện Thành Công <span className="text-brand">Của Học Viên</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Hơn 50,000 người học đã thay đổi khả năng ngoại ngữ và mở ra cơ hội nghề nghiệp toàn cầu.
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-background border border-border/80 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-xl hover:border-brand/40 transition-all duration-300 group"
            >
              <div className="space-y-4">
                {/* Score Improvement Badge */}
                <div className="flex items-center justify-between">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <TrendingUp size={13} />
                    <span>{item.achievement}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-muted-foreground">{item.timeframe}</span>
                </div>

                {/* Stars */}
                <div className="flex items-center gap-1 text-brand text-xs">
                  {'★★★★★'}
                </div>

                {/* Quote body */}
                <p className="text-xs sm:text-sm text-foreground/80 leading-relaxed italic">
                  &ldquo;{item.quote}&rdquo;
                </p>
              </div>

              {/* Author footer */}
              <div className="flex items-center gap-3 pt-4 border-t border-border/50">
                <div className="h-10 w-10 rounded-full bg-brand/10 text-brand font-black text-xs flex items-center justify-center border border-brand/20 shrink-0">
                  {item.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h4 className="text-sm font-bold text-foreground leading-none">{item.name}</h4>
                    <CheckCircle2 size={13} className="text-brand" />
                  </div>
                  <span className="text-[11px] text-muted-foreground font-medium block mt-1">{item.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
