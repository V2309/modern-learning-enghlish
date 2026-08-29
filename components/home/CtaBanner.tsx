'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export default function CtaBanner() {
  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container mx-auto px-4 md:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.55 }}
          className="relative rounded-[2.5rem] bg-primary text-primary-foreground p-8 md:p-12 overflow-hidden shadow-2xl border border-border"
        >
          {/* Subtle Grid / Texture */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Glowing Accents */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-brand/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-brand/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-7">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/10 text-brand border border-white/10 backdrop-blur-md">
              <Sparkles size={14} className="text-brand" />
              <span className="text-white">Bắt đầu miễn phí hôm nay</span>
            </div>

            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-[1.18] text-white">
              Sẵn Sàng Làm Chủ Tiếng Anh Với <span className="text-brand">Linguify</span>?
            </h2>

            <p className="text-sm sm:text-base text-white/70 leading-relaxed max-w-xl mx-auto">
              Tham gia cùng 50,000+ học viên đang luyện phản xạ nghe nói mỗi ngày. Kiểm tra trình độ đầu vào miễn phí chỉ trong 5 phút.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/courses"
                className="w-full sm:w-auto px-8 py-4 bg-brand text-brand-foreground hover:bg-brand/90 rounded-2xl font-black text-sm transition-all shadow-lg shadow-brand/25 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Bắt Đầu Học Ngay</span>
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/auth/sign-in"
                className="w-full sm:w-auto px-7 py-4 bg-white/10 hover:bg-white/15 text-white border border-white/20 rounded-2xl font-bold text-sm transition-all text-center backdrop-blur-md"
              >
                Đăng Nhập Tài Khoản
              </Link>
            </div>

            <div className="pt-4 flex items-center justify-center gap-6 text-xs text-white/60">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={15} className="text-brand" />
                <span>Không cần thẻ tín dụng</span>
              </div>
              <span>•</span>
              <div><span>Học thử 7 ngày miễn phí</span></div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
