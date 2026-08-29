'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';
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
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand" />
          <h2 className="text-base font-bold text-foreground">Tiến Trình Từ Vựng Theo Chủ Đề</h2>
        </div>
        <Link href="/vocabulary" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
          Thư viện từ vựng <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {topicCompletionRates.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground italic bg-card border border-border/80 rounded-3xl">
          Chưa có chủ đề từ vựng nào được tìm thấy.
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {paginatedTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-5 rounded-3xl bg-card border border-border/80 flex flex-col justify-between gap-3 hover:border-brand/40 shadow-xs transition-all"
              >
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-foreground line-clamp-1">{topic.name}</h3>
                  <p className="text-[11px] text-muted-foreground">
                    {topic.completedCount} / {topic.totalCount} từ đã thuộc
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden border border-border/40">
                    <div
                      className="bg-brand h-full rounded-full transition-all duration-500"
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-brand w-8 text-right">{topic.percentage}%</span>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={topicCompletionRates.length}
            pageSize={PAGE_SIZE}
            onPageChange={setCurrentPage}
          />
        </>
      )}
    </div>
  );
}
