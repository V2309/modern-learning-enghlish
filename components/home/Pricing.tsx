'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pricing() {
  const pricingPlans = [
    {
      name: "Cơ Bản",
      price: "$29",
      features: [
        "Phù hợp cho người mới bắt đầu",
        "Truy cập khóa học",
        "Hỗ trợ cộng đồng",
      ],
      isPopular: false,
    },
    {
      name: "Phổ Thông",
      price: "$59",
      features: [
        "Truy cập tất cả khóa học",
        "Học cùng giáo viên bản ngữ",
        "Tài liệu PDF độc quyền",
      ],
      isPopular: true,
    },
    {
      name: "Chuyên Sâu",
      price: "$99",
      features: [
        "Lộ trình cá nhân hóa",
        "Hỗ trợ 1-1",
        "Cam kết đầu ra có chứng chỉ",
      ],
      isPopular: false,
    },
  ];

  return (
    <section className="py-20 md:py-16 bg-[#f8fafc] dark:bg-background">
      <div className="container mx-auto px-4 md:px-8 space-y-12">
        <div className="space-y-4 max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-foreground">
            Bảng Giá Khóa Học
          </h2>
          <p className="text-slate-500 dark:text-muted-foreground font-medium text-sm md:text-base">
            Chọn lộ trình phù hợp với mục tiêu của bạn.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
          {pricingPlans.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className={cn(
                "p-8 rounded-3xl bg-white dark:bg-card border flex flex-col justify-between space-y-8 relative hover:shadow-xl transition-all duration-300",
                plan.isPopular 
                  ? "border-primary shadow-md scale-102 z-10" 
                  : "border-border/80 shadow-sm"
              )}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full shadow-sm">
                  Phổ biến nhất
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-700 dark:text-muted-foreground mb-2">
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-slate-900 dark:text-foreground">{plan.price}</span>
                    <span className="text-xs text-slate-400 dark:text-muted-foreground">/tháng</span>
                  </div>
                </div>

                <ul className="space-y-3.5 pt-2 border-t border-border">
                  {plan.features.map((feat, fidx) => (
                    <li key={fidx} className="flex items-center gap-3 text-sm text-slate-600 dark:text-muted-foreground">
                      <Check size={16} className="text-primary shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                href="/auth/sign-up"
                className={cn(
                  "w-full py-4.5 rounded-2xl text-xs font-black transition-all cursor-pointer text-center block",
                  plan.isPopular
                    ? "bg-primary text-white hover:bg-primary/95 shadow-md shadow-primary/20"
                    : "bg-[#f1f5f9] dark:bg-muted text-slate-800 dark:text-foreground hover:bg-slate-200/80 dark:hover:bg-muted/80"
                )}
              >
                Đăng Ký Ngay
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
