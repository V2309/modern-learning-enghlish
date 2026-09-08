'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';

interface CounterProps {
  end: number;
  suffix?: string;
  prefix?: string;
}

function AnimatedCounter({ end, suffix = '', prefix = '' }: CounterProps) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  useEffect(() => {
    if (!isInView) return;
    const duration = 1600;
    const step = 16;
    const increment = (end / (duration / step));
    let current = 0;
    const timer = setInterval(() => {
      current = Math.min(current + increment, end);
      setCount(Math.floor(current));
      if (current >= end) clearInterval(timer);
    }, step);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  );
}

export default function ImpactStatement() {
  const stats = [
    { value: 400, suffix: 'k+', label: 'Học viên đang hoạt động', description: 'Trên toàn thế giới', index: '01' },
    { value: 50, suffix: 'k+', label: 'Bài luyện nghe & nói', description: 'Dictation & Shadowing', index: '02' },
    { value: 99, suffix: '.2%', label: 'Độ chính xác AI', description: 'Nhận diện âm vị học', index: '03' },
    { value: 8, suffix: ' tuần', label: 'Đến phản xạ tự nhiên', description: 'Lộ trình trung bình', index: '04' },
  ];

  return (
    <section className="w-full bg-white dark:bg-[#0f1115] border-b border-[#e5e7eb] dark:border-[#1f2937] relative flex flex-col">
      
      {/* ── Top Header Strip — Continuous grid line ── */}
      <div className="border-b border-[#e5e7eb] dark:border-[#1f2937] px-8 sm:px-12 lg:px-16 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-3"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] dark:text-[#6b7280]">
            01 · Kết quả đo lường được
          </span>
        </motion.div>

        <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] dark:text-[#6b7280] hidden sm:block">
          Chỉ số học tập thực tế
        </span>
      </div>

      {/* ── Stats Grid — Continuous 4 columns without gaps ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 border-b border-[#e5e7eb] dark:border-[#1f2937]">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={`
              flex flex-col justify-between bg-white dark:bg-[#0f1115] hover:bg-[#fafafa] dark:hover:bg-[#14171c] transition-colors
              border-b sm:border-b-0 border-[#e5e7eb] dark:border-[#1f2937]
              ${i < 3 ? 'lg:border-r' : ''}
              ${i % 2 === 0 ? 'sm:border-r lg:border-r-0' : ''}
              ${i < 2 ? 'sm:border-b lg:border-b-0' : ''}
              ${i === 3 ? 'border-b-0' : ''}
            `}
          >
            {/* Top Number Block */}
            <div className="p-8 sm:p-10 lg:p-12 flex-1 flex flex-col justify-between">
              {/* Top Index */}
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-[#6b7280]">
                  {stat.index}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#e5e7eb] dark:bg-[#333638]" />
              </div>

              {/* Large number */}
              <div>
                <p className="text-5xl sm:text-6xl font-normal text-[#f28500] tracking-tight leading-none font-mono">
                  <AnimatedCounter end={stat.value} suffix={stat.suffix} />
                </p>
              </div>
            </div>

            {/* Bottom Label & Description — Full-width connected line */}
            <div className="border-t border-[#e5e7eb] dark:border-[#1f2937] px-8 sm:px-10 lg:px-12 py-6 space-y-1 bg-[#fafafa]/40 dark:bg-[#111418]/40">
              <p className="text-sm font-semibold text-[#111827] dark:text-white">{stat.label}</p>
              <p className="text-[11px] uppercase tracking-widest text-[#9ca3af] dark:text-[#6b7280]">{stat.description}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Bottom Editorial Row — Aligned with Hero column split ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto]">
        {/* Left: Statement */}
        <div className="px-8 sm:px-12 lg:px-16 py-12 lg:py-14 border-r-0 lg:border-r border-[#e5e7eb] dark:border-[#1f2937] flex flex-col justify-center">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-2xl sm:text-3xl lg:text-[2rem] font-normal text-[#111827] dark:text-white tracking-tight leading-[1.25] max-w-2xl"
          >
            Từ A1 đến phỏng vấn quốc tế —
            <br />
            <span className="text-[#f28500] font-semibold">không phải học ngữ pháp, là xây phản xạ.</span>
          </motion.p>
        </div>

        {/* Right: Explanatory note (matches Hero right column width) */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full lg:w-[480px] xl:w-[560px] px-8 sm:px-12 lg:px-16 py-12 lg:py-14 flex flex-col justify-center bg-[#fafafa] dark:bg-[#111418] border-t lg:border-t-0 border-[#e5e7eb] dark:border-[#1f2937]"
        >
          <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-[#9ca3af] dark:text-[#6b7280] mb-2 block">
            Tiêu chuẩn CEFR Quốc Tế
          </span>
          <p className="text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
            Phương pháp kết hợp Dictation AI và Shadowing Real-Time theo tiêu chuẩn CEFR được kiểm định bởi Cambridge &amp; British Council.
          </p>
        </motion.div>
      </div>

    </section>
  );
}
