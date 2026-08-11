'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { GraduationCap, Clock, Laptop } from 'lucide-react';

export default function WhyChooseUs() {
  const whyChooseUs = [
    {
      title: "Giáo Viên Xuất Sắc",
      description: "Đội ngũ giảng viên giàu kinh nghiệm, chứng chỉ quốc tế và tận tâm.",
      icon: GraduationCap,
    },
    {
      title: "Lịch Học Linh Hoạt",
      description: "Chủ động sắp xếp thời gian học phù hợp với lịch trình cá nhân của bạn.",
      icon: Clock,
    },
    {
      title: "Bài Học Tương Tác",
      description: "Phương pháp học thực tế, chú trọng giao tiếp và áp dụng ngay.",
      icon: Laptop,
    },
  ];

  return (
    <section className="py-20 md:py-16 bg-white dark:bg-card/30">
      <div className="container mx-auto px-4 md:px-8 text-center space-y-12">
        <div className="space-y-2 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-foreground">
            Tại Sao Chọn Chúng Tôi?
          </h2>
          <p className="text-slate-500 dark:text-muted-foreground font-medium text-sm md:text-base">
            Những lý do LinguifyPro là sự lựa chọn hàng đầu của bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {whyChooseUs.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="p-8 rounded-3xl bg-[#f8fafc] dark:bg-card border border-border/80 hover:border-primary/40 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-4 group"
            >
              <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-105 transition-transform duration-300 shadow-sm">
                <item.icon size={28} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-foreground">{item.title}</h3>
              <p className="text-sm text-slate-500 dark:text-muted-foreground leading-relaxed">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
