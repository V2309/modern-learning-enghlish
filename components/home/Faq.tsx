'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
}

const faqs: FaqItem[] = [
  {
    id: 1,
    question: 'Phương pháp Dictation AI giúp tôi cải thiện kỹ năng gì?',
    answer: 'Dictation buộc não bộ xử lý âm thanh tiếng Anh ở tốc độ tự nhiên, bóc tách từng nối âm, âm đuôi và trợ từ. Khi kết hợp với thuật toán AI chấm từng ký tự theo thời gian thực, bạn sẽ khắc phục triệt để các lỗ hổng nghe mà việc nghe thụ động không thể giải quyết.',
  },
  {
    id: 2,
    question: 'Tôi mất gốc hoàn toàn, có học được Shadowing không?',
    answer: 'Hoàn toàn được. Hệ thống phân chia từ cấp độ A1 với phụ đề song ngữ và thanh điều chỉnh tốc độ từ 0.5x đến 1.25x, giúp bạn làm quen từng câu ngắn trước khi chuyển sang bài nói dài hơn.',
  },
  {
    id: 3,
    question: 'Hệ thống có hoạt động tốt trên điện thoại không?',
    answer: 'Giao diện được tối ưu hóa 100% cho mọi thiết bị — Mobile, Tablet, Desktop. Bạn có thể luyện nghe chép và ôn Flashcard mọi lúc, mọi nơi ngay trên trình duyệt điện thoại mà không cần cài đặt.',
  },
  {
    id: 4,
    question: 'Chính sách hoàn tiền và đổi gói học như thế nào?',
    answer: 'Chúng tôi cam kết hoàn tiền 100% trong vòng 7 ngày đầu nếu bạn cảm thấy lộ trình không phù hợp. Bạn cũng có thể nâng cấp hoặc hủy gói bất kỳ lúc nào chỉ bằng 1 thao tác.',
  },
];

export default function Faq() {
  const [activeFaq, setActiveFaq] = useState<number | null>(1);

  return (
    <section className="w-full bg-[#f8f9fa] dark:bg-[#0f1115] border-b border-[#e5e7eb] dark:border-[#1f2937] py-20 lg:py-24">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-16">

        {/* Header — 2-col asymmetric */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-14">
          <div className="lg:col-span-4">
            <motion.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] dark:text-[#6b7280] block mb-3 font-semibold"
            >
              06 · Giải đáp thắc mắc
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] dark:text-white tracking-tight leading-[1.1]"
            >
              Câu hỏi
              <br />
              <span className="text-[#f28500]">thường gặp.</span>
            </motion.h2>
          </div>
          <div className="lg:col-span-8 lg:pt-8 flex items-end">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed max-w-lg"
            >
              Mọi thông tin cần thiết về phương pháp học phản xạ, lộ trình chuẩn CEFR và chính sách hoàn phí của nền tảng.
            </motion.p>
          </div>
        </div>

        {/* Accordion — hairline dividers */}
        <div className="border-t border-[#e5e7eb] dark:border-[#1f2937]">
          {faqs.map((faq) => {
            const isOpen = activeFaq === faq.id;
            return (
              <div
                key={faq.id}
                className={cn(
                  'border-b border-[#e5e7eb] dark:border-[#1f2937] transition-colors',
                  isOpen && 'border-l-2 border-l-[#f28500] pl-4 md:pl-6 bg-white dark:bg-[#14171c]'
                )}
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(isOpen ? null : faq.id)}
                  className="w-full flex items-start justify-between gap-8 py-6 text-left cursor-pointer group"
                >
                  <div className="flex items-start gap-5">
                    <span className="text-[11px] font-bold text-[#f28500] font-mono mt-0.5 shrink-0 w-6">
                      {String(faq.id).padStart(2, '0')}
                    </span>
                    <span className={cn(
                      'text-sm sm:text-base font-semibold transition-colors leading-snug',
                      isOpen ? 'text-[#f28500]' : 'text-[#111827] dark:text-white group-hover:text-[#f28500]'
                    )}>
                      {faq.question}
                    </span>
                  </div>
                  <span className="shrink-0 mt-0.5 text-[#9ca3af] dark:text-[#6b7280]">
                    {isOpen
                      ? <Minus size={16} className="text-[#f28500]" />
                      : <Plus size={16} />
                    }
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.28, ease: 'easeInOut' }}
                      className="overflow-hidden"
                    >
                      <p className="pb-6 pl-11 text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed max-w-2xl font-sans">
                        {faq.answer}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
