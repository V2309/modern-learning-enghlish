'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default function Faq() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const faqs: FaqItem[] = [
    {
      id: 1,
      question: "Làm sao để biết tôi phù hợp với khóa học nào?",
      answer: "Bạn sẽ làm một bài test đầu vào miễn phí. Dựa trên kết quả, chúng tôi sẽ tư vấn lộ trình học phù hợp nhất cho bạn.",
    },
    {
      id: 2,
      question: "Lớp học có bao nhiêu học viên?",
      answer: "Để đảm bảo chất lượng, mỗi lớp học tối đa 10 học viên để giáo viên có thể quan tâm sát sao nhất.",
    },
    {
      id: 3,
      question: "Tôi có thể học bù nếu nghỉ học không?",
      answer: "Có, bạn có thể sắp xếp học bù vào các lớp có cùng trình độ. Vui lòng báo trước cho giáo vụ.",
    },
  ];

  return (
    <section className="py-20 md:py-16 bg-[#f8fafc] dark:bg-background">
      <div className="container mx-auto px-4 md:px-8 space-y-12">
        <div className="space-y-4 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-foreground">
            Câu Hỏi Thường Gặp
          </h2>
          <p className="text-slate-500 dark:text-muted-foreground font-medium text-sm md:text-base">
            Giải đáp những thắc mắc chung về các khóa học.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className="bg-white dark:bg-card border border-border/80 rounded-2xl overflow-hidden shadow-xs"
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-800 dark:text-foreground cursor-pointer transition-colors hover:text-primary"
              >
                <span className="text-sm md:text-base pr-4">{faq.question}</span>
                {activeFaq === faq.id ? (
                  <ChevronUp size={18} className="text-primary shrink-0" />
                ) : (
                  <ChevronDown size={18} className="text-slate-400 shrink-0" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {activeFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: "auto" }}
                    exit={{ height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 border-t border-border/20 text-xs md:text-sm text-slate-500 dark:text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
