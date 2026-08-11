'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function Testimonials() {
  const testimonials = [
    {
      name: "Minh Trang",
      role: "Học viên IELTS",
      quote: "Khóa học rất thú vị và bổ ích. Giáo viên tận tâm giúp mình đạt IELTS 7.5 ngoài mong đợi.",
      avatar: "MT",
    },
    {
      name: "Hoàng Nam",
      role: "Học viên Giao Tiếp",
      quote: "Mình tự tin giao tiếp với đối tác nước ngoài hơn hẳn sau 3 tháng học tại đây. Cảm ơn LinguifyPro!",
      avatar: "HN",
    },
    {
      name: "Lan Anh",
      role: "Học viên Business English",
      quote: "Nội dung khóa học bám sát thực tế doanh nghiệp. Môi trường học tập chuyên nghiệp và thân thiện.",
      avatar: "LA",
    },
  ];

  return (
    <section className="py-20 md:py-16 bg-white dark:bg-card/30">
      <div className="container mx-auto px-4 md:px-8 space-y-12">
        <div className="space-y-4 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-foreground">
            Học Viên Nói Gì Về Chúng Tôi
          </h2>
          <p className="text-slate-500 dark:text-muted-foreground font-medium text-sm md:text-base">
            Thành công của bạn là niềm tự hào của chúng tôi.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((test, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-[#f8fafc] dark:bg-card border border-border/80 shadow-xs flex flex-col justify-between space-y-6 hover:shadow-md transition-shadow"
            >
              <p className="text-sm italic text-slate-600 dark:text-muted-foreground leading-relaxed relative">
                "{test.quote}"
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-border/50 shrink-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20 shrink-0">
                  {test.avatar}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-foreground leading-none">{test.name}</h4>
                  <span className="text-[10px] text-slate-400 dark:text-muted-foreground font-medium">{test.role}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
