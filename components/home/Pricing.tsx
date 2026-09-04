'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  const pricingPlans = [
    {
      name: 'Khởi Động',
      desc: 'Dành cho người mới bắt đầu làm quen với phương pháp Dictation & Shadowing.',
      monthlyPrice: '199.000đ',
      yearlyPrice: '149.000đ',
      isPopular: false,
      features: [
        'Truy cập 50+ bài luyện Dictation cơ bản',
        '30 bài luyện Shadowing có phụ đề song ngữ',
        'Học từ vựng Flashcard chuẩn Oxford',
        'Theo dõi tiến độ học tập hàng ngày',
      ],
      cta: 'Bắt Đầu Miễn Phí',
    },
    {
      name: 'Toàn Diện (Pro)',
      desc: 'Lộ trình tối ưu cho người muốn bứt phá phát âm và đạt điểm cao trong kỳ thi.',
      monthlyPrice: '399.000đ',
      yearlyPrice: '299.000đ',
      isPopular: true,
      features: [
        'Mở khóa TOÀN BỘ thư viện Dictation & Shadowing',
        'AI chấm phát âm & phân tích ngữ điệu từng giây',
        'Thuật toán Spaced Repetition không giới hạn từ',
        'Quản lý Todo Pomodoro & Streak thông minh',
        'Hỗ trợ giải đáp ưu tiên 24/7 từ giáo viên',
      ],
      cta: 'Đăng Ký Gói Pro Ngay',
    },
    {
      name: 'Chuyên Sâu (Master)',
      desc: 'Dành cho chuyên gia, người đi làm và người luyện thi chứng chỉ quốc tế cấp tốc.',
      monthlyPrice: '699.000đ',
      yearlyPrice: '529.000đ',
      isPopular: false,
      features: [
        'Tất cả quyền lợi của gói Pro',
        'Kho tài liệu Business English & IELTS chuyên biệt',
        'Sửa bài nói & viết 1-1 hàng tháng cùng chuyên gia',
        'Cấp chứng chỉ hoàn thành chuẩn quốc tế CEFR',
      ],
      cta: 'Trở Thành Master',
    },
  ];

  return (
    <section className="w-full py-12 md:py-16 bg-background border-b border-border px-4 sm:px-6 md:px-8 lg:px-12">
      <div className="w-full space-y-8 md:space-y-10">
        
        {/* Header */}
        <div className="space-y-2 max-w-3xl mx-auto text-center">
          <span className="inline-block text-xs font-bold uppercase tracking-wider text-brand bg-brand/10 px-3.5 py-1 rounded-full border border-brand/20">
            Học Phí Linh Hoạt
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-foreground tracking-tight">
            Đầu Tư Cho <span className="text-brand">Tương Lai Ngôn Ngữ</span>
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">
            Chọn gói học phù hợp với mục tiêu của bạn. Hủy bất kỳ lúc nào, không phụ phí ẩn.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="pt-2 flex items-center justify-center gap-3">
            <span className={cn("text-xs font-bold cursor-pointer", !isYearly ? "text-foreground" : "text-muted-foreground")} onClick={() => setIsYearly(false)}>
              Thanh toán theo tháng
            </span>
            <button
              onClick={() => setIsYearly(!isYearly)}
              className="relative w-12 h-6 rounded-full bg-muted border border-border p-0.5 transition-colors cursor-pointer"
            >
              <motion.div
                className="w-5 h-5 rounded-full bg-brand"
                animate={{ x: isYearly ? 24 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </button>
            <span className={cn("text-xs font-bold flex items-center gap-1.5 cursor-pointer", isYearly ? "text-foreground" : "text-muted-foreground")} onClick={() => setIsYearly(true)}>
              <span>Thanh toán theo năm</span>
              <span className="text-[10px] font-black uppercase text-brand bg-brand/10 px-2 py-0.5 rounded-full border border-brand/20">Tiết kiệm 25%</span>
            </span>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto items-stretch w-full">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={cn(
                "p-7 rounded-3xl bg-card border flex flex-col justify-between space-y-7 relative hover:shadow-xl transition-all duration-300",
                plan.isPopular 
                  ? "border-brand shadow-lg scale-102 z-10 ring-1 ring-brand/50" 
                  : "border-border/80 shadow-xs"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand text-brand-foreground text-[10px] font-black tracking-widest uppercase px-3.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                  <Zap size={11} className="fill-current" />
                  <span>Phổ Biến Nhất</span>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed min-h-[36px]">
                    {plan.desc}
                  </p>
                  
                  <div className="flex items-baseline gap-1 pt-3.5 border-t border-border/40">
                    <span className={cn("text-2xl sm:text-3xl font-black tracking-tight", plan.isPopular ? "text-brand" : "text-foreground")}>
                      {isYearly ? plan.yearlyPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-xs text-muted-foreground font-semibold">/tháng</span>
                  </div>
                </div>

                <ul className="space-y-3 pt-2">
                  {plan.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-start gap-3 text-xs text-foreground/80 leading-normal">
                      <div className="h-4 w-4 rounded-full bg-brand/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Check size={11} className="text-brand" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/auth/sign-up"
                className={cn(
                  "w-full py-4 rounded-2xl text-xs font-black transition-all cursor-pointer text-center block shadow-xs",
                  plan.isPopular
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-black/10"
                    : "border border-border bg-background hover:bg-muted text-foreground"
                )}
              >
                {plan.cta} &rarr;
              </Link>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
