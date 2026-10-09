'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, BookOpen } from 'lucide-react';
import Pagination from '@/components/Pagination';

interface TopicProgress {
  id: string;
  name: string;
  completedCount: number;
  totalCount: number;
  percentage: number;
}

interface TopicProgressListProps {
  topicCompletionRates: TopicProgress[];
}

const PAGE_SIZE = 4;

export default function TopicProgressList({ topicCompletionRates }: TopicProgressListProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(topicCompletionRates.length / PAGE_SIZE));

  const paginatedTopics = topicCompletionRates.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="bg-white dark:bg-[#0f1115] border border-[#e5e7eb] dark:border-[#1f2937] p-6 sm:p-7 relative overflow-hidden">
      {/* Technical Crosshairs */}
      <span className="absolute top-2.5 left-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>
      <span className="absolute top-2.5 right-2.5 text-[10px] text-muted-foreground/30 pointer-events-none z-10 font-bold">+</span>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-5 border-b border-[#e5e7eb] dark:border-[#1f2937] mb-6">
        <div>
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#9ca3af] dark:text-[#6b7280] block mb-1.5 font-bold">
            Thư viện từ vựng · Chuẩn Oxford
          </span>
          <h3 className="text-lg sm:text-xl font-bold text-[#111827] dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-[#f28500]" />
            Tiến trình từ vựng theo chủ đề
          </h3>
        </div>

        <Link
          href="/vocabulary"
          className="btn-3d-brand px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Khám phá tất cả</span>
          <ArrowRight size={13} />
        </Link>
      </div>

      {topicCompletionRates.length === 0 ? (
        <div className="text-center py-10 text-xs text-[#9ca3af] dark:text-[#6b7280] border border-dashed border-[#e5e7eb] dark:border-[#1f2937]">
          Chưa có chủ đề từ vựng nào được ghi nhận.
        </div>
      ) : (
        <div className="space-y-6">
          {/* Hairline 2-column grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-[#e5e7eb] dark:bg-[#1f2937] border border-[#e5e7eb] dark:border-[#1f2937]">
            {paginatedTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/vocabulary/topic/${topic.id}`}
                className="group relative bg-white dark:bg-[#0f1115] hover:bg-[#fafafa] dark:hover:bg-[#14171b] p-5 flex flex-col justify-between transition-colors select-none overflow-hidden"
              >
                {/* Light Sweep Sheen */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent pointer-events-none z-20" />

                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h4 className="text-sm font-bold text-[#111827] dark:text-white group-hover:text-[#f28500] transition-colors line-clamp-1">
                      {topic.name}
                    </h4>
                    <span className="text-xs font-bold text-[#f28500] shrink-0">
                      {topic.percentage}%
                    </span>
                  </div>

                  <p className="text-xs text-[#6b7280] dark:text-[#9ca3af] font-medium mb-4">
                    {topic.completedCount} / {topic.totalCount} từ đã thuộc
                  </p>
                </div>

                {/* Slim hairline progress bar */}
                <div className="w-full h-1 bg-[#f3f4f6] dark:bg-[#1f2937] overflow-hidden">
                  <div
                    className="h-full bg-[#f28500] transition-all duration-500"
                    style={{ width: `${topic.percentage}%` }}
                  />
                </div>
              </Link>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={topicCompletionRates.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}
