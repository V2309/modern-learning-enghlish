'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, BookOpen, Sparkles } from 'lucide-react';
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
    <div className="space-y-5">
      <div className="flex items-center justify-between border-b border-border/60 pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-brand" />
          <h2 className="text-base font-black text-foreground">Tiến Trình Từ Vựng Theo Chủ Đề</h2>
        </div>
        <Link href="/vocabulary" className="text-xs font-bold text-brand hover:underline flex items-center gap-1">
          Thư viện từ vựng <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {topicCompletionRates.length === 0 ? (
        <div className="text-center py-8 text-xs text-muted-foreground italic bg-muted/30 border border-border/80 rounded-3xl font-medium">
          Chưa có chủ đề từ vựng nào được tìm thấy.
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 gap-4">
            {paginatedTopics.map((topic) => (
              <Link
                key={topic.id}
                href={`/vocabulary/topic/${topic.id}`}
                className="p-5 rounded-3xl card-3d-base bg-card border-border/80 border-b-4 flex flex-col justify-between gap-3.5 group select-none cursor-pointer"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-black text-foreground line-clamp-1 group-hover:text-brand transition-colors">
                      {topic.name}
                    </h3>
                    <p className="text-[11px] text-muted-foreground font-medium">
                      {topic.completedCount} / {topic.totalCount} từ đã thuộc
                    </p>
                  </div>
                  <div className="h-8 w-8 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand shrink-0 shadow-xs">
                    <Sparkles size={14} />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted/90 rounded-full h-2.5 overflow-hidden border border-border/60 shadow-inner p-0.5">
                    <div
                      className="bg-gradient-to-r from-brand to-orange-400 h-full rounded-full transition-all duration-500 shadow-xs"
                      style={{ width: `${topic.percentage}%` }}
                    />
                  </div>
                  <span className="text-xs font-black text-brand w-9 text-right">{topic.percentage}%</span>
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
        </>
      )}
    </div>
  );
}
