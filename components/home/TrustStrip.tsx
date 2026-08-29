'use client';

import React from 'react';
import { Award, CheckCircle, BarChart3, Globe2, BookOpen } from 'lucide-react';

export default function TrustStrip() {
  const metrics = [
    {
      icon: Award,
      label: 'Khung Chuẩn Châu Âu',
      value: 'CEFR A1 - C2',
    },
    {
      icon: BookOpen,
      label: 'Thư Viện Từ Vựng',
      value: 'Oxford 3,000+',
    },
    {
      icon: BarChart3,
      label: 'Độ Chính Xác AI',
      value: '99.2% Phonetics',
    },
    {
      icon: CheckCircle,
      label: 'Bài Tập Hoàn Thành',
      value: '10,000,000+',
    },
    {
      icon: Globe2,
      label: 'Học Viên Quốc Tế',
      value: '12+ Quốc Gia',
    },
  ];

  return (
    <section className="py-6 md:py-7 border-b border-border/40 bg-card/40 backdrop-blur-xs">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 items-center">
          {metrics.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-3.5 ${idx === 4 ? 'col-span-2 md:col-span-1 justify-center md:justify-start' : ''}`}
            >
              <div className="h-10 w-10 rounded-xl bg-brand/10 text-brand flex items-center justify-center shrink-0 border border-brand/20">
                <item.icon size={20} />
              </div>
              <div className="space-y-0.5">
                <p className="text-sm font-black text-foreground tracking-tight leading-none">{item.value}</p>
                <p className="text-[11px] text-muted-foreground font-medium leading-tight">{item.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
