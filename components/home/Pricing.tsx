'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ShieldCheck, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const pricingPlans = [
  {
    name: 'Khởi Động',
    code: '01 / STARTER',
    desc: 'Dành cho người mới bắt đầu làm quen với Dictation & Shadowing.',
    monthlyPrice: 199000,
    yearlyPrice: 149000,
    isPopular: false,
    features: [
      '50+ bài luyện Dictation cơ bản',
      '30 bài Shadowing có phụ đề song ngữ',
      'Flashcard từ vựng chuẩn Oxford',
      'Theo dõi tiến độ hàng ngày',
    ],
    cta: 'Bắt đầu miễn phí',
    href: '/courses',
  },
  {
    name: 'Toàn Diện — Pro',
    code: '02 / PRO POPULAR',
    desc: 'Lộ trình tối ưu cho người muốn bứt phá phát âm và phản xạ thi cử.',
    monthlyPrice: 399000,
    yearlyPrice: 299000,
    isPopular: true,
    features: [
      'Toàn bộ thư viện Dictation & Shadowing',
      'AI chấm phát âm & phân tích ngữ điệu từng giây',
      'Spaced Repetition không giới hạn từ',
      'Quản lý Todo Pomodoro & Streak thông minh',
      'Hỗ trợ ưu tiên 24/7 từ giáo viên bản ngữ',
    ],
    cta: 'Đăng ký gói Pro',
    href: '/courses',
  },
  {
    name: 'Chuyên Sâu — Master',
    code: '03 / MASTER 1-ON-1',
    desc: 'Dành cho chuyên gia và người luyện chứng chỉ quốc tế cấp tốc.',
    monthlyPrice: 699000,
    yearlyPrice: 529000,
    isPopular: false,
    features: [
      'Tất cả quyền lợi của gói Pro',
      'Kho tài liệu Business English & IELTS 8.0+',
      'Sửa bài nói & viết 1-1 hàng tháng',
      'Cấp chứng chỉ hoàn thành chuẩn CEFR',
    ],
    cta: 'Trở thành Master',
    href: '/courses',
  },
];

function formatPrice(vnd: number) {
  return new Intl.NumberFormat('vi-VN').format(vnd) + 'đ';
}

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(true);

  return (
    <section className="w-full bg-white dark:bg-[#0f1115] border-b border-[#e5e7eb] dark:border-[#1f2937] relative flex flex-col">

      {/* ── Top Header Strip — Full Width Editorial Bar ── */}
      <div className="px-8 sm:px-12 lg:px-16 py-12 lg:py-16 border-b border-[#e5e7eb] dark:border-[#1f2937] flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="text-[10px] font-mono uppercase tracking-[0.22em] text-[#9ca3af] dark:text-[#6b7280] block mb-3 font-semibold"
          >
            05 · Linh hoạt &amp; Minh bạch
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111827] dark:text-white tracking-tight leading-[1.1] max-w-[16ch]"
          >
            Đầu tư xứng đáng
            <br />
            <span className="text-[#f28500]">cho tương lai.</span>
          </motion.h2>
        </div>

        {/* Right side: Guarantee + Billing Cycle Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <p className="text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] max-w-[28ch] leading-relaxed hidden lg:block">
            Hủy bất kỳ lúc nào. Cam kết hoàn tiền 100% trong 7 ngày đầu nếu không hài lòng.
          </p>

          {/* Toggle Switch */}
          <div className="flex items-center gap-3 p-1.5 border border-[#e5e7eb] dark:border-[#333638] bg-[#f8f9fa] dark:bg-[#16191d] shrink-0">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                'px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all cursor-pointer',
                !isYearly
                  ? 'bg-white dark:bg-[#22272e] text-[#111827] dark:text-white shadow-xs font-bold'
                  : 'text-[#9ca3af] hover:text-[#111827] dark:hover:text-white'
              )}
            >
              Theo tháng
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                'px-3 py-1.5 text-xs font-mono uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer',
                isYearly
                  ? 'bg-[#1b4332] dark:bg-white text-white dark:text-[#111827] shadow-xs font-bold'
                  : 'text-[#9ca3af] hover:text-[#111827] dark:hover:text-white'
              )}
            >
              <span>Theo năm</span>
              <span className="text-[10px] bg-[#f28500] text-white px-1.5 py-0.2 rounded-none font-mono font-bold">
                −25%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════
          BENTO GRID — 1px gap full-width
      ════════════════════════════════════════ */}
      <div className="w-full grid grid-cols-1 md:grid-cols-12 auto-rows-auto gap-px bg-[#e5e7eb] dark:bg-[#1f2937]">

        {/* ── ROW 1: 3 PRICING TILES (4/12 each) ── */}

        {pricingPlans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              'md:col-span-4 flex flex-col justify-between p-8 sm:p-12 transition-colors relative',
              plan.isPopular
                ? 'bg-[#1b4332] dark:bg-[#143527] text-white'
                : 'bg-white dark:bg-[#0f1115] hover:bg-[#fafafa] dark:hover:bg-[#14171c]'
            )}
          >
            {/* Top Code & Popular Pill */}
            <div className="flex items-center justify-between mb-8">
              <span className={cn(
                'text-[10px] font-mono uppercase tracking-[0.2em]',
                plan.isPopular ? 'text-[#a3e5c9] font-bold' : 'text-[#9ca3af] dark:text-[#6b7280]'
              )}>
                {plan.code}
              </span>
              {plan.isPopular && (
                <span className="text-[10px] font-mono uppercase tracking-widest bg-[#f28500] text-white px-2.5 py-1 font-bold">
                  Đề xuất
                </span>
              )}
            </div>

            {/* Plan Name & Description */}
            <div className="space-y-3 mb-8">
              <h3 className={cn(
                'text-2xl sm:text-3xl font-bold tracking-tight',
                plan.isPopular ? 'text-white' : 'text-[#111827] dark:text-white'
              )}>
                {plan.name}
              </h3>
              <p className={cn(
                'text-xs sm:text-sm leading-relaxed',
                plan.isPopular ? 'text-[#bde3d3]' : 'text-[#6b7280] dark:text-[#9ca3af]'
              )}>
                {plan.desc}
              </p>
            </div>

            {/* Price Box */}
            <div className={cn(
              'py-6 border-t border-b mb-8',
              plan.isPopular ? 'border-white/15' : 'border-[#f3f4f6] dark:border-[#1a1d21]'
            )}>
              <div className="flex items-baseline gap-1.5">
                <span className={cn(
                  'text-4xl sm:text-5xl font-bold tracking-tight font-mono',
                  plan.isPopular ? 'text-white' : 'text-[#111827] dark:text-white'
                )}>
                  {formatPrice(isYearly ? plan.yearlyPrice : plan.monthlyPrice)}
                </span>
                <span className={cn(
                  'text-xs font-mono',
                  plan.isPopular ? 'text-[#a3e5c9]' : 'text-[#9ca3af] dark:text-[#6b7280]'
                )}>
                  / tháng
                </span>
              </div>
              {isYearly && (
                <p className={cn(
                  'text-[11px] font-mono mt-1.5',
                  plan.isPopular ? 'text-[#bde3d3]' : 'text-[#9ca3af] dark:text-[#6b7280]'
                )}>
                  Thanh toán theo năm: {formatPrice(plan.yearlyPrice * 12)}
                </p>
              )}
            </div>

            {/* Features Checklist */}
            <div className="space-y-3.5 mb-10 flex-1">
              <span className={cn(
                'text-[10px] font-mono uppercase tracking-[0.2em] block mb-2',
                plan.isPopular ? 'text-[#a3e5c9]' : 'text-[#9ca3af]'
              )}>
                Quyền lợi bao gồm
              </span>
              {plan.features.map((feat) => (
                <div key={feat} className="flex items-start gap-3 text-xs leading-relaxed">
                  <span className={cn(
                    'w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5',
                    plan.isPopular ? 'bg-white/20 text-[#a3e5c9]' : 'bg-[#fff7ed] dark:bg-[#2a1a0e] text-[#f28500]'
                  )}>
                    <Check size={10} strokeWidth={3} />
                  </span>
                  <span className={plan.isPopular ? 'text-white' : 'text-[#374151] dark:text-[#d1d5db]'}>
                    {feat}
                  </span>
                </div>
              ))}
            </div>

            {/* CTA Button */}
            <Link
              href={plan.href}
              className={cn(
                'block w-full py-3.5 text-xs font-mono uppercase tracking-widest text-center transition-all cursor-pointer font-bold',
                plan.isPopular
                  ? 'bg-[#f28500] hover:bg-[#e07500] text-white shadow-md active:scale-[0.99]'
                  : 'bg-[#fafafa] dark:bg-[#16191d] border border-[#e5e7eb] dark:border-[#333638] text-[#111827] dark:text-white hover:bg-[#f28500] hover:border-[#f28500] hover:text-white active:scale-[0.99]'
              )}
            >
              {plan.cta}
            </Link>
          </motion.div>
        ))}

        {/* ── ROW 2: GUARANTEE & B2B PERKS (8/12 & 4/12) ── */}

        {/* Tile A: 100% Refund Guarantee (8/12) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.24 }}
          className="md:col-span-8 bg-[#fafafa] dark:bg-[#111418] p-8 sm:p-12 flex flex-col sm:flex-row sm:items-center justify-between gap-8"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-none border border-[#e5e7eb] dark:border-[#333638] bg-white dark:bg-[#1a1d21] text-[#f28500] flex items-center justify-center shrink-0">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="text-base font-bold text-[#111827] dark:text-white mb-1">
                Cam kết hoàn tiền 100% trong 7 ngày
              </h4>
              <p className="text-xs sm:text-sm text-[#6b7280] dark:text-[#9ca3af] leading-relaxed max-w-xl">
                Nếu bạn không hài lòng với tốc độ tiến bộ phát âm hay hệ thống học, chúng tôi hoàn lại toàn bộ chi phí không kèm câu hỏi nào.
              </p>
            </div>
          </div>

          {/* Payment Gateways */}
          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {['VISA', 'MASTERCARD', 'MOMO', 'VNPAY', 'APPLE PAY'].map((brand) => (
              <span
                key={brand}
                className="text-[10px] font-mono tracking-widest text-[#9ca3af] dark:text-[#6b7280] border border-[#e5e7eb] dark:border-[#262b32] px-2.5 py-1 bg-white dark:bg-[#16191d]"
              >
                {brand}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Tile B: B2B Enterprise (4/12) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.5, delay: 0.32 }}
          className="md:col-span-4 bg-white dark:bg-[#0f1115] p-8 sm:p-12 flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 text-[#9ca3af] dark:text-[#6b7280] mb-3">
              <Building2 size={16} />
              <span className="text-[10px] font-mono uppercase tracking-widest">Doanh Nghiệp &amp; Tổ Chức</span>
            </div>
            <h4 className="text-lg font-bold text-[#111827] dark:text-white mb-2">
              Đào tạo tiếng Anh B2B
            </h4>
            <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] leading-relaxed">
              Tùy biến từ vựng chuyên ngành và quản lý tiến độ nhân sự qua Enterprise Dashboard.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#f28500] hover:text-[#111827] dark:hover:text-white transition-colors mt-6 group font-bold"
          >
            <span>Liên hệ tư vấn B2B</span>
            <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* ── ROW 3: Full-width editorial footer strip ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="md:col-span-12 bg-[#f8f9fa] dark:bg-[#16191d] flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-8 sm:px-12 lg:px-16 py-6"
        >
          <p className="text-sm font-medium text-[#111827] dark:text-white max-w-[60ch]">
            Tất cả gói tài khoản đều bao gồm cập nhật bài học mới hàng tuần và AI Speech Engine v3.4.
          </p>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[#9ca3af] dark:text-[#6b7280]">
            Bảo mật 256-Bit SSL · Hỗ trợ 24/7
          </span>
        </motion.div>

      </div>
    </section>
  );
}

