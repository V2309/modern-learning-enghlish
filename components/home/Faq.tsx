'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

export default function Faq() {
  const [activeFaq, setActiveFaq] = useState<number | null>(1);

  const toggleFaq = (id: number) => {
    setActiveFaq(activeFaq === id ? null : id);
  };

  const faqs: FaqItem[] = [
    {
      id: 1,
      question: 'Phương pháp Dictation (Nghe chép chính tả) giúp cải thiện kỹ năng gì?',
      answer: 'Dictation buộc não bộ xử lý âm thanh tiếng Anh ở tốc độ cao, bóc tách từng nối âm (linking sounds), âm đuôi (ending sounds) và trợ từ. Khi kết hợp với phản hồi AI tức thì, bạn sẽ nhận ra các lỗ hổng nghe mà mắt đọc lướt thường bỏ qua.',
    },
    {
      id: 2,
      question: 'Tôi là người mất gốc hoàn toàn, có học được phương pháp Shadowing không?',
      answer: 'Hoàn toàn được. Hệ thống phân chia bài học từ cấp độ A1 cơ bản nhất với phụ đề song ngữ và thanh điều chỉnh tốc độ từ 0.5x đến 1.25x, giúp bạn làm quen từng câu ngắn trước khi chuyển sang các bài nói dài.',
    },
    {
      id: 3,
      question: 'Hệ thống có tương thích và sử dụng tốt trên điện thoại không?',
      answer: 'Giao diện của Linguify được tối ưu hóa 100% cho mọi thiết bị (Mobile, Tablet, Desktop). Bạn có thể luyện nghe chép và ôn tập Flashcard mọi lúc, mọi nơi ngay trên trình duyệt điện thoại.',
    },
    {
      id: 4,
      question: 'Chính sách hoàn tiền và đổi gói học diễn ra như thế nào?',
      answer: 'Chúng tôi cam kết hoàn tiền 100% trong vòng 7 ngày đầu tiên nếu bạn cảm thấy lộ trình không phù hợp với mục tiêu của mình. Bạn cũng có thể nâng cấp hoặc hủy gói bất kỳ lúc nào chỉ bằng 1 thao tác.',
    },
  ];

  return (
    <section className="py-10 md:py-14 bg-card/40 border-b border-border/40">
      <div className="container mx-auto px-4 md:px-8 space-y-8 md:space-y-10">
        
        {/* Header */}
        <div className="space-y-2 max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-3.5 py-1 rounded-full border border-brand/20">
            Hỏi Đáp Thường Gặp
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
            Giải Đáp <span className="text-brand">Thắc Mắc Của Bạn</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Mọi thông tin cần thiết về phương pháp, lộ trình và tài khoản học tập.
          </p>
        </div>

        {/* Accordions */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq) => (
            <div
              key={faq.id}
              className={cn(
                "bg-background border rounded-2xl overflow-hidden transition-all duration-200",
                activeFaq === faq.id ? "border-brand/40 shadow-sm" : "border-border/80 hover:border-border"
              )}
            >
              <button
                onClick={() => toggleFaq(faq.id)}
                className="w-full flex items-center justify-between p-6 text-left font-bold text-foreground cursor-pointer transition-colors hover:text-brand"
              >
                <span className="text-sm md:text-base pr-4 flex items-center gap-3">
                  <span className="text-brand font-mono font-black text-xs px-2.5 py-0.5 bg-brand/10 rounded-md shrink-0">
                    Q{faq.id}
                  </span>
                  <span className={activeFaq === faq.id ? "text-brand" : "text-foreground"}>
                    {faq.question}
                  </span>
                </span>
                {activeFaq === faq.id ? (
                  <div className="h-7 w-7 rounded-full bg-brand text-brand-foreground flex items-center justify-center shrink-0 shadow-xs">
                    <ChevronUp size={16} />
                  </div>
                ) : (
                  <div className="h-7 w-7 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0">
                    <ChevronDown size={16} />
                  </div>
                )}
              </button>

              <AnimatePresence initial={false}>
                {activeFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="p-6 pt-0 border-t border-border/40 text-xs md:text-sm text-muted-foreground leading-relaxed pl-14">
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
