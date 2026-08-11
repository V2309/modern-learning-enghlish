'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, BookOpen, Rocket } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      number: "1",
      title: "Kiểm Tra Đầu Vào",
      description: "Làm bài test ngắn để xác định trình độ hiện tại của bạn.",
      icon: ClipboardList,
    },
    {
      number: "2",
      title: "Chọn Khóa Học",
      description: "Nhận tư vấn lộ trình và chọn khóa học phù hợp nhất.",
      icon: BookOpen,
    },
    {
      number: "3",
      title: "Bắt Đầu Học",
      description: "Tham gia lớp học và trải nghiệm sự tiến bộ mỗi ngày.",
      icon: Rocket,
    },
  ];

  return (
    <section className="py-20 md:py-16 bg-white dark:bg-card/30">
      <div className="container mx-auto px-4 md:px-8 space-y-12">
        <div className="space-y-4 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-foreground">
            Cách Thức Hoạt Động
          </h2>
          <p className="text-slate-500 dark:text-muted-foreground font-medium text-sm md:text-base">
            Bắt đầu hành trình của bạn chỉ với 3 bước đơn giản.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-[#f8fafc] dark:bg-card border border-border/80 relative flex flex-col items-center text-center space-y-4 group hover:shadow-md transition-shadow"
            >
              {/* Step circle number */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 h-8 w-12 rounded-full bg-primary text-white text-xs font-black flex items-center justify-center shadow-md">
                {step.number}
              </div>
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                <step.icon size={26} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-foreground pt-2">{step.title}</h3>
              <p className="text-xs text-slate-500 dark:text-muted-foreground leading-relaxed">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
